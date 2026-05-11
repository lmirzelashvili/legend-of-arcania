// Item Templates — All static game-design data for the equipment system
// This file is the single source of truth for item generation, stat ranges, and set bonuses.

import type { DerivedStatKey, ItemSpriteInfo } from '../types/index.js';
import {
  ENHANCEMENT_SUCCESS_RATES as _ENHANCEMENT_SUCCESS_RATES,
  ENHANCEMENT_FAILURE_RESULTS,
  ENHANCEMENT_STAT_BONUSES,
  CRYSTAL_REQUIREMENTS,
  PRESTIGE_DROP_CHANCE as _PRESTIGE_DROP_CHANCE,
} from '../config/balance/enhancement.js';

// ==================== ICON PATH HELPERS ====================

function iconPath(category: string, file: string): string {
  return `/assets/icons/items/${category}/${file}`;
}

const ARMOR_SLOT_ICON: Record<string, string> = {
  HEAD:   iconPath('armor', 'helm.svg'),
  CHEST:  iconPath('armor', 'chestplate.svg'),
  LEGS:   iconPath('armor', 'leggings.svg'),
  BOOTS:  iconPath('armor', 'boots.svg'),
  GLOVES: iconPath('armor', 'gauntlets.svg'),
};

const WEAPON_ICON: Record<string, string> = {
  longsword: iconPath('weapons', 'sword.svg'),
  mace:      iconPath('weapons', 'mace.svg'),
  flail:     iconPath('weapons', 'flail.svg'),
  waraxe:    iconPath('weapons', 'waraxe.svg'),
  dagger:    iconPath('weapons', 'dagger.svg'),
  shortbow:  iconPath('weapons', 'bow.svg'),
  crossbow:  iconPath('weapons', 'crossbow.svg'),
  staff:     iconPath('weapons', 'staff.svg'),
  spear:     iconPath('weapons', 'spear.svg'),
  scythe:    iconPath('weapons', 'scythe.svg'),
  gun:       iconPath('weapons', 'gun.svg'),
};

const SHIELD_ICON: Record<string, string> = {
  round:    iconPath('shields', 'shield-round.svg'),
  kite:     iconPath('shields', 'shield-kite.svg'),
  crusader: iconPath('shields', 'shield-crusader.svg'),
  heater:   iconPath('shields', 'shield-heater.svg'),
};

// Weapon icon lookup per class per tier — maps to the sprite types
const WEAPON_ICON_PER_CLASS: Record<string, string[]> = {
  PALADIN: ['mace', 'mace', 'mace', 'mace', 'mace'],
  FIGHTER: ['longsword', 'spear', 'longsword', 'scythe', 'longsword'],
  RANGER:  ['shortbow', 'shortbow', 'crossbow', 'gun', 'shortbow'],
  CLERIC:  ['staff', 'staff', 'staff', 'staff', 'staff'],
  MAGE:    ['staff', 'staff', 'staff', 'staff', 'staff'],
};

// ==================== TIER CONFIGURATION ====================

export interface TierConfig {
  tier: number;
  requiredLevel: number;
  bonusStatCount: number;
  armorSockets: number;
  weaponSockets: number;
  accessorySockets: number;
}

export const TIER_CONFIG: TierConfig[] = [
  { tier: 1, requiredLevel: 1,  bonusStatCount: 1, armorSockets: 1, weaponSockets: 1, accessorySockets: 0 },
  { tier: 2, requiredLevel: 11, bonusStatCount: 1, armorSockets: 2, weaponSockets: 1, accessorySockets: 0 },
  { tier: 3, requiredLevel: 26, bonusStatCount: 2, armorSockets: 3, weaponSockets: 2, accessorySockets: 0 },
  { tier: 4, requiredLevel: 41, bonusStatCount: 2, armorSockets: 4, weaponSockets: 2, accessorySockets: 0 },
  { tier: 5, requiredLevel: 56, bonusStatCount: 3, armorSockets: 5, weaponSockets: 3, accessorySockets: 0 },
];

export function getTierConfig(tier: number): TierConfig {
  return TIER_CONFIG[tier - 1] || TIER_CONFIG[0];
}

// ==================== IDENTITY STAT RANGES ====================

export interface StatRange {
  min: number;
  max: number;
}

// Identity stat per slot, indexed by tier (1-5)
export type IdentityStatConfig = {
  stat: DerivedStatKey;
  ranges: Record<number, StatRange>; // tier → range
};

export const IDENTITY_STATS: Record<string, IdentityStatConfig> = {
  HEAD: {
    stat: 'manaRegen',
    ranges: {
      1: { min: 0.4, max: 0.6 },
      2: { min: 0.8, max: 1.2 },
      3: { min: 1.2, max: 1.8 },
      4: { min: 2.0, max: 3.0 },
      5: { min: 3.2, max: 4.8 },
    },
  },
  CHEST: {
    stat: 'maxHp',
    ranges: {
      1: { min: 24, max: 36 },
      2: { min: 56, max: 84 },
      3: { min: 112, max: 168 },
      4: { min: 200, max: 300 },
      5: { min: 320, max: 480 },
    },
  },
  GLOVES: {
    stat: 'attackSpeed',
    ranges: {
      1: { min: 0.8, max: 1.2 },
      2: { min: 1.6, max: 2.4 },
      3: { min: 3.2, max: 4.8 },
      4: { min: 4.8, max: 7.2 },
      5: { min: 8, max: 12 },
    },
  },
  LEGS: {
    stat: 'hpRegen',
    ranges: {
      1: { min: 0.2, max: 0.4 },
      2: { min: 0.5, max: 0.7 },
      3: { min: 0.8, max: 1.2 },
      4: { min: 1.2, max: 1.8 },
      5: { min: 2.0, max: 3.0 },
    },
  },
  BOOTS: {
    stat: 'movementSpeed',
    ranges: {
      1: { min: 1.6, max: 2.4 },
      2: { min: 3.2, max: 4.8 },
      3: { min: 4.8, max: 7.2 },
      4: { min: 6.4, max: 9.6 },
      5: { min: 9.6, max: 14.4 },
    },
  },
  WEAPON_PHYS: {
    stat: 'physicalAttack',
    ranges: {
      1: { min: 4, max: 6 },
      2: { min: 10, max: 14 },
      3: { min: 20, max: 30 },
      4: { min: 36, max: 54 },
      5: { min: 60, max: 90 },
    },
  },
  WEAPON_MAGIC: {
    stat: 'magicAttack',
    ranges: {
      1: { min: 5, max: 7 },
      2: { min: 12, max: 18 },
      3: { min: 24, max: 36 },
      4: { min: 44, max: 66 },
      5: { min: 72, max: 108 },
    },
  },
  OFF_HAND: {
    stat: 'physicalDefense',
    ranges: {
      1: { min: 4, max: 6 },
      2: { min: 10, max: 14 },
      3: { min: 18, max: 26 },
      4: { min: 28, max: 42 },
      5: { min: 40, max: 60 },
    },
  },
  PENDANT: {
    stat: 'criticalChance',
    ranges: {
      1: { min: 0.4, max: 0.6 },
      2: { min: 0.8, max: 1.2 },
      3: { min: 1.6, max: 2.4 },
      4: { min: 2.4, max: 3.6 },
      5: { min: 4, max: 6 },
    },
  },
  RING: {
    stat: 'attackSpeed',
    ranges: {
      1: { min: 0.8, max: 1.2 },
      2: { min: 1.6, max: 2.4 },
      3: { min: 2.4, max: 3.6 },
      4: { min: 4, max: 6 },
      5: { min: 6.4, max: 9.6 },
    },
  },
  WINGS: {
    stat: 'attackSpeed',
    ranges: {
      1: { min: 0.8, max: 1.2 },
      2: { min: 1.6, max: 2.4 },
      3: { min: 3.2, max: 4.8 },
      4: { min: 4.8, max: 7.2 },
      5: { min: 8, max: 12 },
    },
  },
  CAPE: {
    stat: 'criticalChance',
    ranges: {
      1: { min: 0.4, max: 0.6 },
      2: { min: 0.8, max: 1.2 },
      3: { min: 1.6, max: 2.4 },
      4: { min: 2.4, max: 3.6 },
      5: { min: 4, max: 6 },
    },
  },
};

// ==================== BONUS STAT POOLS ====================

export const BONUS_STAT_POOLS: Record<string, DerivedStatKey[]> = {
  HEAD:         ['maxMana', 'magicAttack', 'magicResistance'],
  CHEST:        ['physicalDefense', 'magicResistance', 'hpRegen'],
  GLOVES:       ['physicalAttack', 'criticalChance', 'criticalDamage'],
  LEGS:         ['maxHp', 'movementSpeed', 'physicalDefense'],
  BOOTS:        ['attackSpeed', 'maxHp', 'hpRegen'],
  WEAPON_PHYS:  ['criticalChance', 'criticalDamage', 'attackSpeed', 'armorPenetration'],
  WEAPON_MAGIC: ['criticalChance', 'criticalDamage', 'attackSpeed', 'magicPenetration'],
  OFF_HAND:     ['maxHp', 'magicResistance', 'hpRegen'],
  PENDANT:      ['maxHp', 'physicalAttack', 'magicAttack', 'criticalDamage'],
  RING:         ['magicResistance', 'physicalDefense', 'maxMana', 'movementSpeed'],
  WINGS:        ['physicalDefense', 'maxHp', 'hpRegen'],
  CAPE:         ['magicResistance', 'maxMana', 'manaRegen'],
};

// ==================== BONUS STAT VALUE RANGES BY TIER ====================

// Generic bonus stat ranges — each stat has its own scaling per tier
export const BONUS_STAT_RANGES: Record<DerivedStatKey, Record<number, StatRange>> = {
  physicalAttack:    { 1: { min: 2, max: 4 }, 2: { min: 5, max: 8 }, 3: { min: 10, max: 16 }, 4: { min: 18, max: 28 }, 5: { min: 30, max: 48 } },
  magicAttack:       { 1: { min: 2, max: 4 }, 2: { min: 6, max: 10 }, 3: { min: 12, max: 20 }, 4: { min: 22, max: 34 }, 5: { min: 36, max: 56 } },
  physicalDefense:   { 1: { min: 2, max: 4 }, 2: { min: 5, max: 8 }, 3: { min: 9, max: 14 }, 4: { min: 14, max: 22 }, 5: { min: 20, max: 32 } },
  magicResistance:   { 1: { min: 2, max: 3 }, 2: { min: 4, max: 7 }, 3: { min: 8, max: 12 }, 4: { min: 12, max: 18 }, 5: { min: 18, max: 28 } },
  maxHp:             { 1: { min: 12, max: 20 }, 2: { min: 28, max: 44 }, 3: { min: 56, max: 88 }, 4: { min: 100, max: 160 }, 5: { min: 160, max: 256 } },
  maxMana:           { 1: { min: 8, max: 14 }, 2: { min: 20, max: 32 }, 3: { min: 40, max: 64 }, 4: { min: 72, max: 112 }, 5: { min: 112, max: 180 } },
  criticalChance:    { 1: { min: 0.3, max: 0.5 }, 2: { min: 0.6, max: 1.0 }, 3: { min: 1.2, max: 2.0 }, 4: { min: 2.0, max: 3.0 }, 5: { min: 3.2, max: 5.0 } },
  criticalDamage:    { 1: { min: 1, max: 2 }, 2: { min: 2, max: 4 }, 3: { min: 4, max: 7 }, 4: { min: 7, max: 12 }, 5: { min: 12, max: 20 } },
  attackSpeed:       { 1: { min: 0.5, max: 1.0 }, 2: { min: 1.0, max: 1.8 }, 3: { min: 2.0, max: 3.2 }, 4: { min: 3.2, max: 5.0 }, 5: { min: 5.0, max: 8.0 } },
  armorPenetration:  { 1: { min: 0.3, max: 0.5 }, 2: { min: 0.6, max: 1.0 }, 3: { min: 1.2, max: 2.0 }, 4: { min: 2.0, max: 3.2 }, 5: { min: 3.2, max: 5.0 } },
  magicPenetration:  { 1: { min: 0.3, max: 0.5 }, 2: { min: 0.6, max: 1.0 }, 3: { min: 1.2, max: 2.0 }, 4: { min: 2.0, max: 3.2 }, 5: { min: 3.2, max: 5.0 } },
  hpRegen:           { 1: { min: 0.2, max: 0.3 }, 2: { min: 0.4, max: 0.6 }, 3: { min: 0.6, max: 1.0 }, 4: { min: 1.0, max: 1.6 }, 5: { min: 1.6, max: 2.5 } },
  manaRegen:         { 1: { min: 0.2, max: 0.3 }, 2: { min: 0.4, max: 0.6 }, 3: { min: 0.6, max: 1.0 }, 4: { min: 1.0, max: 1.6 }, 5: { min: 1.6, max: 2.5 } },
  movementSpeed:     { 1: { min: 0.8, max: 1.2 }, 2: { min: 1.6, max: 2.4 }, 3: { min: 2.4, max: 3.6 }, 4: { min: 3.6, max: 5.4 }, 5: { min: 5.4, max: 8.0 } },
  dodgeChance:       { 1: { min: 0, max: 0 }, 2: { min: 0, max: 0 }, 3: { min: 0, max: 0 }, 4: { min: 0, max: 0 }, 5: { min: 0, max: 0 } },
  blockChance:       { 1: { min: 0, max: 0 }, 2: { min: 0, max: 0 }, 3: { min: 0, max: 0 }, 4: { min: 0, max: 0 }, 5: { min: 0, max: 0 } },
  prestigeDamage:    { 1: { min: 0, max: 0 }, 2: { min: 0, max: 0 }, 3: { min: 0, max: 0 }, 4: { min: 0, max: 0 }, 5: { min: 0, max: 0 } },
};

// ==================== PRESTIGE STATS ====================

export interface PrestigeStatConfig {
  stat: DerivedStatKey;
  values: Record<number, number>; // tier → fixed value
}

export const PRESTIGE_STATS: Record<string, PrestigeStatConfig> = {
  WEAPON:   { stat: 'prestigeDamage',    values: { 1: 5, 2: 10, 3: 18, 4: 28, 5: 45 } },
  HEAD:     { stat: 'criticalChance',    values: { 1: 0.5, 2: 1.0, 3: 1.5, 4: 2.5, 5: 4.0 } },
  CHEST:    { stat: 'hpRegen',           values: { 1: 0.3, 2: 0.6, 3: 1.0, 4: 1.6, 5: 2.5 } },
  GLOVES:   { stat: 'criticalDamage',    values: { 1: 1, 2: 2, 3: 4, 4: 7, 5: 12 } },
  LEGS:     { stat: 'movementSpeed',     values: { 1: 1, 2: 2, 3: 3, 4: 5, 5: 8 } },
  BOOTS:    { stat: 'attackSpeed',       values: { 1: 0.5, 2: 1.0, 3: 2.0, 4: 3.5, 5: 6.0 } },
  OFF_HAND: { stat: 'blockChance',       values: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 6 } },
  PENDANT:  { stat: 'criticalChance',    values: { 1: 0.4, 2: 0.8, 3: 1.2, 4: 2.0, 5: 3.5 } },
  RING:     { stat: 'attackSpeed',       values: { 1: 0.4, 2: 0.8, 3: 1.2, 4: 2.0, 5: 3.5 } },
  WINGS:    { stat: 'physicalDefense',   values: { 1: 4, 2: 10, 3: 18, 4: 30, 5: 50 } },
  CAPE:     { stat: 'magicAttack',       values: { 1: 5, 2: 12, 3: 22, 4: 36, 5: 60 } },
};

// ==================== BASE STAT RANGES (DAMAGE / DEFENSE) ====================

export const BASE_WEAPON_DAMAGE: Record<number, StatRange> = {
  1: { min: 9, max: 16 },
  2: { min: 18, max: 33 },
  3: { min: 36, max: 60 },
  4: { min: 63, max: 99 },
  5: { min: 99, max: 154 },
};

export const BASE_SHIELD_DEFENSE: Record<number, StatRange> = {
  1: { min: 12, max: 18 },
  2: { min: 28, max: 42 },
  3: { min: 48, max: 72 },
  4: { min: 80, max: 120 },
  5: { min: 120, max: 180 },
};

export const BASE_ARMOR_DEFENSE: Record<number, StatRange> = {
  1: { min: 5, max: 10 },
  2: { min: 12, max: 22 },
  3: { min: 24, max: 40 },
  4: { min: 40, max: 66 },
  5: { min: 66, max: 100 },
};

// ==================== ENHANCEMENT CONFIG ====================

// Re-export from balance config so existing consumers continue to work.
export const ENHANCEMENT_SUCCESS_RATES: Record<number, number> = _ENHANCEMENT_SUCCESS_RATES;

export type EnhanceFailureResult = 'crystal_consumed' | 'level_drop' | 'destroyed';

export function getEnhanceFailureResult(targetLevel: number): { result: EnhanceFailureResult; dropTo?: number } {
  for (const entry of ENHANCEMENT_FAILURE_RESULTS) {
    if (targetLevel <= entry.maxLevel) {
      return entry.dropTo !== undefined
        ? { result: entry.result, dropTo: entry.dropTo }
        : { result: entry.result };
    }
  }
  return { result: 'destroyed' };
}

export type CrystalType = 'spirit' | 'dominion';

export function getRequiredCrystal(targetLevel: number): CrystalType {
  for (const entry of CRYSTAL_REQUIREMENTS) {
    if (targetLevel <= entry.maxLevel) return entry.crystal;
  }
  return 'dominion';
}

// Enhancement stat bonus: cumulative % increase
// +1 to +5: +2% each = +10% at +5
// +6 to +7: +3% each = +16% at +7
// +8 to +10: +3% each = +25% at +10
// +11 to +15: +5% each = +50% at +15
export function getEnhancementBonusPercent(level: number): number {
  if (level <= 0) return 0;
  let bonus = 0;
  for (const tier of ENHANCEMENT_STAT_BONUSES) {
    for (let i = tier.fromLevel; i <= tier.toLevel && i <= level; i++) {
      bonus += tier.bonusPerLevel;
    }
  }
  return bonus;
}

// ==================== PRESTIGE CHANCE ====================

// Re-export from balance config so existing consumers continue to work.
export const PRESTIGE_DROP_CHANCE = _PRESTIGE_DROP_CHANCE;

// ==================== ITEM TEMPLATE INTERFACE ====================

export interface ItemTemplate {
  id: string;
  name: string;
  description: string;
  type: 'WEAPON' | 'ARMOR' | 'SHIELD' | 'ACCESSORY' | 'CONSUMABLE' | 'MATERIAL' | 'GEM' | 'CRYSTAL';
  slot?: string;       // HEAD, CHEST, LEGS, BOOTS, GLOVES, WEAPON, OFF_HAND, PENDANT, RING, WINGS, CAPE
  tier: number;        // 1-5
  requiredLevel: number;
  requiredClass?: string;
  baseStatMin: number; // defense or damage range
  baseStatMax: number;
  baseStatType?: 'defense' | 'damage';
  identityKey?: string; // Key into IDENTITY_STATS (e.g., 'HEAD', 'WEAPON_PHYS')
  bonusPoolKey?: string; // Key into BONUS_STAT_POOLS
  prestigeKey?: string;  // Key into PRESTIGE_STATS
  socketCount: number;
  setId?: string;
  stackable: boolean;
  maxStack: number;
  sellPrice: number;
  icon?: string;
  spriteInfo?: ItemSpriteInfo;
  // Consumable fields
  consumeEffect?: {
    hpRestore?: number;
    manaRestore?: number;
    buffStat?: string;
    buffValue?: number;
    buffDuration?: number;   // seconds
    cooldown?: number;       // cooldown in seconds
    specialEffect?: string;  // e.g. 'teleport_homeland', 'resurrect', 'random_buff'
  };
}

// ==================== GEM TEMPLATE ====================

export interface GemTemplateData {
  id: string;
  name: string;
  gemType: 'ANGUISH' | 'VOID' | 'LIGHT';
  statRanges: Partial<Record<DerivedStatKey, { min: number; max: number }>>;
  sellPrice: number;
  icon?: string;
}

export const GEM_TEMPLATES: GemTemplateData[] = [
  {
    id: 'gem_anguish', name: 'Gem of Anguish', gemType: 'ANGUISH',
    statRanges: {
      physicalAttack: { min: 15, max: 21 },
      magicAttack: { min: 18, max: 27 },
      criticalChance: { min: 1, max: 1.5 },
      criticalDamage: { min: 2.5, max: 4 },
      attackSpeed: { min: 1.4, max: 2.1 },
    },
    sellPrice: 500,
    icon: iconPath('gems', 'gem_of_anguish.png'),
  },
  {
    id: 'gem_void', name: 'Gem of Void', gemType: 'VOID',
    statRanges: {
      physicalDefense: { min: 15, max: 21 },
      magicResistance: { min: 15, max: 21 },
      maxHp: { min: 75, max: 105 },
    },
    sellPrice: 500,
    icon: iconPath('gems', 'gem_of_void.png'),
  },
  {
    id: 'gem_light', name: 'Gem of Light', gemType: 'LIGHT',
    statRanges: {
      maxMana: { min: 60, max: 84 },
      hpRegen: { min: 2, max: 3 },
      manaRegen: { min: 1.5, max: 2.2 },
      movementSpeed: { min: 1.4, max: 2.1 },
    },
    sellPrice: 500,
    icon: iconPath('gems', 'gem_of_light.png'),
  },
];

// ==================== SET BONUS DEFINITIONS ====================

export interface SetBonusEntry {
  setId: string;
  className?: string; // null = all classes
  piecesRequired: number;
  bonusStat: DerivedStatKey;
  bonusValue: number;
  bonusIsPercent: boolean;
}

export const SET_BONUSES: SetBonusEntry[] = [
  // Paladin armor sets
  { setId: 'paladin_t1', className: 'PALADIN', piecesRequired: 2, bonusStat: 'maxHp',           bonusValue: 30,  bonusIsPercent: false },
  { setId: 'paladin_t1', className: 'PALADIN', piecesRequired: 4, bonusStat: 'physicalDefense',  bonusValue: 10,  bonusIsPercent: false },
  { setId: 'paladin_t1', className: 'PALADIN', piecesRequired: 5, bonusStat: 'hpRegen',          bonusValue: 1,   bonusIsPercent: false },
  { setId: 'paladin_t2', className: 'PALADIN', piecesRequired: 2, bonusStat: 'maxHp',           bonusValue: 80,  bonusIsPercent: false },
  { setId: 'paladin_t2', className: 'PALADIN', piecesRequired: 4, bonusStat: 'physicalDefense',  bonusValue: 25,  bonusIsPercent: false },
  { setId: 'paladin_t2', className: 'PALADIN', piecesRequired: 5, bonusStat: 'hpRegen',          bonusValue: 2.5, bonusIsPercent: false },
  { setId: 'paladin_t3', className: 'PALADIN', piecesRequired: 2, bonusStat: 'maxHp',           bonusValue: 160, bonusIsPercent: false },
  { setId: 'paladin_t3', className: 'PALADIN', piecesRequired: 4, bonusStat: 'physicalDefense',  bonusValue: 50,  bonusIsPercent: false },
  { setId: 'paladin_t3', className: 'PALADIN', piecesRequired: 5, bonusStat: 'hpRegen',          bonusValue: 5,   bonusIsPercent: false },
  { setId: 'paladin_t4', className: 'PALADIN', piecesRequired: 2, bonusStat: 'maxHp',           bonusValue: 280, bonusIsPercent: false },
  { setId: 'paladin_t4', className: 'PALADIN', piecesRequired: 4, bonusStat: 'physicalDefense',  bonusValue: 80,  bonusIsPercent: false },
  { setId: 'paladin_t4', className: 'PALADIN', piecesRequired: 5, bonusStat: 'blockChance',      bonusValue: 5,   bonusIsPercent: false },
  { setId: 'paladin_t5', className: 'PALADIN', piecesRequired: 2, bonusStat: 'maxHp',           bonusValue: 450, bonusIsPercent: false },
  { setId: 'paladin_t5', className: 'PALADIN', piecesRequired: 4, bonusStat: 'physicalDefense',  bonusValue: 120, bonusIsPercent: false },
  { setId: 'paladin_t5', className: 'PALADIN', piecesRequired: 5, bonusStat: 'blockChance',      bonusValue: 8,   bonusIsPercent: false },

  // Fighter armor sets
  { setId: 'fighter_t1', className: 'FIGHTER', piecesRequired: 2, bonusStat: 'physicalAttack',   bonusValue: 5,   bonusIsPercent: false },
  { setId: 'fighter_t1', className: 'FIGHTER', piecesRequired: 4, bonusStat: 'criticalChance',   bonusValue: 1,   bonusIsPercent: false },
  { setId: 'fighter_t1', className: 'FIGHTER', piecesRequired: 5, bonusStat: 'attackSpeed',      bonusValue: 2,   bonusIsPercent: false },
  { setId: 'fighter_t2', className: 'FIGHTER', piecesRequired: 2, bonusStat: 'physicalAttack',   bonusValue: 12,  bonusIsPercent: false },
  { setId: 'fighter_t2', className: 'FIGHTER', piecesRequired: 4, bonusStat: 'criticalChance',   bonusValue: 2.5, bonusIsPercent: false },
  { setId: 'fighter_t2', className: 'FIGHTER', piecesRequired: 5, bonusStat: 'attackSpeed',      bonusValue: 5,   bonusIsPercent: false },
  { setId: 'fighter_t3', className: 'FIGHTER', piecesRequired: 2, bonusStat: 'physicalAttack',   bonusValue: 25,  bonusIsPercent: false },
  { setId: 'fighter_t3', className: 'FIGHTER', piecesRequired: 4, bonusStat: 'criticalChance',   bonusValue: 4,   bonusIsPercent: false },
  { setId: 'fighter_t3', className: 'FIGHTER', piecesRequired: 5, bonusStat: 'criticalDamage',   bonusValue: 10,  bonusIsPercent: false },
  { setId: 'fighter_t4', className: 'FIGHTER', piecesRequired: 2, bonusStat: 'physicalAttack',   bonusValue: 40,  bonusIsPercent: false },
  { setId: 'fighter_t4', className: 'FIGHTER', piecesRequired: 4, bonusStat: 'criticalChance',   bonusValue: 6,   bonusIsPercent: false },
  { setId: 'fighter_t4', className: 'FIGHTER', piecesRequired: 5, bonusStat: 'criticalDamage',   bonusValue: 18,  bonusIsPercent: false },
  { setId: 'fighter_t5', className: 'FIGHTER', piecesRequired: 2, bonusStat: 'physicalAttack',   bonusValue: 65,  bonusIsPercent: false },
  { setId: 'fighter_t5', className: 'FIGHTER', piecesRequired: 4, bonusStat: 'criticalChance',   bonusValue: 8,   bonusIsPercent: false },
  { setId: 'fighter_t5', className: 'FIGHTER', piecesRequired: 5, bonusStat: 'criticalDamage',   bonusValue: 25,  bonusIsPercent: false },

  // Ranger armor sets
  { setId: 'ranger_t1', className: 'RANGER', piecesRequired: 2, bonusStat: 'physicalAttack',    bonusValue: 4,   bonusIsPercent: false },
  { setId: 'ranger_t1', className: 'RANGER', piecesRequired: 4, bonusStat: 'attackSpeed',       bonusValue: 2,   bonusIsPercent: false },
  { setId: 'ranger_t1', className: 'RANGER', piecesRequired: 5, bonusStat: 'movementSpeed',     bonusValue: 2,   bonusIsPercent: false },
  { setId: 'ranger_t2', className: 'RANGER', piecesRequired: 2, bonusStat: 'physicalAttack',    bonusValue: 10,  bonusIsPercent: false },
  { setId: 'ranger_t2', className: 'RANGER', piecesRequired: 4, bonusStat: 'attackSpeed',       bonusValue: 5,   bonusIsPercent: false },
  { setId: 'ranger_t2', className: 'RANGER', piecesRequired: 5, bonusStat: 'movementSpeed',     bonusValue: 5,   bonusIsPercent: false },
  { setId: 'ranger_t3', className: 'RANGER', piecesRequired: 2, bonusStat: 'physicalAttack',    bonusValue: 22,  bonusIsPercent: false },
  { setId: 'ranger_t3', className: 'RANGER', piecesRequired: 4, bonusStat: 'attackSpeed',       bonusValue: 8,   bonusIsPercent: false },
  { setId: 'ranger_t3', className: 'RANGER', piecesRequired: 5, bonusStat: 'criticalChance',    bonusValue: 4,   bonusIsPercent: false },
  { setId: 'ranger_t4', className: 'RANGER', piecesRequired: 2, bonusStat: 'physicalAttack',    bonusValue: 35,  bonusIsPercent: false },
  { setId: 'ranger_t4', className: 'RANGER', piecesRequired: 4, bonusStat: 'attackSpeed',       bonusValue: 12,  bonusIsPercent: false },
  { setId: 'ranger_t4', className: 'RANGER', piecesRequired: 5, bonusStat: 'criticalChance',    bonusValue: 6,   bonusIsPercent: false },
  { setId: 'ranger_t5', className: 'RANGER', piecesRequired: 2, bonusStat: 'physicalAttack',    bonusValue: 55,  bonusIsPercent: false },
  { setId: 'ranger_t5', className: 'RANGER', piecesRequired: 4, bonusStat: 'attackSpeed',       bonusValue: 16,  bonusIsPercent: false },
  { setId: 'ranger_t5', className: 'RANGER', piecesRequired: 5, bonusStat: 'armorPenetration',  bonusValue: 5,   bonusIsPercent: false },

  // Cleric armor sets
  { setId: 'cleric_t1', className: 'CLERIC', piecesRequired: 2, bonusStat: 'maxMana',          bonusValue: 20,  bonusIsPercent: false },
  { setId: 'cleric_t1', className: 'CLERIC', piecesRequired: 4, bonusStat: 'manaRegen',        bonusValue: 0.5, bonusIsPercent: false },
  { setId: 'cleric_t1', className: 'CLERIC', piecesRequired: 5, bonusStat: 'magicAttack',      bonusValue: 5,   bonusIsPercent: false },
  { setId: 'cleric_t2', className: 'CLERIC', piecesRequired: 2, bonusStat: 'maxMana',          bonusValue: 50,  bonusIsPercent: false },
  { setId: 'cleric_t2', className: 'CLERIC', piecesRequired: 4, bonusStat: 'manaRegen',        bonusValue: 1.2, bonusIsPercent: false },
  { setId: 'cleric_t2', className: 'CLERIC', piecesRequired: 5, bonusStat: 'magicAttack',      bonusValue: 12,  bonusIsPercent: false },
  { setId: 'cleric_t3', className: 'CLERIC', piecesRequired: 2, bonusStat: 'maxMana',          bonusValue: 100, bonusIsPercent: false },
  { setId: 'cleric_t3', className: 'CLERIC', piecesRequired: 4, bonusStat: 'manaRegen',        bonusValue: 2.5, bonusIsPercent: false },
  { setId: 'cleric_t3', className: 'CLERIC', piecesRequired: 5, bonusStat: 'hpRegen',          bonusValue: 4,   bonusIsPercent: false },
  { setId: 'cleric_t4', className: 'CLERIC', piecesRequired: 2, bonusStat: 'maxMana',          bonusValue: 180, bonusIsPercent: false },
  { setId: 'cleric_t4', className: 'CLERIC', piecesRequired: 4, bonusStat: 'manaRegen',        bonusValue: 4,   bonusIsPercent: false },
  { setId: 'cleric_t4', className: 'CLERIC', piecesRequired: 5, bonusStat: 'hpRegen',          bonusValue: 7,   bonusIsPercent: false },
  { setId: 'cleric_t5', className: 'CLERIC', piecesRequired: 2, bonusStat: 'maxMana',          bonusValue: 300, bonusIsPercent: false },
  { setId: 'cleric_t5', className: 'CLERIC', piecesRequired: 4, bonusStat: 'manaRegen',        bonusValue: 6,   bonusIsPercent: false },
  { setId: 'cleric_t5', className: 'CLERIC', piecesRequired: 5, bonusStat: 'magicAttack',      bonusValue: 60,  bonusIsPercent: false },

  // Mage armor sets
  { setId: 'mage_t1', className: 'MAGE', piecesRequired: 2, bonusStat: 'magicAttack',       bonusValue: 5,   bonusIsPercent: false },
  { setId: 'mage_t1', className: 'MAGE', piecesRequired: 4, bonusStat: 'maxMana',           bonusValue: 20,  bonusIsPercent: false },
  { setId: 'mage_t1', className: 'MAGE', piecesRequired: 5, bonusStat: 'magicPenetration',  bonusValue: 1,   bonusIsPercent: false },
  { setId: 'mage_t2', className: 'MAGE', piecesRequired: 2, bonusStat: 'magicAttack',       bonusValue: 14,  bonusIsPercent: false },
  { setId: 'mage_t2', className: 'MAGE', piecesRequired: 4, bonusStat: 'maxMana',           bonusValue: 50,  bonusIsPercent: false },
  { setId: 'mage_t2', className: 'MAGE', piecesRequired: 5, bonusStat: 'magicPenetration',  bonusValue: 2,   bonusIsPercent: false },
  { setId: 'mage_t3', className: 'MAGE', piecesRequired: 2, bonusStat: 'magicAttack',       bonusValue: 28,  bonusIsPercent: false },
  { setId: 'mage_t3', className: 'MAGE', piecesRequired: 4, bonusStat: 'maxMana',           bonusValue: 100, bonusIsPercent: false },
  { setId: 'mage_t3', className: 'MAGE', piecesRequired: 5, bonusStat: 'magicPenetration',  bonusValue: 3.5, bonusIsPercent: false },
  { setId: 'mage_t4', className: 'MAGE', piecesRequired: 2, bonusStat: 'magicAttack',       bonusValue: 48,  bonusIsPercent: false },
  { setId: 'mage_t4', className: 'MAGE', piecesRequired: 4, bonusStat: 'maxMana',           bonusValue: 180, bonusIsPercent: false },
  { setId: 'mage_t4', className: 'MAGE', piecesRequired: 5, bonusStat: 'criticalChance',    bonusValue: 6,   bonusIsPercent: false },
  { setId: 'mage_t5', className: 'MAGE', piecesRequired: 2, bonusStat: 'magicAttack',       bonusValue: 75,  bonusIsPercent: false },
  { setId: 'mage_t5', className: 'MAGE', piecesRequired: 4, bonusStat: 'maxMana',           bonusValue: 300, bonusIsPercent: false },
  { setId: 'mage_t5', className: 'MAGE', piecesRequired: 5, bonusStat: 'magicPenetration',  bonusValue: 5,   bonusIsPercent: false },

  // Accessory set bonuses (pendant + 2 rings of same tier)
  { setId: 'accessory_t1', piecesRequired: 2, bonusStat: 'criticalDamage', bonusValue: 3,  bonusIsPercent: false },
  { setId: 'accessory_t1', piecesRequired: 3, bonusStat: 'criticalDamage', bonusValue: 5,  bonusIsPercent: false },
  { setId: 'accessory_t2', piecesRequired: 2, bonusStat: 'criticalDamage', bonusValue: 6,  bonusIsPercent: false },
  { setId: 'accessory_t2', piecesRequired: 3, bonusStat: 'criticalDamage', bonusValue: 10, bonusIsPercent: false },
  { setId: 'accessory_t3', piecesRequired: 2, bonusStat: 'criticalDamage', bonusValue: 10, bonusIsPercent: false },
  { setId: 'accessory_t3', piecesRequired: 3, bonusStat: 'criticalDamage', bonusValue: 16, bonusIsPercent: false },
  { setId: 'accessory_t4', piecesRequired: 2, bonusStat: 'criticalDamage', bonusValue: 15, bonusIsPercent: false },
  { setId: 'accessory_t4', piecesRequired: 3, bonusStat: 'criticalDamage', bonusValue: 24, bonusIsPercent: false },
  { setId: 'accessory_t5', piecesRequired: 2, bonusStat: 'criticalDamage', bonusValue: 22, bonusIsPercent: false },
  { setId: 'accessory_t5', piecesRequired: 3, bonusStat: 'criticalDamage', bonusValue: 35, bonusIsPercent: false },
];

// ==================== CRYSTAL TEMPLATES ====================

export const CRYSTAL_TEMPLATES: ItemTemplate[] = [
  {
    id: 'crystal_spirit', name: 'Crystal of Spirit', description: 'Used to enhance equipment from +1 to +7.',
    type: 'CRYSTAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0,
    socketCount: 0, stackable: true, maxStack: 99, sellPrice: 500,
    icon: iconPath('crystals', 'crystal_of_spirit.png'),
  },
  {
    id: 'crystal_dominion', name: 'Crystal of Dominion', description: 'Used to enhance equipment from +8 to +15.',
    type: 'CRYSTAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0,
    socketCount: 0, stackable: true, maxStack: 99, sellPrice: 2000,
    icon: iconPath('crystals', 'crystal_of_dominion.png'),
  },
  {
    id: 'crystal_creation', name: 'Crystal of Creation', description: 'Required for all forging recipes. T1:1, T2:2, T3:3, T4:4, T5:6 crystals needed.',
    type: 'MATERIAL' as const, slot: 'NONE' as const, tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0,
    socketCount: 0, stackable: true, maxStack: 99, sellPrice: 200,
    icon: iconPath('crystals', 'crystal_of_creation.png'),
  },
];

// ==================== SPRITE INFO MAPPINGS ====================

// Full per-class, per-tier, per-slot sprite info.
// PALADIN/FIGHTER = plate armor; RANGER = leather; CLERIC/MAGE = cloth.
// GLOVES entries include shouldersType/bracersMaterial since the arms item drives those layers.

const ARMOR_SPRITE_MAP: Record<string, Record<string, ItemSpriteInfo>[]> = {
  PALADIN: [
    { // T1 — Black Iron
      HEAD:   { helmetType: 'sugarloaf', helmetMaterial: 'iron' },
      CHEST:  { torsoType: 'plate', torsoMaterial: 'iron' },
      LEGS:   { legsType: 'plate', legsMaterial: 'iron' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'iron' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'iron', shouldersType: 'plate', shouldersMaterial: 'iron', bracersType: 'plate', bracersMaterial: 'iron' },
    },
    { // T2 — Silver Guardian
      HEAD:   { helmetType: 'nasal', helmetMaterial: 'silver' },
      CHEST:  { torsoType: 'plate', torsoMaterial: 'silver' },
      LEGS:   { legsType: 'plate', legsMaterial: 'silver' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'silver' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'silver', shouldersType: 'plate', shouldersMaterial: 'silver', bracersType: 'plate', bracersMaterial: 'silver' },
    },
    { // T3 — Immortal Plate
      HEAD:   { helmetType: 'flattop', helmetMaterial: 'steel' },
      CHEST:  { torsoType: 'plate', torsoMaterial: 'steel' },
      LEGS:   { legsType: 'plate', legsMaterial: 'steel' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'steel' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'steel', shouldersType: 'plate', shouldersMaterial: 'steel', bracersType: 'plate', bracersMaterial: 'steel' },
    },
    { // T4 — Great Crusader
      HEAD:   { helmetType: 'greathelm', helmetMaterial: 'gold' },
      CHEST:  { torsoType: 'plate', torsoMaterial: 'gold' },
      LEGS:   { legsType: 'plate', legsMaterial: 'gold' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'gold' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'gold', shouldersType: 'plate', shouldersMaterial: 'gold', bracersType: 'plate', bracersMaterial: 'gold' },
    },
    { // T5 — Eternal Titan
      HEAD:   { helmetType: 'armet', helmetMaterial: 'ceramic' },
      CHEST:  { torsoType: 'plate', torsoMaterial: 'ceramic' },
      LEGS:   { legsType: 'plate', legsMaterial: 'ceramic' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'ceramic' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'ceramic', shouldersType: 'plate', shouldersMaterial: 'ceramic', bracersType: 'plate', bracersMaterial: 'ceramic' },
    },
  ],
  FIGHTER: [
    { // T1 — Mercenary
      HEAD:   { helmetType: 'headband_tied', helmetMaterial: 'brown' },
      CHEST:  { torsoType: 'leather', torsoMaterial: 'brown' },
      LEGS:   { legsType: 'pants', legsMaterial: 'charcoal' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'brown' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'leather', shouldersMaterial: 'brown', bracersType: 'plate', bracersMaterial: 'iron' },
    },
    { // T2 — Gladiator
      HEAD:   { helmetType: 'headband', helmetMaterial: 'maroon' },
      CHEST:  { torsoType: 'legion', torsoMaterial: 'bronze' },
      LEGS:   { legsType: 'pants', legsMaterial: 'maroon' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'brown' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'legion', shouldersMaterial: 'bronze', bracersType: 'plate', bracersMaterial: 'bronze' },
    },
    { // T3 — Noble Knight
      HEAD:   { helmetType: 'kerchief', helmetMaterial: 'blue' },
      CHEST:  { torsoType: 'tabard', torsoMaterial: 'blue' },
      LEGS:   { legsType: 'pants', legsMaterial: 'navy' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'brown' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'leather', shouldersMaterial: 'blue', bracersType: 'plate', bracersMaterial: 'gold' },
    },
    { // T4 — Berserker
      HEAD:   { helmetType: 'bandana', helmetMaterial: 'maroon' },
      CHEST:  { torsoType: 'leather', torsoMaterial: 'maroon' },
      LEGS:   { legsType: 'pants', legsMaterial: 'black' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'maroon' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'maroon', shouldersType: 'leather', shouldersMaterial: 'maroon', bracersType: 'plate', bracersMaterial: 'copper' },
    },
    { // T5 — Dreadlord
      HEAD:   { helmetType: 'horned', helmetMaterial: 'brass' },
      CHEST:  { torsoType: 'legion', torsoMaterial: 'brass' },
      LEGS:   { legsType: 'pants', legsMaterial: 'black' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'black' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'black', shouldersType: 'legion', shouldersMaterial: 'brass', bracersType: 'plate', bracersMaterial: 'brass' },
    },
  ],
  RANGER: [
    { // T1 — Leather Scout
      HEAD:   { helmetType: 'headband_tied', helmetMaterial: 'brown' },
      CHEST:  { torsoType: 'leather', torsoMaterial: 'brown' },
      LEGS:   { legsType: 'pants', legsMaterial: 'brown' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'brown' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'mantal', shouldersMaterial: 'brown', bracersType: 'plate', bracersMaterial: 'bronze' },
    },
    { // T2 — Elite Hunter
      HEAD:   { helmetType: 'leather_cap', helmetMaterial: 'brown' },
      CHEST:  { torsoType: 'leather', torsoMaterial: 'forest' },
      LEGS:   { legsType: 'pants', legsMaterial: 'forest' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'forest' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'forest', shouldersType: 'mantal', shouldersMaterial: 'forest', bracersType: 'plate', bracersMaterial: 'bronze' },
    },
    { // T3 — Black Ambition
      HEAD:   { helmetType: 'bandana', helmetMaterial: 'black' },
      CHEST:  { torsoType: 'leather', torsoMaterial: 'black' },
      LEGS:   { legsType: 'pants', legsMaterial: 'charcoal' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'black' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'black', shouldersType: 'mantal', shouldersMaterial: 'charcoal', bracersType: 'plate', bracersMaterial: 'iron' },
    },
    { // T4 — Venom
      HEAD:   { helmetType: 'kerchief', helmetMaterial: 'purple' },
      CHEST:  { torsoType: 'leather', torsoMaterial: 'purple' },
      LEGS:   { legsType: 'pants', legsMaterial: 'purple' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'purple' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'purple', shouldersType: 'mantal', shouldersMaterial: 'purple', bracersType: 'plate', bracersMaterial: 'copper' },
    },
    { // T5 — Phantom (no headwear)
      CHEST:  { torsoType: 'leather', torsoMaterial: 'gray' },
      LEGS:   { legsType: 'pants', legsMaterial: 'gray' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'gray' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'gray', shouldersType: 'mantal', shouldersMaterial: 'gray', bracersType: 'plate', bracersMaterial: 'steel' },
    },
  ],
  CLERIC: [
    { // T1 — Swift Silk
      HEAD:   { helmetType: 'tiara', helmetMaterial: 'silver' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'white' },
      LEGS:   { legsType: 'pants', legsMaterial: 'white' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'white' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'white', shouldersType: 'mantal', shouldersMaterial: 'gray', bracersType: 'plate', bracersMaterial: 'silver' },
    },
    { // T2 — Spirit
      HEAD:   { helmetType: 'bandana2', helmetMaterial: 'lavender' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'lavender' },
      LEGS:   { legsType: 'pants', legsMaterial: 'lavender' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'lavender' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'lavender', shouldersType: 'mantal', shouldersMaterial: 'lavender', bracersType: 'plate', bracersMaterial: 'silver' },
    },
    { // T3 — Silver Wing
      HEAD:   { helmetType: 'tiara', helmetMaterial: 'silver' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'gray' },
      LEGS:   { legsType: 'pants', legsMaterial: 'gray' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'silver' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'silver', shouldersType: 'mantal', shouldersMaterial: 'gray', bracersType: 'plate', bracersMaterial: 'silver' },
    },
    { // T4 — Manticore
      HEAD:   { helmetType: 'hood', helmetMaterial: 'maroon' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'maroon' },
      LEGS:   { legsType: 'pants', legsMaterial: 'maroon' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'maroon' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'maroon', shouldersType: 'mantal', shouldersMaterial: 'maroon', bracersType: 'plate', bracersMaterial: 'bronze' },
    },
    { // T5 — White Oracle
      HEAD:   { helmetType: 'hood', helmetMaterial: 'white' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'white' },
      LEGS:   { legsType: 'pants', legsMaterial: 'white' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'gold' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'gold', shouldersType: 'epaulets', shouldersMaterial: 'gold', bracersType: 'plate', bracersMaterial: 'gold' },
    },
  ],
  MAGE: [
    { // T1 — Mystic
      HEAD:   { helmetType: 'wizard', helmetMaterial: 'blue' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'blue' },
      LEGS:   { legsType: 'pants', legsMaterial: 'blue' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'blue' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'blue', shouldersType: 'mantal', shouldersMaterial: 'blue', bracersType: 'plate', bracersMaterial: 'silver' },
    },
    { // T2 — Arcane
      HEAD:   { helmetType: 'wizard', helmetMaterial: 'purple' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'purple' },
      LEGS:   { legsType: 'pants', legsMaterial: 'purple' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'purple' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'purple', shouldersType: 'mantal', shouldersMaterial: 'purple', bracersType: 'plate', bracersMaterial: 'silver' },
    },
    { // T3 — Eclipse
      HEAD:   { helmetType: 'wizard', helmetMaterial: 'black' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'black' },
      LEGS:   { legsType: 'pants', legsMaterial: 'black' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'black' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'black', shouldersType: 'mantal', shouldersMaterial: 'black', bracersType: 'plate', bracersMaterial: 'iron' },
    },
    { // T4 — Moonlight
      HEAD:   { helmetType: 'wizard', helmetMaterial: 'sky' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'gray' },
      LEGS:   { legsType: 'pants', legsMaterial: 'gray' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'silver' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'silver', shouldersType: 'mantal', shouldersMaterial: 'sky', bracersType: 'plate', bracersMaterial: 'silver' },
    },
    { // T5 — Void
      HEAD:   { helmetType: 'wizard', helmetMaterial: 'charcoal' },
      CHEST:  { torsoType: 'longsleeve2', torsoMaterial: 'charcoal' },
      LEGS:   { legsType: 'pants', legsMaterial: 'charcoal' },
      BOOTS:  { bootsType: 'basic', bootsMaterial: 'charcoal' },
      GLOVES: { armsType: 'gloves', armsMaterial: 'charcoal', shouldersType: 'mantal', shouldersMaterial: 'charcoal', bracersType: 'plate', bracersMaterial: 'steel' },
    },
  ],
};

function getArmorSpriteInfo(cls: string, tierIndex: number, slot: string): ItemSpriteInfo | undefined {
  return ARMOR_SPRITE_MAP[cls]?.[tierIndex]?.[slot];
}

const WEAPON_SPRITE_TYPES: Record<string, string[]> = {
  PALADIN: ['mace', 'mace', 'mace', 'mace', 'mace'],
  FIGHTER: ['longsword', 'longsword', 'longsword', 'waraxe', 'longsword'],
  RANGER:  ['shortbow', 'shortbow', 'shortbow', 'shortbow', 'shortbow'],
  CLERIC:  ['staff', 'staff', 'staff', 'staff', 'staff'],
  MAGE:    ['staff', 'staff', 'staff', 'staff', 'staff'],
};

const SHIELD_SPRITES: { shieldType: string; shieldVariant?: string }[] = [
  { shieldType: 'round', shieldVariant: 'round_black' },
  { shieldType: 'kite', shieldVariant: 'kite_blue_gray' },
  { shieldType: 'kite', shieldVariant: 'kite_orange' },
  { shieldType: 'crusader' },
  { shieldType: 'heater' },
];

// ==================== EQUIPMENT TEMPLATE GENERATION ====================

const CLASSES = ['PALADIN', 'FIGHTER', 'RANGER', 'CLERIC', 'MAGE'] as const;
const ARMOR_SLOTS = ['HEAD', 'CHEST', 'LEGS', 'BOOTS', 'GLOVES'] as const;
const TIERS = [1, 2, 3, 4, 5] as const;

// Class → set name per tier
const CLASS_SET_NAMES: Record<string, string[]> = {
  PALADIN: ['Black Iron', 'Silver Guardian', 'Immortal Plate', 'Great Crusader', 'Eternal Titan'],
  FIGHTER: ['Mercenary', 'Gladiator', 'Noble Knight', 'Berserker', 'Dreadlord'],
  RANGER:  ['Leather Scout', 'Elite Hunter', 'Black Ambition', 'Venom', 'Phantom'],
  CLERIC:  ['Swift Silk', 'Spirit', 'Silver Wing', 'Manticore', 'White Oracle'],
  MAGE:    ['Mystic', 'Arcane', 'Eclipse', 'Moonlight', 'Void'],
};

const SLOT_DISPLAY_NAMES: Record<string, string> = {
  HEAD: 'Helm', CHEST: 'Chestplate', LEGS: 'Leggings', BOOTS: 'Boots', GLOVES: 'Gauntlets',
};

function generateArmorTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (const cls of CLASSES) {
    for (let ti = 0; ti < TIERS.length; ti++) {
      const tier = TIERS[ti];
      const cfg = getTierConfig(tier);
      const setName = CLASS_SET_NAMES[cls][ti];
      const setId = `${cls.toLowerCase()}_t${tier}`;
      for (const slot of ARMOR_SLOTS) {
        const id = `${cls.toLowerCase()}_t${tier}_${slot.toLowerCase()}`;
        const spriteInfo = getArmorSpriteInfo(cls, ti, slot);
        templates.push({
          id,
          name: `${setName} ${SLOT_DISPLAY_NAMES[slot]}`,
          description: `${setName} set ${SLOT_DISPLAY_NAMES[slot].toLowerCase()} for ${cls.toLowerCase()}s.`,
          type: 'ARMOR',
          slot,
          tier,
          requiredLevel: cfg.requiredLevel,
          requiredClass: cls,
          baseStatMin: BASE_ARMOR_DEFENSE[tier].min,
          baseStatMax: BASE_ARMOR_DEFENSE[tier].max,
          baseStatType: 'defense',
          identityKey: slot,
          bonusPoolKey: slot,
          prestigeKey: slot,
          socketCount: cfg.armorSockets,
          setId,
          stackable: false,
          maxStack: 1,
          sellPrice: tier * tier * 200,
          icon: ARMOR_SLOT_ICON[slot],
          spriteInfo,
        });
      }
    }
  }
  return templates;
}

// Weapon definitions: class → [name1..name5], isPhysical
const CLASS_WEAPONS: Record<string, { names: string[]; isMagic: boolean }> = {
  PALADIN: { names: ['Iron Mace', 'Azure Mace', 'Noble Mace', 'Colossus Mace', 'Dawn Breaker'], isMagic: false },
  FIGHTER: { names: ['Iron Sword', 'Battle Spear', 'Flame Sword', 'Dark Scythe', 'Executioner'], isMagic: false },
  RANGER:  { names: ['Short Bow', 'Hunters Bow', 'Golden Recurve', 'Legendary Bow', 'Titan Bow'], isMagic: false },
  CLERIC:  { names: ['Oak Staff', 'Healing Staff', 'Anias Staff', 'Angel Wing', 'Archangel'], isMagic: true },
  MAGE:    { names: ['Oak Staff', 'Arcane Staff', 'Anias Staff', 'Eclipse Staff', 'Void Staff'], isMagic: true },
};

function generateWeaponTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (const cls of CLASSES) {
    const { names, isMagic } = CLASS_WEAPONS[cls];
    for (let ti = 0; ti < TIERS.length; ti++) {
      const tier = TIERS[ti];
      const cfg = getTierConfig(tier);
      const id = `${cls.toLowerCase()}_weapon_t${tier}`;
      const weaponSprite = WEAPON_SPRITE_TYPES[cls]?.[ti];
      const weaponIconKey = WEAPON_ICON_PER_CLASS[cls]?.[ti] || 'longsword';
      templates.push({
        id,
        name: names[ti],
        description: `A tier ${tier} weapon for ${cls.toLowerCase()}s.`,
        type: 'WEAPON',
        slot: 'WEAPON',
        tier,
        requiredLevel: cfg.requiredLevel,
        requiredClass: cls,
        baseStatMin: BASE_WEAPON_DAMAGE[tier].min,
        baseStatMax: BASE_WEAPON_DAMAGE[tier].max,
        baseStatType: 'damage',
        identityKey: isMagic ? 'WEAPON_MAGIC' : 'WEAPON_PHYS',
        bonusPoolKey: isMagic ? 'WEAPON_MAGIC' : 'WEAPON_PHYS',
        prestigeKey: 'WEAPON',
        socketCount: cfg.weaponSockets,
        stackable: false,
        maxStack: 1,
        sellPrice: tier * tier * 400,
        icon: WEAPON_ICON[weaponIconKey],
        spriteInfo: weaponSprite ? { weaponType: weaponSprite } : undefined,
      });
    }
  }
  return templates;
}

// Fighter offhand weapons
const FIGHTER_OFFHAND_NAMES = ['Iron Dagger', 'Parrying Dagger', 'Assassin Blade', 'Soul Ripper', 'Void Fang'];

function generateFighterOffhandTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    templates.push({
      id: `fighter_offhand_t${tier}`,
      name: FIGHTER_OFFHAND_NAMES[ti],
      description: `A tier ${tier} offhand dagger for fighters.`,
      type: 'WEAPON',
      slot: 'OFF_HAND',
      tier,
      requiredLevel: cfg.requiredLevel,
      requiredClass: 'FIGHTER',
      baseStatMin: Math.round(BASE_WEAPON_DAMAGE[tier].min * 0.6),
      baseStatMax: Math.round(BASE_WEAPON_DAMAGE[tier].max * 0.6),
      baseStatType: 'damage',
      identityKey: 'WEAPON_PHYS',
      bonusPoolKey: 'WEAPON_PHYS',
      prestigeKey: 'WEAPON',
      socketCount: cfg.weaponSockets,
      stackable: false,
      maxStack: 1,
      sellPrice: tier * tier * 300,
      icon: WEAPON_ICON.dagger,
      spriteInfo: { weaponType: 'dagger' },
    });
  }
  return templates;
}

// Paladin shields
const PALADIN_SHIELD_NAMES = ['Iron Shield', 'Bastion Shield', 'Golden Bulwark', 'Glorious Shield', "Titan's Aegis"];

function generateShieldTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    const shieldSprite = SHIELD_SPRITES[ti];
    templates.push({
      id: `paladin_shield_t${tier}`,
      name: PALADIN_SHIELD_NAMES[ti],
      description: `A tier ${tier} shield for paladins.`,
      type: 'SHIELD',
      slot: 'OFF_HAND',
      tier,
      requiredLevel: cfg.requiredLevel,
      requiredClass: 'PALADIN',
      baseStatMin: BASE_SHIELD_DEFENSE[tier].min,
      baseStatMax: BASE_SHIELD_DEFENSE[tier].max,
      baseStatType: 'defense',
      identityKey: 'OFF_HAND',
      bonusPoolKey: 'OFF_HAND',
      prestigeKey: 'OFF_HAND',
      socketCount: cfg.weaponSockets,
      stackable: false,
      maxStack: 1,
      sellPrice: tier * tier * 350,
      icon: SHIELD_ICON[shieldSprite?.shieldType || 'round'],
      spriteInfo: shieldSprite ? { shieldType: shieldSprite.shieldType, shieldVariant: shieldSprite.shieldVariant } : undefined,
    });
  }
  return templates;
}

// Pendants
const PENDANT_NAMES = ['Pendant of Vharun', 'Pendant of Saelistra', 'Pendant of Kharagul', 'Pendant of Morgathis', 'Pendant of Cassian'];
const PENDANT_ICONS = ['pendant_vharun.png', 'pendant_saelistra.png', 'pendant_kharagul.png', 'pendant_morgathis.png', 'pendant_cassian.png'];

function generatePendantTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    templates.push({
      id: `pendant_t${tier}`,
      name: PENDANT_NAMES[ti],
      description: `A tier ${tier} pendant.`,
      type: 'ACCESSORY',
      slot: 'PENDANT',
      tier,
      requiredLevel: cfg.requiredLevel,
      baseStatMin: 0,
      baseStatMax: 0,
      identityKey: 'PENDANT',
      bonusPoolKey: 'PENDANT',
      prestigeKey: 'PENDANT',
      socketCount: 0,
      setId: `accessory_t${tier}`,
      stackable: false,
      maxStack: 1,
      sellPrice: tier * tier * 250,
      icon: iconPath('accessories', PENDANT_ICONS[ti]),
    });
  }
  return templates;
}

// Rings
const RING_NAMES = ['Ring of Vharun', 'Ring of Saelistra', 'Ring of Kharagul', 'Ring of Morgathis', 'Ring of Cassian'];
const RING_ICONS = ['ring_vharun.png', 'ring_saelistra.png', 'ring_kharagul.png', 'ring_morgathis.png', 'ring_cassian.png'];

function generateRingTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    templates.push({
      id: `ring_t${tier}`,
      name: RING_NAMES[ti],
      description: `A tier ${tier} ring.`,
      type: 'ACCESSORY',
      slot: 'RING',
      tier,
      requiredLevel: cfg.requiredLevel,
      baseStatMin: 0,
      baseStatMax: 0,
      identityKey: 'RING',
      bonusPoolKey: 'RING',
      prestigeKey: 'RING',
      socketCount: 0,
      setId: `accessory_t${tier}`,
      stackable: false,
      maxStack: 1,
      sellPrice: tier * tier * 250,
      icon: iconPath('accessories', RING_ICONS[ti]),
    });
  }
  return templates;
}

// Wings (Paladin, Fighter)
const WING_NAMES = ['Sentinel Wings', 'Guardian Wings', 'Draconic Wings', 'Nightfall Wings', 'Celestial Wings'];
const WING_ICONS = ['sentinel_wings.png', 'guardian_wings.png', 'draconic_wings.png', 'nightfall_wings.png', 'celestial_wings.png'];
const WING_SPRITES = [
  { wingsType: 'bat' },
  { wingsType: 'feathered' },
  { wingsType: 'bat', wingsColor: 'red' },
  { wingsType: 'bat', wingsColor: 'black' },
  { wingsType: 'feathered', wingsColor: 'gold' },
];

function generateWingTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    templates.push({
      id: `wings_t${tier}`,
      name: WING_NAMES[ti],
      description: `Tier ${tier} wings for warriors.`,
      type: 'ARMOR',
      slot: 'WINGS',
      tier,
      requiredLevel: cfg.requiredLevel,
      baseStatMin: BASE_ARMOR_DEFENSE[tier].min,
      baseStatMax: BASE_ARMOR_DEFENSE[tier].max,
      baseStatType: 'defense',
      identityKey: 'WINGS',
      bonusPoolKey: 'WINGS',
      prestigeKey: 'WINGS',
      socketCount: cfg.armorSockets,
      stackable: false,
      maxStack: 1,
      sellPrice: tier * tier * 300,
      icon: iconPath('accessories', WING_ICONS[ti]),
      spriteInfo: WING_SPRITES[ti],
    });
  }
  return templates;
}

// Capes (Ranger, Cleric, Mage)
const CAPE_NAMES = ['Sentinel Cape', 'Honor Cape', 'Warlord Cape', 'Infernal Cape', 'Eternal Cape'];
const CAPE_ICONS = ['sentinel_cape.png', 'honor_cape.png', 'warlord_cape.png', 'infernal_cape.png', 'eternal_cape.png'];
const CAPE_SPRITES = [
  { capeType: 'solid', capeColor: 'brown' },
  { capeType: 'solid', capeColor: 'white' },
  { capeType: 'solid', capeColor: 'red' },
  { capeType: 'solid', capeColor: 'maroon' },
  { capeType: 'solid', capeColor: 'black' },
];

function generateCapeTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    templates.push({
      id: `cape_t${tier}`,
      name: CAPE_NAMES[ti],
      description: `Tier ${tier} cape for casters.`,
      type: 'ARMOR',
      slot: 'CAPE',
      tier,
      requiredLevel: cfg.requiredLevel,
      baseStatMin: BASE_ARMOR_DEFENSE[tier].min,
      baseStatMax: BASE_ARMOR_DEFENSE[tier].max,
      baseStatType: 'defense',
      identityKey: 'CAPE',
      bonusPoolKey: 'CAPE',
      prestigeKey: 'CAPE',
      socketCount: cfg.armorSockets,
      stackable: false,
      maxStack: 1,
      sellPrice: tier * tier * 300,
      icon: iconPath('accessories', CAPE_ICONS[ti]),
      spriteInfo: CAPE_SPRITES[ti],
    });
  }
  return templates;
}

// Consumables — Elixirs of Life, Mana, and Power (per game design docs)
function generateConsumableTemplates(): ItemTemplate[] {
  return [
    // Elixirs of Life (HP restore)
    { id: 'elixir_life_sm', name: 'Elixir of Life (SM)', description: 'Restores 150 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 25,   icon: iconPath('consumables', 'health_elixir_sm.png'), consumeEffect: { hpRestore: 150, cooldown: 10 } },
    { id: 'elixir_life_md', name: 'Elixir of Life (MD)', description: 'Restores 350 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 75,   icon: iconPath('consumables', 'health_elixir_md.png'), consumeEffect: { hpRestore: 350, cooldown: 10 } },
    { id: 'elixir_life_lg', name: 'Elixir of Life (LG)', description: 'Restores 600 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 200,  icon: iconPath('consumables', 'health_elixir_lg.png'), consumeEffect: { hpRestore: 600, cooldown: 10 } },
    { id: 'elixir_life_xl', name: 'Elixir of Life (XL)', description: 'Restores 1000 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 500,  icon: iconPath('consumables', 'health_elixir_xl.png'), consumeEffect: { hpRestore: 1000, cooldown: 10 } },
    // Elixirs of Mana (Mana restore)
    { id: 'elixir_mana_sm', name: 'Elixir of Mana (SM)', description: 'Restores 100 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 25,   icon: iconPath('consumables', 'mana_elixir_sm.png'), consumeEffect: { manaRestore: 100, cooldown: 10 } },
    { id: 'elixir_mana_md', name: 'Elixir of Mana (MD)', description: 'Restores 250 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 75,   icon: iconPath('consumables', 'mana_elixir_md.png'), consumeEffect: { manaRestore: 250, cooldown: 10 } },
    { id: 'elixir_mana_lg', name: 'Elixir of Mana (LG)', description: 'Restores 450 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 200,  icon: iconPath('consumables', 'mana_elixir_lg.png'), consumeEffect: { manaRestore: 450, cooldown: 10 } },
    { id: 'elixir_mana_xl', name: 'Elixir of Mana (XL)', description: 'Restores 750 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 500,  icon: iconPath('consumables', 'mana_elixir_xl.png'), consumeEffect: { manaRestore: 750, cooldown: 10 } },
    // Elixirs of Power (ATK buff)
    { id: 'elixir_power_sm', name: 'Elixir of Power (SM)', description: '+5% ATK for 5 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 50,   icon: iconPath('consumables', 'power_elixir_sm.png'), consumeEffect: { buffStat: 'physicalAttack', buffValue: 5, buffDuration: 300, cooldown: 10 } },
    { id: 'elixir_power_md', name: 'Elixir of Power (MD)', description: '+10% ATK for 10 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 150,  icon: iconPath('consumables', 'power_elixir_md.png'), consumeEffect: { buffStat: 'physicalAttack', buffValue: 10, buffDuration: 600, cooldown: 10 } },
    { id: 'elixir_power_lg', name: 'Elixir of Power (LG)', description: '+15% ATK for 15 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 400,  icon: iconPath('consumables', 'power_elixir_lg.png'), consumeEffect: { buffStat: 'physicalAttack', buffValue: 15, buffDuration: 900, cooldown: 10 } },
    { id: 'elixir_power_xl', name: 'Elixir of Power (XL)', description: '+20% ATK for 30 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 1000, icon: iconPath('consumables', 'power_elixir_xl.png'), consumeEffect: { buffStat: 'physicalAttack', buffValue: 20, buffDuration: 1800, cooldown: 10 } },
  ];
}

// Potions — HP, Mana, and Dual potions (per game design docs)
function generatePotionTemplates(): ItemTemplate[] {
  return [
    // HP Potions (5s cooldown — fast heal option vs 10s elixirs)
    { id: 'potion_hp_minor',    name: 'Minor HP Potion',    description: 'Restores 50 HP.',               type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 12,  icon: iconPath('consumables', 'potion_hp_minor.png'),    consumeEffect: { hpRestore: 50, cooldown: 5 } },
    { id: 'potion_hp',          name: 'HP Potion',          description: 'Restores 150 HP.',              type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 30,  icon: iconPath('consumables', 'potion_hp.png'),          consumeEffect: { hpRestore: 150, cooldown: 5 } },
    { id: 'potion_hp_greater',  name: 'Greater HP Potion',  description: 'Restores 400 HP.',              type: 'CONSUMABLE', tier: 0, requiredLevel: 25, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 90,  icon: iconPath('consumables', 'potion_hp_greater.png'),  consumeEffect: { hpRestore: 400, cooldown: 5 } },
    { id: 'potion_hp_superior', name: 'Superior HP Potion', description: 'Restores 800 HP.',              type: 'CONSUMABLE', tier: 0, requiredLevel: 40, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 240, icon: iconPath('consumables', 'potion_hp_superior.png'), consumeEffect: { hpRestore: 800, cooldown: 5 } },
    // Mana Potions (5s cooldown — fast heal option vs 10s elixirs)
    { id: 'potion_mana_minor',    name: 'Minor Mana Potion',    description: 'Restores 30 Mana.',          type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 12,  icon: iconPath('consumables', 'potion_mana_minor.png'),    consumeEffect: { manaRestore: 30, cooldown: 5 } },
    { id: 'potion_mana',          name: 'Mana Potion',          description: 'Restores 100 Mana.',         type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 30,  icon: iconPath('consumables', 'potion_mana.png'),          consumeEffect: { manaRestore: 100, cooldown: 5 } },
    { id: 'potion_mana_greater',  name: 'Greater Mana Potion',  description: 'Restores 250 Mana.',         type: 'CONSUMABLE', tier: 0, requiredLevel: 25, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 90,  icon: iconPath('consumables', 'potion_mana_greater.png'),  consumeEffect: { manaRestore: 250, cooldown: 5 } },
    { id: 'potion_mana_superior', name: 'Superior Mana Potion', description: 'Restores 500 Mana.',         type: 'CONSUMABLE', tier: 0, requiredLevel: 40, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 240, icon: iconPath('consumables', 'potion_mana_superior.png'), consumeEffect: { manaRestore: 500, cooldown: 5 } },
    // Dual Potions (HP + Mana)
    { id: 'potion_rejuvenation',         name: 'Rejuvenation Potion',         description: 'Restores 200 HP and 100 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 200, icon: iconPath('consumables', 'potion_rejuvenation.png'),         consumeEffect: { hpRestore: 200, manaRestore: 100, cooldown: 15 } },
    { id: 'potion_rejuvenation_greater', name: 'Greater Rejuvenation Potion', description: 'Restores 500 HP and 250 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 35, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 500, icon: iconPath('consumables', 'potion_rejuvenation_greater.png'), consumeEffect: { hpRestore: 500, manaRestore: 250, cooldown: 15 } },
  ];
}

// Material templates — per game design docs
function generateMaterialTemplates(): ItemTemplate[] {
  return [
    { id: 'material_feather_of_roc',      name: 'Feather of Roc',      description: 'Used to forge Wings.',                          type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 50,  icon: iconPath('materials', 'feather_of_roc.png') },
    { id: 'material_thread_of_silkworm',   name: 'Thread of Silkworm',  description: 'Used to forge Capes.',                          type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 50,  icon: iconPath('materials', 'thread_of_silkworm.png') },
    { id: 'material_finger_of_titan',      name: 'Finger of Titan',     description: '250 = forge random T4-T5 armor.',               type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 100, icon: iconPath('materials', 'finger_of_titan.png') },
    { id: 'material_fang_of_griffin',       name: 'Fang of Griffin',     description: '250 = forge random T4-T5 weapon/shield.',       type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 100, icon: iconPath('materials', 'fang_of_griffin.png') },
    { id: 'material_hand_of_blacksmith',    name: 'Hand of Blacksmith',  description: 'Remove gem from socket (destroys gem).',        type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 25,  icon: iconPath('materials', 'hand_of_blacksmith.png') },
    { id: 'material_hand_of_forgemaster',   name: 'Hand of Forgemaster', description: 'Upgrade Standard to Prestige quality.',        type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 500, icon: iconPath('materials', 'hand_of_forgemaster.png') },
  ];
}

// Scroll templates — scrolls per game design docs
function generateScrollTemplates(): ItemTemplate[] {
  return [
    { id: 'scroll_teleport', name: 'Scroll of Teleportation', description: 'Teleport to a safe zone.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 100, icon: iconPath('consumables', 'scroll_of_teleportation.png'), consumeEffect: { specialEffect: 'teleport_safe', cooldown: 60 } },
    { id: 'scroll_resurrection', name: 'Scroll of Resurrection', description: 'Revive at current location instead of respawn point.', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 5, sellPrice: 500,  icon: iconPath('consumables', 'scroll_of_ressurection.png'), consumeEffect: { specialEffect: 'resurrection_buff', cooldown: 300 } },
    { id: 'scroll_protection', name: 'Scroll of Protection', description: 'Prevent item destruction on next enhancement failure (+11 to +15).', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 5, sellPrice: 1000, icon: iconPath('consumables', 'scroll_of_protection.png'), consumeEffect: { specialEffect: 'enhancement_protection' } },
    { id: 'scroll_empowerment', name: 'Scroll of Empowerment', description: '+10% enhancement success rate on next attempt.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 5, sellPrice: 800,  icon: iconPath('consumables', 'scroll_of_empowerement.png'), consumeEffect: { specialEffect: 'enhancement_bonus' } },
    // Homeland teleport scrolls (faction capitals)
    { id: 'scroll_meridia',  name: 'Scroll of Meridia',  description: 'Teleport to Meridia (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, icon: iconPath('consumables', 'scroll_of_meridia.png'), consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    { id: 'scroll_lumeria',  name: 'Scroll of Lumeria',  description: 'Teleport to Lumeria (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, icon: iconPath('consumables', 'scroll_of_lumeria.png'), consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    { id: 'scroll_lythora',  name: 'Scroll of Lythora',  description: 'Teleport to Lythora (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, icon: iconPath('consumables', 'scroll_of_lythora.png'), consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    { id: 'scroll_redmire',  name: 'Scroll of Redmire',  description: 'Teleport to Redmire (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, icon: iconPath('consumables', 'scroll_of_redmire.png'), consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    // Neutral city
    { id: 'scroll_valoryn',  name: 'Scroll of Valoryn',  description: 'Teleport to Valoryn (neutral city). 15min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 150, icon: iconPath('consumables', 'scroll_of_valoryn.png'), consumeEffect: { specialEffect: 'teleport_valoryn', cooldown: 900 } },
    // Dominion (contested/dangerous zones)
    { id: 'scroll_dreadmar',   name: 'Scroll of Dreadmar',    description: 'Teleport to Dreadmar (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, icon: iconPath('consumables', 'scroll_of_dreadmar.png'), consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_whispers',   name: 'Scroll of Whispers',    description: 'Teleport to Whispers (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, icon: iconPath('consumables', 'scroll_of_whispers.png'), consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_stonegrave',  name: 'Scroll of Stonegrave',  description: 'Teleport to Stonegrave (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, icon: iconPath('consumables', 'scroll_of_stonegrave.png'), consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_eclipse',    name: 'Scroll of Eclipse',     description: 'Teleport to Eclipse (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, icon: iconPath('consumables', 'scroll_of_eclipse.png'), consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_fallen',     name: 'Scroll of the Fallen',  description: 'Teleport to the Fallen (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, icon: iconPath('consumables', 'scroll_of_fallen.png'), consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    // Ultimate scroll
    { id: 'scroll_atlas',      name: 'Scroll of Atlas',       description: 'Teleport to any discovered location. 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 5, sellPrice: 2000, icon: iconPath('consumables', 'scroll_of_atlas.png'), consumeEffect: { specialEffect: 'teleport_any', cooldown: 3600 } },
  ];
}

// ==================== FULL TEMPLATE REGISTRY ====================

let _allTemplates: Map<string, ItemTemplate> | null = null;

export function getAllItemTemplates(): Map<string, ItemTemplate> {
  if (_allTemplates) return _allTemplates;

  const list: ItemTemplate[] = [
    ...generateArmorTemplates(),
    ...generateWeaponTemplates(),
    ...generateFighterOffhandTemplates(),
    ...generateShieldTemplates(),
    ...generatePendantTemplates(),
    ...generateRingTemplates(),
    ...generateWingTemplates(),
    ...generateCapeTemplates(),
    ...generateConsumableTemplates(),
    ...generatePotionTemplates(),
    ...generateScrollTemplates(),
    ...generateMaterialTemplates(),
    ...CRYSTAL_TEMPLATES,
  ];

  _allTemplates = new Map(list.map(t => [t.id, t]));
  return _allTemplates;
}

export function getItemTemplate(id: string): ItemTemplate | undefined {
  return getAllItemTemplates().get(id);
}

export function getTemplatesByType(type: string): ItemTemplate[] {
  return Array.from(getAllItemTemplates().values()).filter(t => t.type === type);
}

export function getTemplatesBySlot(slot: string): ItemTemplate[] {
  return Array.from(getAllItemTemplates().values()).filter(t => t.slot === slot);
}

export function getTemplatesByClass(cls: string, tier?: number): ItemTemplate[] {
  return Array.from(getAllItemTemplates().values()).filter(t =>
    (!t.requiredClass || t.requiredClass === cls) && (tier === undefined || t.tier === tier)
  );
}
