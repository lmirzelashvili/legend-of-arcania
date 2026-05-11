import { ItemRarity } from '@/types/game.types';

export function getRarityBorder(rarity: ItemRarity): string {
  return rarity === ItemRarity.PRESTIGE ? 'from-purple-700 to-purple-600' : 'from-amber-700 to-amber-600';
}

export function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case ItemRarity.PRESTIGE:
      return 'border-yellow-500 bg-yellow-900/30';
    case ItemRarity.REGULAR:
    default:
      return 'border-gray-500 bg-gray-800/50';
  }
}

export function getRarityTextColor(rarity: ItemRarity): string {
  switch (rarity) {
    case ItemRarity.PRESTIGE:
      return 'text-purple-400';
    case ItemRarity.REGULAR:
    default:
      return 'text-amber-400';
  }
}

export function formatStatName(stat: string): string {
  return stat.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}
