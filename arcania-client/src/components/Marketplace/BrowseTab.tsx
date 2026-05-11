import React, { useState, useEffect, useRef } from 'react';
import {
  Character,
  ItemType,
  ItemRarity,
  Class,
  MarketplaceListing,
  ListingFilters,
  ListingSortOption,
  ListingCurrency,
} from '@/types/game.types';
import { marketplaceAPI } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { CurrencyDisplay } from '@/components/ui';
import PixelPanel from '@/components/ui/PixelPanel';
import { ListingCard, ListingDetailsModal, FilterSelect, RangeInput, Pagination } from './marketplace-utils';

interface BrowseTabProps {
  character: Character;
}

interface BrowseFilters {
  type: ItemType | 'ALL';
  rarity: ItemRarity | 'ALL';
  class: Class | 'ALL';
  currency: ListingCurrency | 'ALL';
  search: string;
  minLevel: string;
  maxLevel: string;
  minPrice: string;
  maxPrice: string;
  minEnhancement: string;
  maxEnhancement: string;
  sort: ListingSortOption;
}

const DEFAULT_FILTERS: BrowseFilters = {
  type: 'ALL',
  rarity: 'ALL',
  class: 'ALL',
  currency: 'ALL',
  search: '',
  minLevel: '',
  maxLevel: '',
  minPrice: '',
  maxPrice: '',
  minEnhancement: '',
  maxEnhancement: '',
  sort: 'relevant',
};

const BrowseTab: React.FC<BrowseTabProps> = ({ character }) => {
  const { setCurrentCharacter } = useCharacterStore();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);

  // Consolidated filter state
  const [filters, setFilters] = useState<BrowseFilters>(DEFAULT_FILTERS);
  const updateFilter = <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  // Pagination (server-driven)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    loadListings(1);
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const loadListings = async (page?: number) => {
    const targetPage = page ?? currentPage;
    setLoading(true);
    try {
      const apiFilters: ListingFilters = {};
      if (filters.type !== 'ALL') apiFilters.type = filters.type;
      if (filters.rarity !== 'ALL') apiFilters.rarity = filters.rarity;
      if (filters.class !== 'ALL') apiFilters.class = filters.class;
      if (filters.currency !== 'ALL') apiFilters.currency = filters.currency;
      if (filters.search) apiFilters.search = filters.search;
      if (filters.minLevel) apiFilters.minLevel = parseInt(filters.minLevel);
      if (filters.maxLevel) apiFilters.maxLevel = parseInt(filters.maxLevel);
      if (filters.minPrice) apiFilters.minPrice = parseInt(filters.minPrice);
      if (filters.maxPrice) apiFilters.maxPrice = parseInt(filters.maxPrice);
      if (filters.minEnhancement) apiFilters.minEnhancement = parseInt(filters.minEnhancement);
      if (filters.maxEnhancement) apiFilters.maxEnhancement = parseInt(filters.maxEnhancement);

      const result = await marketplaceAPI.getListings(apiFilters, filters.sort, targetPage, PAGE_SIZE);
      setListings(result.listings);
      setTotalListings(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload on filter/sort change (debounced)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadListings(1), 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters]);

  const handlePurchase = async (listing: MarketplaceListing) => {
    if (!character) return;
    setPurchasing(listing.id);
    try {
      const result = await marketplaceAPI.purchaseListing(character.id, listing.id);
      if (result.success) {
        if (result.updatedCharacter) setCurrentCharacter(result.updatedCharacter);
        setSelectedListing(null);
        loadListings(currentPage);
      }
    } catch (error: any) {
      console.error('Failed to purchase:', error);
    } finally {
      setPurchasing(null);
    }
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const currentGold = character.resources?.gold || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadListings(page);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-3 space-y-4">
        <PixelPanel title="SEARCH" color="amber">
          <input
            type="text"
            placeholder="Search items or sellers..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full bg-black border-2 border-gray-800 px-3 py-2 text-gray-300 text-[8px] focus:outline-none focus:border-amber-600 font-pixel"
          />
        </PixelPanel>

        <PixelPanel title="FILTERS" color="gray">
          <div className="space-y-3">
            <FilterSelect label="TYPE" value={filters.type} onChange={(v) => updateFilter('type', v as any)}
              options={[['ALL', 'ALL'], ['WEAPON', 'WEAPON'], ['ARMOR', 'ARMOR'], ['ACCESSORY', 'ACCESSORY'], ['CONSUMABLE', 'CONSUMABLE'], ['MATERIAL', 'MATERIAL']]} />

            <FilterSelect label="CLASS" value={filters.class} onChange={(v) => updateFilter('class', v as any)}
              options={[['ALL', 'ALL'], ['PALADIN', 'PALADIN'], ['FIGHTER', 'FIGHTER'], ['RANGER', 'RANGER'], ['CLERIC', 'CLERIC'], ['MAGE', 'MAGE']]} />

            <FilterSelect label="QUALITY" value={filters.rarity} onChange={(v) => updateFilter('rarity', v as any)}
              options={[['ALL', 'ALL'], ['REGULAR', 'REGULAR'], ['PRESTIGE', 'PRESTIGE']]} />

            <FilterSelect label="CURRENCY" value={filters.currency} onChange={(v) => updateFilter('currency', v as any)}
              options={[['ALL', 'ALL'], ['gold', 'GOLD'], ['arcanite', 'ARCANITE']]} />

            <RangeInput label="LEVEL" minValue={filters.minLevel} maxValue={filters.maxLevel} onMinChange={(v) => updateFilter('minLevel', v)} onMaxChange={(v) => updateFilter('maxLevel', v)} />
            <RangeInput label="PRICE" minValue={filters.minPrice} maxValue={filters.maxPrice} onMinChange={(v) => updateFilter('minPrice', v)} onMaxChange={(v) => updateFilter('maxPrice', v)} />
            <RangeInput label="ENHANCEMENT" minValue={filters.minEnhancement} maxValue={filters.maxEnhancement} onMinChange={(v) => updateFilter('minEnhancement', v)} onMaxChange={(v) => updateFilter('maxEnhancement', v)} />

            <button onClick={clearFilters} className="relative w-full group">
              <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
              <div className="absolute inset-[2px] bg-black"></div>
              <div className="relative py-2 text-gray-400 group-hover:text-gray-200 text-[8px] transition-colors">CLEAR ALL</div>
            </button>
          </div>
        </PixelPanel>

        <PixelPanel title="YOUR BALANCE" color="gray">
          <div className="space-y-2 text-[8px]">
            <div className="flex justify-between items-center text-gray-400">
              <span>GOLD:</span>
              <CurrencyDisplay type="gold" amount={currentGold} size="sm" />
            </div>
            <div className="flex justify-between items-center text-gray-400">
              <span>ARCANITE:</span>
              <CurrencyDisplay type="arcanite" amount={character.resources?.arcanite || 0} size="sm" />
            </div>
            <div className="flex justify-between text-gray-400 pt-2 border-t-2 border-gray-900">
              <span>TOTAL LISTINGS:</span>
              <span className="text-white">{totalListings}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>SELLER FEE:</span>
              <span className="text-amber-400">5%</span>
            </div>
          </div>
        </PixelPanel>
      </div>

      {/* Listings Grid */}
      <div className="lg:col-span-9">
        {/* Sort Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-500 text-[8px]">
            {totalListings} LISTINGS • PAGE {currentPage}/{totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-[8px]">SORT:</span>
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value as ListingSortOption)}
              className="bg-black border-2 border-gray-800 px-2 py-1 text-gray-300 text-[8px] focus:outline-none focus:border-amber-600 font-pixel"
            >
              <option value="relevant">RELEVANT</option>
              <option value="price_asc">PRICE: LOW → HIGH</option>
              <option value="price_desc">PRICE: HIGH → LOW</option>
              <option value="recent">MOST RECENT</option>
            </select>
          </div>
        </div>

        {loading ? (
          <PixelPanel title="LOADING..." color="gray">
            <div className="text-center py-12 text-gray-600 text-[8px]">LOADING AUCTION HOUSE...</div>
          </PixelPanel>
        ) : listings.length === 0 ? (
          <PixelPanel title="NO LISTINGS" color="gray">
            <div className="text-center py-12 text-gray-600 text-[8px]">NO LISTINGS FOUND</div>
          </PixelPanel>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  currentGold={currentGold}
                  currentArcanite={character.resources?.arcanite || 0}
                  isPurchasing={purchasing === listing.id}
                  onSelect={() => setSelectedListing(listing)}
                  onPurchase={() => handlePurchase(listing)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}
          </>
        )}
      </div>

      {/* Listing Details Modal */}
      {selectedListing && (
        <ListingDetailsModal
          listing={selectedListing}
          currentGold={currentGold}
          currentArcanite={character.resources?.arcanite || 0}
          isPurchasing={purchasing === selectedListing.id}
          onClose={() => setSelectedListing(null)}
          onPurchase={() => handlePurchase(selectedListing)}
        />
      )}
    </div>
  );
};

export default BrowseTab;
