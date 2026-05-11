import React, { useState, useEffect } from 'react';
import {
  Character,
  VendorDefinition,
  VendorItem,
  VendorId,
  Class,
  Item,
} from '@/types/game.types';
import { vendorAPI } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useVaultStore } from '@/store/useVaultStore';
import { PixelPanel, CurrencyDisplay } from '@/components/ui';
import { getItemIcon } from '@/config/asset-registry';

interface Props {
  character: Character;
}

const VENDOR_THEMES: Record<VendorId, { panelColor: 'amber' | 'gray' | 'green'; border: string; bg: string; text: string; hoverBorder: string }> = {
  blacksmith: { panelColor: 'amber', border: 'border-red-500', bg: 'bg-red-500/5', text: 'text-red-400', hoverBorder: 'hover:border-red-700' },
  alchemist: { panelColor: 'green', border: 'border-green-500', bg: 'bg-green-500/5', text: 'text-green-400', hoverBorder: 'hover:border-green-700' },
  arcanist: { panelColor: 'gray', border: 'border-purple-500', bg: 'bg-purple-500/5', text: 'text-purple-400', hoverBorder: 'hover:border-purple-700' },
};

const Vendors: React.FC<Props> = ({ character }) => {
  const [activeVendor, setActiveVendor] = useState<VendorId>('blacksmith');
  const [vendors, setVendors] = useState<VendorDefinition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await vendorAPI.getVendors();
      setVendors(data);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
    setLoading(false);
  };

  const currentVendor = vendors.find(v => v.id === activeVendor);
  const theme = VENDOR_THEMES[activeVendor];

  const vendorTabs: { id: VendorId; label: string; icon: string }[] = [
    { id: 'blacksmith', label: 'BLACKSMITH', icon: '⚔' },
    { id: 'alchemist', label: 'ALCHEMIST', icon: '⚗' },
    { id: 'arcanist', label: 'ARCANIST', icon: '✦' },
  ];

  if (loading) {
    return (
      <div className="font-pixel text-center text-gray-500 py-20 text-[10px]">
        Loading vendors...
      </div>
    );
  }

  return (
    <div className="font-pixel">
      {/* Vendor Tab Navigation */}
      <div className="flex gap-1 mb-6" role="tablist">
        {vendorTabs.map((tab) => {
          const t = VENDOR_THEMES[tab.id];
          const isActive = activeVendor === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveVendor(tab.id)}
              className={`flex-1 py-3 text-[9px] tracking-wider border-2 transition-colors flex items-center justify-center gap-2 ${
                isActive
                  ? `${t.border} ${t.text} ${t.bg}`
                  : 'border-gray-800 text-gray-500 hover:text-gray-400 hover:border-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Vendor Content */}
      {currentVendor && (
        activeVendor === 'arcanist'
          ? <ArcanistShop vendor={currentVendor} character={character} theme={theme} />
          : <ItemShop vendor={currentVendor} character={character} theme={theme} />
      )}
    </div>
  );
};

// ==================== ITEM SHOP (Blacksmith & Alchemist) ====================

interface ShopProps {
  vendor: VendorDefinition;
  character: Character;
  theme: { panelColor: 'amber' | 'gray' | 'green'; border: string; bg: string; text: string; hoverBorder: string };
}

const ItemShop: React.FC<ShopProps> = ({ vendor, character, theme }) => {
  const { setCurrentCharacter } = useCharacterStore();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<VendorItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [classFilter, setClassFilter] = useState<Class | 'ALL'>('ALL');

  // Filter items
  let filteredItems = vendor.items;

  if (activeCategory !== 'ALL') {
    filteredItems = filteredItems.filter(vi => vi.category === activeCategory);
  }

  if (classFilter !== 'ALL') {
    filteredItems = filteredItems.filter(vi => {
      if (!vi.item) return true;
      return !vi.item.requiredClass || vi.item.requiredClass === classFilter;
    });
  }

  // Sort by level then price
  filteredItems = [...filteredItems].sort((a, b) => {
    const levelDiff = (a.requiredLevel || 0) - (b.requiredLevel || 0);
    if (levelDiff !== 0) return levelDiff;
    return a.price - b.price;
  });

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchasing(true);
    setMessage(null);

    try {
      const result = await vendorAPI.purchaseItem(
        character.id,
        vendor.id,
        selectedItem.id,
        quantity
      );

      setMessage({ text: result.message, type: 'success' });
      if (result.updatedCharacter) {
        setCurrentCharacter(result.updatedCharacter);
      }
      setQuantity(1);
    } catch (err: any) {
      setMessage({ text: err.message || 'Purchase failed', type: 'error' });
    }

    setPurchasing(false);
  };

  const currentGold = character.resources?.gold || 0;

  return (
    <div className="flex gap-4">
      {/* Left Sidebar - Filters */}
      <div className="w-48 shrink-0 space-y-4">
        {/* Vendor Info */}
        <PixelPanel color={theme.panelColor}>
          <div className="text-center space-y-2">
            <div className={`text-[12px] ${theme.text}`}>{vendor.title.toUpperCase()}</div>
            <div className="text-gray-500 text-[8px]">{vendor.description}</div>
          </div>
        </PixelPanel>

        {/* Balance */}
        <PixelPanel color="amber">
          <div className="text-center">
            <div className="text-gray-500 text-[8px] mb-2">YOUR GOLD</div>
            <CurrencyDisplay type="gold" amount={currentGold} size="lg" />
          </div>
        </PixelPanel>

        {/* Category Filter */}
        <PixelPanel color="gray">
          <div className="text-gray-400 text-[8px] mb-3">CATEGORY</div>
          <div className="space-y-1">
            <FilterButton
              label="ALL"
              active={activeCategory === 'ALL'}
              onClick={() => { setActiveCategory('ALL'); setSelectedItem(null); }}
              theme={theme}
            />
            {vendor.categories.map(cat => (
              <FilterButton
                key={cat}
                label={cat.toUpperCase()}
                active={activeCategory === cat}
                onClick={() => { setActiveCategory(cat); setSelectedItem(null); }}
                theme={theme}
              />
            ))}
          </div>
        </PixelPanel>

        {/* Class Filter (for Blacksmith) */}
        {vendor.id === 'blacksmith' && (
          <PixelPanel color="gray">
            <div className="text-gray-400 text-[8px] mb-3">CLASS</div>
            <div className="space-y-1">
              <FilterButton label="ALL CLASSES" active={classFilter === 'ALL'} onClick={() => setClassFilter('ALL')} theme={theme} />
              {Object.values(Class).map(cls => (
                <FilterButton
                  key={cls}
                  label={cls}
                  active={classFilter === cls}
                  onClick={() => setClassFilter(cls)}
                  theme={theme}
                />
              ))}
            </div>
          </PixelPanel>
        )}
      </div>

      {/* Main Content - Item Grid */}
      <div className="flex-1 space-y-4">
        {/* Stats Bar */}
        <div className="flex items-center justify-between text-[8px] text-gray-500 border-b border-gray-800 pb-2">
          <span>{filteredItems.length} items available</span>
          <span>{activeCategory !== 'ALL' ? activeCategory : 'All Categories'}</span>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredItems.map(vi => (
            <VendorItemCard
              key={vi.id}
              vendorItem={vi}
              isSelected={selectedItem?.id === vi.id}
              onClick={() => { setSelectedItem(vi); setQuantity(1); setMessage(null); }}
              characterLevel={character.level}
              theme={theme}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center text-gray-600 text-[9px] py-12">
            No items match your filters.
          </div>
        )}
      </div>

      {/* Right Panel - Selected Item Details */}
      {selectedItem && (
        <div className="w-64 shrink-0">
          <PixelPanel color={theme.panelColor}>
            <div className="space-y-4">
              {/* Item Header */}
              <div className="border-b border-gray-800 pb-3">
                <div className={`text-[11px] ${theme.text} mb-1`}>{selectedItem.name.toUpperCase()}</div>
                {selectedItem.item && (
                  <div className="text-gray-500 text-[8px]">
                    {selectedItem.item.type} {selectedItem.item.rarity === 'PRESTIGE' && '• PRESTIGE'}
                  </div>
                )}
                <div className="text-gray-600 text-[8px] mt-2">{selectedItem.description}</div>
              </div>

              {/* Stats */}
              {selectedItem.item && (
                <div className="border-b border-gray-800 pb-3 space-y-1">
                  <ItemStats item={selectedItem.item} />
                </div>
              )}

              {/* Level Requirement */}
              {selectedItem.requiredLevel && selectedItem.requiredLevel > 0 && (
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">Required Level</span>
                  <span className={character.level >= selectedItem.requiredLevel ? 'text-green-400' : 'text-red-400'}>
                    {selectedItem.requiredLevel}
                  </span>
                </div>
              )}

              {/* Class Requirement */}
              {selectedItem.item?.requiredClass && (
                <div className="flex justify-between text-[8px]">
                  <span className="text-gray-500">Class</span>
                  <span className={character.class === selectedItem.item.requiredClass ? 'text-green-400' : 'text-red-400'}>
                    {selectedItem.item.requiredClass}
                  </span>
                </div>
              )}

              {/* Quantity Selector */}
              {selectedItem.item?.stackable && (
                <div className="border-t border-gray-800 pt-3">
                  <div className="text-gray-500 text-[8px] mb-2">QUANTITY</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-[10px]"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                      className="w-16 h-8 bg-black border border-gray-700 text-center text-white text-[10px] font-pixel"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      className="w-8 h-8 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-[10px]"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className="border-t border-gray-800 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[8px]">TOTAL</span>
                  <CurrencyDisplay
                    type={selectedItem.currency === 'arcanite' ? 'arcanite' : 'gold'}
                    amount={selectedItem.price * quantity}
                    size="md"
                  />
                </div>
                {currentGold < selectedItem.price * quantity && (
                  <div className="text-red-400 text-[7px] mt-1 text-right">
                    Not enough Gold
                  </div>
                )}
              </div>

              {/* Buy Button */}
              <button
                onClick={handlePurchase}
                disabled={
                  purchasing ||
                  currentGold < selectedItem.price * quantity ||
                  (selectedItem.requiredLevel !== undefined && character.level < selectedItem.requiredLevel)
                }
                className={`w-full py-3 text-[10px] tracking-wider border-2 transition-colors ${
                  purchasing ||
                  currentGold < selectedItem.price * quantity ||
                  (selectedItem.requiredLevel !== undefined && character.level < selectedItem.requiredLevel)
                    ? 'border-gray-800 text-gray-600 bg-gray-900/30 cursor-not-allowed'
                    : `${theme.border} ${theme.text} hover:${theme.bg}`
                }`}
              >
                {purchasing ? 'PURCHASING...' : `BUY ${quantity > 1 ? `(${quantity})` : ''}`}
              </button>

              {/* Message */}
              {message && (
                <div className={`text-[8px] text-center py-2 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message.text}
                </div>
              )}
            </div>
          </PixelPanel>
        </div>
      )}
    </div>
  );
};

// ==================== ARCANIST SHOP ====================

const ArcanistShop: React.FC<ShopProps> = ({ vendor, character }) => {
  const { setCurrentCharacter } = useCharacterStore();
  const { loadVault } = useVaultStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handlePurchase = async (vendorItem: VendorItem) => {
    setPurchasing(vendorItem.id);
    setMessage(null);

    try {
      const result = await vendorAPI.purchaseItem(
        character.id,
        'arcanist',
        vendorItem.id,
        1
      );

      setMessage({ text: result.message, type: 'success' });
      if (result.updatedCharacter) {
        setCurrentCharacter(result.updatedCharacter);
      }
      if (result.updatedVault) {
        loadVault();
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Purchase failed', type: 'error' });
    }

    setPurchasing(null);
  };

  // Group items by category
  const categories = vendor.categories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PixelPanel color="gray">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-purple-400 text-[12px] mb-1">{vendor.title.toUpperCase()}</div>
            <div className="text-gray-500 text-[8px]">{vendor.description}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-[8px] mb-1">YOUR ARCANITE</div>
            <CurrencyDisplay type="arcanite" amount={character.resources?.arcanite || 0} size="lg" />
          </div>
        </div>
      </PixelPanel>

      {/* Message */}
      {message && (
        <div className={`text-[9px] text-center py-2 border ${message.type === 'success' ? 'border-green-800 text-green-400 bg-green-500/5' : 'border-red-800 text-red-400 bg-red-500/5'}`}>
          {message.text}
        </div>
      )}

      {/* Category Sections */}
      {categories.map(cat => {
        const catItems = vendor.items.filter(vi => vi.category === cat);
        if (catItems.length === 0) return null;

        return (
          <div key={cat}>
            <div className="text-gray-400 text-[9px] tracking-wider mb-3 border-b border-gray-800 pb-2">
              {cat.toUpperCase()}
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {catItems.map(vi => (
                <ArcanistItemCard
                  key={vi.id}
                  vendorItem={vi}
                  isPurchasing={purchasing === vi.id}
                  onPurchase={() => handlePurchase(vi)}
                  walletArcanite={character.resources?.arcanite || 0}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==================== SHARED COMPONENTS ====================

const FilterButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
  theme: { text: string; bg: string };
}> = ({ label, active, onClick, theme }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 text-[8px] transition-colors ${
      active
        ? `${theme.text} ${theme.bg}`
        : 'text-gray-500 hover:text-gray-400'
    }`}
  >
    {label}
  </button>
);

const VendorItemCard: React.FC<{
  vendorItem: VendorItem;
  isSelected: boolean;
  onClick: () => void;
  characterLevel: number;
  theme: { border: string; bg: string; text: string; hoverBorder: string };
}> = ({ vendorItem, isSelected, onClick, characterLevel, theme }) => {
  const levelLocked = vendorItem.requiredLevel !== undefined && characterLevel < vendorItem.requiredLevel;
  const isPrestige = vendorItem.item?.rarity === 'PRESTIGE';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 border-2 transition-colors relative ${
        isSelected
          ? `${theme.border} ${theme.bg}`
          : levelLocked
            ? 'border-gray-800 bg-gray-900/30 opacity-50'
            : `border-gray-800 hover:border-gray-700 bg-black`
      }`}
    >
      {/* Prestige badge */}
      {isPrestige && (
        <div className="absolute top-1 right-1 text-[6px] text-amber-400 bg-amber-500/10 px-1">★</div>
      )}

      <div className="flex items-start gap-3">
        {/* Item icon */}
        <div className={`w-10 h-10 border ${isPrestige ? 'border-amber-600' : 'border-gray-700'} bg-gray-900 flex items-center justify-center shrink-0`}>
          <img
            src={vendorItem.item?.icon || getItemIcon(vendorItem.name)}
            alt={vendorItem.name}
            className="w-8 h-8 object-contain"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className={`text-[9px] truncate ${isPrestige ? 'text-amber-400' : 'text-white'}`}>
            {vendorItem.name}
          </div>
          <div className="text-gray-600 text-[7px] mt-0.5">
            {vendorItem.item?.requiredClass && <span>{vendorItem.item.requiredClass} • </span>}
            LV {vendorItem.requiredLevel || 1}
          </div>

          {/* Key stats preview */}
          <div className="flex gap-2 mt-1 text-[7px]">
            {vendorItem.item?.physicalAttack ? (
              <span className="text-red-400">ATK {vendorItem.item.physicalAttack}</span>
            ) : null}
            {vendorItem.item?.magicAttack ? (
              <span className="text-purple-400">MATK {vendorItem.item.magicAttack}</span>
            ) : null}
            {vendorItem.item?.physicalDefense ? (
              <span className="text-blue-400">DEF {vendorItem.item.physicalDefense}</span>
            ) : null}
            {vendorItem.item?.maxHp ? (
              <span className="text-red-400">+{vendorItem.item.maxHp} HP</span>
            ) : null}
            {vendorItem.item?.maxMana ? (
              <span className="text-blue-400">+{vendorItem.item.maxMana} MP</span>
            ) : null}
          </div>

          {/* Price */}
          <div className="mt-1.5">
            <CurrencyDisplay
              type={vendorItem.currency === 'arcanite' ? 'arcanite' : 'gold'}
              amount={vendorItem.price}
              size="xs"
            />
          </div>
        </div>
      </div>

      {/* Level lock indicator */}
      {levelLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-red-400 text-[8px]">LV {vendorItem.requiredLevel} REQ</span>
        </div>
      )}
    </button>
  );
};

const ArcanistItemCard: React.FC<{
  vendorItem: VendorItem;
  isPurchasing: boolean;
  onPurchase: () => void;
  walletArcanite: number;
}> = ({ vendorItem, isPurchasing, onPurchase, walletArcanite }) => {
  const canAfford = walletArcanite >= vendorItem.price;

  const actionIcons: Record<string, string> = {
    vault_upgrade: '📦',
    character_slot: '👤',
    gold_package: '💰',
  };

  const itemIcon = vendorItem.item?.icon || getItemIcon(vendorItem.name);
  const hasImageIcon = !vendorItem.specialAction && (vendorItem.item?.icon || vendorItem.category === 'Crafting Materials' || vendorItem.category === 'Crystals' || vendorItem.category === 'Gems');
  const emojiIcon = actionIcons[vendorItem.specialAction || ''] || '✦';

  return (
    <div className="p-4 border-2 relative border-gray-800 bg-black">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 border border-purple-800 bg-purple-500/5 flex items-center justify-center shrink-0">
          {hasImageIcon ? (
            <img src={itemIcon} alt={vendorItem.name} className="w-8 h-8 object-contain" />
          ) : (
            <span className="text-[14px]">{emojiIcon}</span>
          )}
        </div>
        <div>
          <div className="text-purple-300 text-[10px]">{vendorItem.name}</div>
          <div className="text-gray-500 text-[7px] mt-1">{vendorItem.description}</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <CurrencyDisplay type="arcanite" amount={vendorItem.price} size="sm" />

        <button
          onClick={onPurchase}
          disabled={isPurchasing || !canAfford}
          className={`px-4 py-2 text-[8px] tracking-wider border transition-colors ${
            isPurchasing || !canAfford
              ? 'border-gray-800 text-gray-600 cursor-not-allowed'
              : 'border-purple-500 text-purple-400 hover:bg-purple-500/10'
          }`}
        >
          {isPurchasing ? '...' : !canAfford ? 'INSUFFICIENT' : 'BUY'}
        </button>
      </div>
    </div>
  );
};

const ItemStats: React.FC<{ item: Item }> = ({ item }) => {
  const stats: { label: string; value: number; color: string }[] = [];

  if (item.physicalAttack) stats.push({ label: 'Physical ATK', value: item.physicalAttack, color: 'text-red-400' });
  if (item.magicAttack) stats.push({ label: 'Magic ATK', value: item.magicAttack, color: 'text-purple-400' });
  if (item.physicalDefense) stats.push({ label: 'Physical DEF', value: item.physicalDefense, color: 'text-blue-400' });
  if (item.magicResistance) stats.push({ label: 'Magic RES', value: item.magicResistance, color: 'text-cyan-400' });
  if (item.strength) stats.push({ label: 'STR', value: item.strength, color: 'text-red-400' });
  if (item.agility) stats.push({ label: 'AGI', value: item.agility, color: 'text-green-400' });
  if (item.intelligence) stats.push({ label: 'INT', value: item.intelligence, color: 'text-purple-400' });
  if (item.vitality) stats.push({ label: 'VIT', value: item.vitality, color: 'text-pink-400' });
  if (item.spirit) stats.push({ label: 'SPR', value: item.spirit, color: 'text-cyan-400' });
  if (item.maxHp) stats.push({ label: 'Restores HP', value: item.maxHp, color: 'text-red-400' });
  if (item.maxMana) stats.push({ label: 'Restores Mana', value: item.maxMana, color: 'text-blue-400' });
  if (item.criticalChance) stats.push({ label: 'Crit %', value: item.criticalChance, color: 'text-amber-400' });

  if (stats.length === 0) return null;

  return (
    <>
      {stats.map(s => (
        <div key={s.label} className="flex justify-between text-[8px]">
          <span className="text-gray-500">{s.label}</span>
          <span className={s.color}>+{s.value}</span>
        </div>
      ))}
    </>
  );
};

export default Vendors;
