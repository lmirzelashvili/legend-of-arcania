import React from 'react';
import { ItemRarity } from '@/types/game.types';

interface ItemTooltipProps {
  item: {
    name: string;
    rarity: ItemRarity | string;
    type?: string;
    requiredLevel?: number;
    description?: string;
    strength?: number;
    agility?: number;
    intelligence?: number;
    vitality?: number;
    spirit?: number;
    physicalAttack?: number;
    magicAttack?: number;
    physicalDefense?: number;
    magicResistance?: number;
    criticalChance?: number;
    criticalDamage?: number;
    attackSpeed?: number;
    hpRegen?: number;
    manaRegen?: number;
    equipmentSlot?: string;
    requiredClass?: string;
    sellPrice?: number;
  };
  rarityBorder: string;
  actionHint?: string;
  quantity?: number;
}

const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, rarityBorder, actionHint, quantity }) => {
  const isPrestige = item.rarity === 'PRESTIGE';

  const statFields: [string, number | undefined][] = [
    ['STRENGTH', item.strength],
    ['AGILITY', item.agility],
    ['INTELLIGENCE', item.intelligence],
    ['VITALITY', item.vitality],
    ['SPIRIT', item.spirit],
    ['PHYSICAL ATTACK', item.physicalAttack],
    ['MAGIC ATTACK', item.magicAttack],
    ['PHYSICAL DEFENSE', item.physicalDefense],
    ['MAGIC RESISTANCE', item.magicResistance],
    ['CRITICAL CHANCE', item.criticalChance],
    ['CRITICAL DAMAGE', item.criticalDamage],
    ['ATTACK SPEED', item.attackSpeed],
    ['HP REGEN', item.hpRegen],
    ['MANA REGEN', item.manaRegen],
  ];
  const activeStats = statFields.filter(([, v]) => v != null && v > 0);

  return (
    <div className="absolute z-50 mt-2 w-80 left-1/2 -translate-x-1/2 pointer-events-none">
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${rarityBorder}`} style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 2px, 2px 2px, 2px calc(100% - 2px), 100% calc(100% - 2px), 100% 100%, 0 100%, 0 calc(100% - 2px), calc(100% - 2px) calc(100% - 2px), calc(100% - 2px) 2px, 0 2px)'
        }}></div>
        <div className="absolute inset-[2px] bg-black"></div>
        <div className="relative p-4 font-pixel">
          {/* Item Name & Rarity */}
          <div className="mb-3">
            <div className={`text-[10px] mb-1 ${
              isPrestige ? 'text-purple-400' : 'text-amber-400'
            }`}>
              {item.name.toUpperCase()}
            </div>
            <div className="flex gap-2 text-[6px]">
              <span className={`${
                isPrestige ? 'text-purple-500' : 'text-amber-500'
              }`}>
                {item.rarity}
              </span>
              {item.type && (
                <>
                  <span className="text-gray-700">&bull;</span>
                  <span className="text-gray-400">{item.type}</span>
                </>
              )}
              {item.requiredLevel && (
                <>
                  <span className="text-gray-700">&bull;</span>
                  <span className="text-green-400">LV {item.requiredLevel}</span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-3 text-gray-400 text-[7px] leading-relaxed">
              {item.description}
            </div>
          )}

          {/* Stats */}
          {activeStats.length > 0 && (
            <div className="mb-3 space-y-1">
              <div className="text-gray-600 text-[6px] mb-1">STATS:</div>
              {activeStats.map(([label, value]) => (
                <div key={label} className="flex justify-between text-[7px]">
                  <span className="text-gray-500">{label}:</span>
                  <span className="text-green-400">+{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Equipment Slot */}
          {item.equipmentSlot && (
            <div className="mb-2 text-[7px]">
              <span className="text-gray-600">SLOT: </span>
              <span className="text-cyan-400">{item.equipmentSlot.toUpperCase()}</span>
            </div>
          )}

          {/* Class Restriction */}
          {item.requiredClass && (
            <div className="mb-2 text-[7px]">
              <span className="text-gray-600">CLASS: </span>
              <span className="text-blue-400">{item.requiredClass.toUpperCase()}</span>
            </div>
          )}

          {/* Quantity */}
          {quantity != null && quantity > 1 && (
            <div className="mb-2 text-[7px]">
              <span className="text-gray-600">QUANTITY: </span>
              <span className="text-amber-400">{quantity}</span>
            </div>
          )}

          {/* Value */}
          {item.sellPrice && (
            <div className="pt-2 border-t border-gray-900 text-[7px]">
              <span className="text-gray-600">VALUE: </span>
              <span className="text-amber-400">{item.sellPrice} GOLD</span>
            </div>
          )}

          {/* Action Hint */}
          {actionHint && (
            <div className="mt-3 pt-2 border-t border-gray-900 text-center text-gray-700 text-[6px]">
              {actionHint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ItemTooltip);
