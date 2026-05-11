import React from 'react';
import { MarketplaceListing } from '@/types/game.types';
import { CurrencyDisplay } from '@/components/ui';
import { getItemIcon } from '@/config/asset-registry';

// ==================== SHARED COMPONENTS ====================

export const ListingCard: React.FC<{
  listing: MarketplaceListing;
  currentGold: number;
  currentArcanite: number;
  isPurchasing: boolean;
  onSelect: () => void;
  onPurchase: () => void;
}> = React.memo(({ listing, currentGold, currentArcanite, isPurchasing, onSelect, onPurchase }) => {
  const { item, price, currency, sellerName, source } = listing;
  const canAfford = currency === 'gold' ? currentGold >= price : currentArcanite >= price;
  const borderColor = item.rarity === 'PRESTIGE' ? 'from-purple-700 to-purple-600' : 'from-amber-700 to-amber-600';

  return (
    <div onClick={onSelect} className="relative cursor-pointer group">
      <div className={`absolute inset-0 bg-gradient-to-r ${borderColor} group-hover:brightness-110 transition-all`}></div>
      <div className="absolute inset-[3px] bg-black outline outline-1 outline-white/20"></div>
      <div className="relative p-4">
        {/* Seller Badge */}
        {source !== 'npc' && (
          <div className="absolute top-2 right-2 text-[6px] text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 border border-cyan-800">
            PLAYER
          </div>
        )}

        {/* Icon */}
        <div className="w-full h-24 flex items-center justify-center mb-3">
          <img src={item.icon || getItemIcon(item.name)} alt={item.name} className={`${item.type === 'CONSUMABLE' ? 'w-10 h-10' : 'w-20 h-20'} object-contain`} />
        </div>

        {/* Name + Enhancement */}
        <div className="text-amber-400 text-[8px] mb-1 truncate">
          {item.name.toUpperCase()}
          {(item.enhancementLevel || 0) > 0 && (
            <span className="text-yellow-400"> +{item.enhancementLevel}</span>
          )}
        </div>

        {/* Seller */}
        <div className="text-[6px] text-gray-600 mb-2 truncate">{sellerName}</div>

        {/* Stats Preview */}
        <div className="space-y-0.5 text-[6px] mb-3">
          {item.type === 'CONSUMABLE' && (
            <>
              {(item.maxHp || 0) > 0 && <div className="flex justify-between text-red-400"><span>HP:</span><span>+{item.maxHp}</span></div>}
              {(item.maxMana || 0) > 0 && <div className="flex justify-between text-blue-400"><span>MANA:</span><span>+{item.maxMana}</span></div>}
            </>
          )}
          {(item.physicalAttack || 0) > 0 && <div className="flex justify-between text-red-400"><span>ATK:</span><span>+{item.physicalAttack}</span></div>}
          {(item.magicAttack || 0) > 0 && <div className="flex justify-between text-purple-400"><span>MAG:</span><span>+{item.magicAttack}</span></div>}
          {(item.physicalDefense || 0) > 0 && <div className="flex justify-between text-blue-400"><span>DEF:</span><span>+{item.physicalDefense}</span></div>}
          {(item.magicResistance || 0) > 0 && <div className="flex justify-between text-cyan-400"><span>RES:</span><span>+{item.magicResistance}</span></div>}
        </div>

        {/* Price + Buy */}
        <div className="border-t-2 border-gray-900 pt-3 space-y-2">
          <div className="flex items-center gap-1.5">
            <img
              src={currency === 'gold' ? '/assets/icons/gold.png' : '/assets/icons/arcanite.png'}
              alt={currency} className="w-3.5 h-3.5"
            />
            <span className={`text-[8px] ${canAfford ? (currency === 'gold' ? 'text-amber-400' : 'text-cyan-400') : 'text-red-400'}`}>
              {price.toLocaleString()}
            </span>
            {listing.quantity > 1 && (
              <span className="text-[6px] text-gray-600">x{listing.quantity}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onPurchase(); }}
            disabled={!canAfford || isPurchasing}
            className="relative w-full group/btn disabled:opacity-50"
          >
            <div className={`absolute inset-0 ${canAfford ? 'bg-gradient-to-r from-green-700 to-green-600 group-hover/btn:brightness-110' : 'bg-gray-800'} transition-all`}></div>
            <div className="absolute inset-[2px] bg-black"></div>
            <div className={`relative py-2 text-[8px] ${canAfford ? 'text-green-400 group-hover/btn:text-green-300' : 'text-gray-700'} transition-colors`}>
              {isPurchasing ? 'BUYING...' : 'BUY'}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
});

export const ListingDetailsModal: React.FC<{
  listing: MarketplaceListing;
  currentGold: number;
  currentArcanite: number;
  isPurchasing: boolean;
  onClose: () => void;
  onPurchase: () => void;
}> = ({ listing, currentGold, currentArcanite, isPurchasing, onClose, onPurchase }) => {
  const { item, price, currency, sellerName, source, quantity } = listing;
  const canAfford = currency === 'gold' ? currentGold >= price : currentArcanite >= price;
  const borderColor = item.rarity === 'PRESTIGE' ? 'from-purple-700 to-purple-600' : 'from-amber-700 to-amber-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 font-pixel">
      <div className="max-w-2xl w-full">
        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${borderColor}`} style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
          }}></div>
          <div className="absolute inset-[4px] bg-black"></div>
          <div className="relative p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="text-amber-400 text-[12px] mb-2">
                  {item.name.toUpperCase()}
                  {(item.enhancementLevel || 0) > 0 && (
                    <span className="text-yellow-400"> +{item.enhancementLevel}</span>
                  )}
                </div>
                <div className="text-gray-500 text-[8px]">
                  {item.type} • {item.rarity}
                  {quantity > 1 && ` • x${quantity}`}
                  {source !== 'npc' && (
                    <span className="text-cyan-400 ml-2">PLAYER LISTING</span>
                  )}
                </div>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-[10px] ml-4">
                X
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left: Icon & Description */}
              <div>
                <div className="w-full h-40 flex items-center justify-center mb-4 bg-gray-900 border-2 border-gray-800">
                  <img src={item.icon || getItemIcon(item.name)} alt={item.name} className={`${item.type === 'CONSUMABLE' ? 'w-16 h-16' : 'w-32 h-32'} object-contain`} />
                </div>
                {item.description && (
                  <div className="text-gray-500 text-[8px] leading-relaxed mb-3">{item.description}</div>
                )}
                <div className="text-gray-600 text-[7px]">
                  Seller: <span className="text-gray-400">{sellerName}</span>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="space-y-3">
                <div className="text-amber-400 text-[8px] mb-3 pb-2 border-b-2 border-gray-900">
                  {item.type === 'CONSUMABLE' ? 'EFFECTS' : 'STATISTICS'}
                </div>

                {item.type === 'CONSUMABLE' && (
                  <>
                    {(item.maxHp || 0) > 0 && <StatRow label="RESTORES HP" value={`+${item.maxHp}`} color="text-red-400" />}
                    {(item.maxMana || 0) > 0 && <StatRow label="RESTORES MANA" value={`+${item.maxMana}`} color="text-blue-400" />}
                  </>
                )}

                {(item.physicalAttack || 0) > 0 && <StatRow label="PHYSICAL ATK" value={`+${item.physicalAttack}`} color="text-red-400" />}
                {(item.magicAttack || 0) > 0 && <StatRow label="MAGIC ATK" value={`+${item.magicAttack}`} color="text-purple-400" />}
                {(item.physicalDefense || 0) > 0 && <StatRow label="PHYSICAL DEF" value={`+${item.physicalDefense}`} color="text-blue-400" />}
                {(item.magicResistance || 0) > 0 && <StatRow label="MAGIC RES" value={`+${item.magicResistance}`} color="text-cyan-400" />}
                {(item.strength || 0) > 0 && <StatRow label="STRENGTH" value={`+${item.strength}`} color="text-orange-400" />}
                {(item.agility || 0) > 0 && <StatRow label="AGILITY" value={`+${item.agility}`} color="text-green-400" />}
                {(item.intelligence || 0) > 0 && <StatRow label="INTELLIGENCE" value={`+${item.intelligence}`} color="text-indigo-400" />}
                {(item.vitality || 0) > 0 && <StatRow label="VITALITY" value={`+${item.vitality}`} color="text-red-400" />}
                {(item.spirit || 0) > 0 && <StatRow label="SPIRIT" value={`+${item.spirit}`} color="text-cyan-400" />}
                {item.requiredLevel > 1 && <StatRow label="REQ. LEVEL" value={item.requiredLevel.toString()} color="text-yellow-400" />}
                {item.requiredClass && <StatRow label="REQ. CLASS" value={item.requiredClass} color="text-yellow-400" />}
              </div>
            </div>

            {/* Purchase Section */}
            <div className="mt-6 pt-6 border-t-2 border-gray-900">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-gray-500 text-[8px] mb-1">PRICE</div>
                  <div className="flex items-center gap-1.5">
                    <img
                      src={currency === 'gold' ? '/assets/icons/gold.png' : '/assets/icons/arcanite.png'}
                      alt={currency} className="w-5 h-5"
                    />
                    <span className={`text-[12px] ${canAfford ? (currency === 'gold' ? 'text-amber-400' : 'text-cyan-400') : 'text-red-400'}`}>
                      {price.toLocaleString()}
                    </span>
                  </div>
                  {source !== 'npc' && (
                    <div className="text-gray-600 text-[7px] mt-1">Seller receives {Math.floor(price * 0.95).toLocaleString()} after 5% fee</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-gray-500 text-[8px] mb-1">YOUR {currency.toUpperCase()}</div>
                  <CurrencyDisplay type={currency} amount={currency === 'gold' ? currentGold : currentArcanite} size="sm" />
                </div>
              </div>

              <button
                onClick={onPurchase}
                disabled={!canAfford || isPurchasing}
                className="relative w-full group disabled:opacity-50"
              >
                <div className={`absolute inset-0 ${canAfford ? 'bg-gradient-to-r from-green-700 to-green-600 group-hover:brightness-110' : 'bg-gray-800'} transition-all`}></div>
                <div className="absolute inset-[2px] bg-black"></div>
                <div className={`relative py-3 text-[10px] ${canAfford ? 'text-green-400 group-hover:text-green-300' : 'text-gray-700'} transition-colors`}>
                  {isPurchasing ? 'PURCHASING...' : canAfford ? 'PURCHASE' : `NOT ENOUGH ${currency.toUpperCase()}`}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatRow: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between text-[8px]">
    <span className="text-gray-500">{label}:</span>
    <span className={color}>{value}</span>
  </div>
);

export const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-gray-500 text-[8px] mb-1 tracking-wider">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-black border-2 border-gray-800 px-2 py-1.5 text-gray-300 text-[8px] focus:outline-none focus:border-amber-600 font-pixel"
    >
      {options.map(([val, label]) => (
        <option key={val} value={val}>{label}</option>
      ))}
    </select>
  </div>
);

export const RangeInput: React.FC<{
  label: string;
  minValue: string;
  maxValue: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}> = ({ label, minValue, maxValue, onMinChange, onMaxChange }) => (
  <div>
    <label className="block text-gray-500 text-[8px] mb-1 tracking-wider">{label}</label>
    <div className="flex gap-1 items-center">
      <input
        type="number"
        placeholder="Min"
        value={minValue}
        onChange={(e) => onMinChange(e.target.value)}
        className="w-full bg-black border-2 border-gray-800 px-2 py-1.5 text-gray-300 text-[7px] focus:outline-none focus:border-amber-600 font-pixel"
      />
      <span className="text-gray-600 text-[8px]">-</span>
      <input
        type="number"
        placeholder="Max"
        value={maxValue}
        onChange={(e) => onMaxChange(e.target.value)}
        className="w-full bg-black border-2 border-gray-800 px-2 py-1.5 text-gray-300 text-[7px] focus:outline-none focus:border-amber-600 font-pixel"
      />
    </div>
  </div>
);

export const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-between items-center pt-6 border-t-2 border-gray-900">
    <button
      onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      disabled={currentPage === 1}
      className="relative group disabled:opacity-30"
    >
      <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
      <div className="absolute inset-[2px] bg-black"></div>
      <div className="relative px-4 py-2 text-gray-400 group-hover:text-gray-200 text-[8px] transition-colors">PREV</div>
    </button>

    <div className="text-gray-500 text-[8px]">PAGE {currentPage} OF {totalPages}</div>

    <button
      onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      disabled={currentPage >= totalPages}
      className="relative group disabled:opacity-30"
    >
      <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
      <div className="absolute inset-[2px] bg-black"></div>
      <div className="relative px-4 py-2 text-gray-400 group-hover:text-gray-200 text-[8px] transition-colors">NEXT</div>
    </button>
  </div>
);
