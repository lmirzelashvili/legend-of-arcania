import React, { useState, useEffect } from 'react';
import { Character, MarketplaceListing } from '@/types/game.types';
import { marketplaceAPI } from '@/services/api.service';
import { useVaultStore } from '@/store/useVaultStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { CurrencyDisplay } from '@/components/ui';
import { getItemIcon } from '@/config/asset-registry';
import PixelPanel from '@/components/ui/PixelPanel';

interface MyListingsTabProps {
  character: Character;
}

const MyListingsTab: React.FC<MyListingsTabProps> = ({ character }) => {
  const { setCurrentCharacter } = useCharacterStore();
  const { loadVault } = useVaultStore();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadMyListings();
  }, []);

  const loadMyListings = async () => {
    setLoading(true);
    try {
      const data = await marketplaceAPI.getMyListings();
      setListings(data);
    } catch (error) {
      console.error('Failed to load my listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (listingId: string) => {
    setCancelling(listingId);
    try {
      const result = await marketplaceAPI.cancelListing(listingId, character.id);
      if (result.success) {
        if (result.updatedCharacter) setCurrentCharacter(result.updatedCharacter);
        if (result.updatedVault) loadVault();
        loadMyListings();
      }
    } catch (error) {
      console.error('Failed to cancel listing:', error);
    } finally {
      setCancelling(null);
    }
  };

  return (
    <PixelPanel title="MY ACTIVE LISTINGS" color="amber">
      {loading ? (
        <div className="text-center py-12 text-gray-600 text-[8px]">LOADING...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 text-[10px] mb-2">NO ACTIVE LISTINGS</div>
          <div className="text-gray-700 text-[8px]">Use the SELL ITEMS tab to list items for sale.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center gap-4 p-4 border-2 border-gray-800">
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <img src={listing.item.icon || getItemIcon(listing.item.name)} alt={listing.item.name} className="w-10 h-10 object-contain" />
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-[9px] ${listing.item.rarity === 'PRESTIGE' ? 'text-purple-400' : 'text-amber-400'}`}>
                  {listing.item.name.toUpperCase()}
                  {listing.quantity > 1 && <span className="text-gray-500"> x{listing.quantity}</span>}
                  {(listing.item.enhancementLevel || 0) > 0 && (
                    <span className="text-yellow-400"> +{listing.item.enhancementLevel}</span>
                  )}
                </div>
                <div className="text-[7px] text-gray-600">
                  Listed {new Date(listing.listedAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <CurrencyDisplay type={listing.currency} amount={listing.price} size="sm" />
              </div>

              <button
                onClick={() => handleCancel(listing.id)}
                disabled={cancelling === listing.id}
                className="relative group flex-shrink-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-700 group-hover:brightness-110 transition-all"></div>
                <div className="absolute inset-[2px] bg-black"></div>
                <div className="relative px-4 py-2 text-red-400 group-hover:text-red-300 text-[8px] transition-colors">
                  {cancelling === listing.id ? '...' : 'CANCEL'}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </PixelPanel>
  );
};

export default MyListingsTab;
