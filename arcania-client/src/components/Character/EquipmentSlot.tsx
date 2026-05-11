import React from 'react';
import { ItemRarity } from '@/types/game.types';
import { getItemIcon } from '@/config/asset-registry';
import ItemTooltip from '../ui/ItemTooltip';

interface EquipmentSlotProps {
  slotKey: string;
  label: string;
  small?: boolean;
  large?: boolean;
  equipment: Record<string, any>;
  hoveredSlot: string | null;
  setHoveredSlot: (slot: string | null) => void;
  onUnequip: (slotKey: string) => void;
  getRarityBorder: (rarity: ItemRarity) => string;
  getPlaceholderIcon: (slotKey: string) => string;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({
  slotKey,
  label,
  small,
  large,
  equipment,
  hoveredSlot,
  setHoveredSlot,
  onUnequip,
  getRarityBorder,
  getPlaceholderIcon,
}) => {
  const equippedItem = equipment[slotKey];
  const isEmpty = !equippedItem;

  return (
    <div
      className="relative "
      onMouseEnter={() => setHoveredSlot(slotKey)}
      onMouseLeave={() => setHoveredSlot(null)}
    >
      {/* label available via tooltip on hover */}
      <div
        onClick={() => equippedItem && onUnequip(slotKey)}
        className={`${small ? 'w-14 h-14' : large ? 'w-24 h-32' : 'w-20 h-20'} p-[3px] cursor-pointer group transition-all ${
          isEmpty ? 'bg-gray-800' : `bg-gradient-to-r ${getRarityBorder(equippedItem.rarity)} group-hover:brightness-110`
        }`}
      >
        <div className="w-full h-full bg-black flex items-center justify-center">
          {equippedItem ? (
            <img src={equippedItem.icon || getItemIcon(equippedItem.name)} alt={equippedItem.name} className={`${small ? 'w-8 h-8' : large ? 'w-12 h-20' : 'w-12 h-12'} object-contain`} />
          ) : (
            <img
              src={getPlaceholderIcon(slotKey)}
              alt={`${label} placeholder`}
              className={`${small ? 'w-8 h-8' : large ? 'w-12 h-20' : 'w-12 h-12'} object-contain opacity-10`}
            />
          )}
        </div>
      </div>

      {hoveredSlot === slotKey && isEmpty && (
        <div className="absolute z-50 mt-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black border border-gray-700 px-2 py-1 whitespace-nowrap text-center">
            <span className="text-gray-400 text-[7px] tracking-wider">{label}</span>
          </div>
        </div>
      )}

      {hoveredSlot === slotKey && equippedItem && (
        <ItemTooltip
          item={equippedItem}
          rarityBorder={getRarityBorder(equippedItem.rarity)}
          actionHint="CLICK TO UNEQUIP"
        />
      )}
    </div>
  );
};

export default React.memo(EquipmentSlot);
