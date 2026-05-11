import React, { useState } from 'react';
import { InventoryItem, ItemRarity } from '@/types/game.types';
import { getItemIcon } from '@/config/asset-registry';
import ItemTooltip from '../ui/ItemTooltip';

interface InventorySlotProps {
  item: InventoryItem | undefined;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  getRarityBorder: (rarity: ItemRarity) => string;
}

const InventorySlot: React.FC<InventorySlotProps> = ({
  item,
  index,
  isSelected,
  onClick,
  onDoubleClick,
  getRarityBorder,
}) => {
  const isEmpty = !item;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-20 h-20 p-[2px] cursor-pointer group transition-all ${
          isEmpty
            ? 'bg-gray-800 hover:bg-gray-700'
            : isSelected
            ? `bg-gradient-to-r ${getRarityBorder(item.item.rarity)} animate-pulse`
            : `bg-gradient-to-r ${getRarityBorder(item.item.rarity)} group-hover:brightness-110`
        }`}
      >
        <div className="w-full h-full bg-black flex items-center justify-center relative">
          {item ? (
            <>
              <img src={item.item.icon || getItemIcon(item.item.name)} alt={item.item.name} className="w-12 h-12 object-contain" />
              {item.quantity > 1 && (
                <div className="absolute bottom-1 right-1 bg-black border border-amber-600 text-amber-400 text-[6px] px-1">
                  {item.quantity}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-800 text-[6px]">{index + 1}</span>
          )}
        </div>
      </div>

      {/* Item Tooltip */}
      {isHovered && item && (
        <ItemTooltip
          item={item.item}
          rarityBorder={getRarityBorder(item.item.rarity)}
          quantity={item.quantity}
          actionHint={item.item.equipmentSlot ? 'DOUBLE-CLICK TO EQUIP' : undefined}
        />
      )}
    </div>
  );
};

export default React.memo(InventorySlot);
