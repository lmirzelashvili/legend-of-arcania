// Balance config — magic box reward tiers.
// Edit these values to tune reward counts, item tier ranges, and prestige chances per box.

export interface BoxTierConfig {
  name: string;
  minRewards: number;
  maxRewards: number;
  itemTierMin: number;
  itemTierMax: number;
  includeConsumables: boolean;
  includeCrystals: boolean;
  includeGems: boolean;
  /** Extra prestige roll chance added on top of base prestige rate (0–1). */
  prestigeChanceBonus: number;
}

export const BOX_TIERS: Record<string, BoxTierConfig> = {
  'Box of Ash': {
    name: 'Box of Ash',
    minRewards: 1,
    maxRewards: 2,
    itemTierMin: 1,
    itemTierMax: 2,
    includeConsumables: true,
    includeCrystals: false,
    includeGems: false,
    prestigeChanceBonus: 0,
  },
  'Box of Cinder': {
    name: 'Box of Cinder',
    minRewards: 1,
    maxRewards: 2,
    itemTierMin: 2,
    itemTierMax: 3,
    includeConsumables: false,
    includeCrystals: false,
    includeGems: false,
    prestigeChanceBonus: 0,
  },
  'Box of Ember': {
    name: 'Box of Ember',
    minRewards: 1,
    maxRewards: 3,
    itemTierMin: 3,
    itemTierMax: 4,
    includeConsumables: false,
    includeCrystals: true,
    includeGems: false,
    prestigeChanceBonus: 0,
  },
  'Box of Inferno': {
    name: 'Box of Inferno',
    minRewards: 2,
    maxRewards: 3,
    itemTierMin: 4,
    itemTierMax: 5,
    includeConsumables: false,
    includeCrystals: false,
    includeGems: true,
    prestigeChanceBonus: 0,
  },
  'Box of Eclipse': {
    name: 'Box of Eclipse',
    minRewards: 3,
    maxRewards: 3,
    itemTierMin: 5,
    itemTierMax: 5,
    includeConsumables: false,
    includeCrystals: false,
    includeGems: false,
    prestigeChanceBonus: 0.25, // 25% extra prestige chance
  },
};
