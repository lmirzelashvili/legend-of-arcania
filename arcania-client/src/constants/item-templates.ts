// Item Templates — All static game-design data for the equipment system
// This file is the single source of truth for item generation, stat ranges, and set bonuses.

import { DerivedStatKey, ItemSpriteInfo } from '@/types/game.types';
import {
  PALADIN_ARMOR_SETS,
  FIGHTER_ARMOR_SETS,
  RANGER_ARMOR_SETS,
  CLERIC_ARMOR_SETS,
  MAGE_ARMOR_SETS,
  ArmorSetDefinition,
  ArmorSlot,
  getArmorPropsFromSet,
  extractSpriteInfoForSlot,
} from '@/constants/armor.constants';
import {
  CLASS_WEAPON_SETS,
  FIGHTER_WEAPONS,
  getWeaponPropsFromSet,
} from '@/constants/weapon.constants';
import { Class } from '@/types/game.types';
import {
  CAPE_ITEMS,
  WING_ITEMS,
  SHIELD_ITEMS,
} from '@/constants/equipment.constants';

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

export const ENHANCEMENT_SUCCESS_RATES: Record<number, number> = {
  1: 0.95, 2: 0.90, 3: 0.85, 4: 0.75, 5: 0.65,
  6: 0.55, 7: 0.45, 8: 0.40, 9: 0.35, 10: 0.30,
  11: 0.25, 12: 0.20, 13: 0.15, 14: 0.10, 15: 0.05,
};

export type EnhanceFailureResult = 'crystal_consumed' | 'level_drop' | 'destroyed';

export function getEnhanceFailureResult(targetLevel: number): { result: EnhanceFailureResult; dropTo?: number } {
  if (targetLevel <= 4) return { result: 'crystal_consumed' };
  if (targetLevel <= 7) return { result: 'level_drop', dropTo: 4 };
  if (targetLevel <= 10) return { result: 'level_drop', dropTo: 5 };
  return { result: 'destroyed' };
}

export type CrystalType = 'spirit' | 'dominion';

export function getRequiredCrystal(targetLevel: number): CrystalType {
  return targetLevel <= 7 ? 'spirit' : 'dominion';
}

// Enhancement stat bonus: cumulative % increase
// +1 to +5: +2% each = +10% at +5
// +6 to +7: +3% each = +16% at +7
// +8 to +10: +3% each = +25% at +10
// +11 to +15: +5% each = +50% at +15
export function getEnhancementBonusPercent(level: number): number {
  if (level <= 0) return 0;
  let bonus = 0;
  for (let i = 1; i <= level; i++) {
    if (i <= 5) bonus += 2;
    else if (i <= 7) bonus += 3;
    else if (i <= 10) bonus += 3;
    else bonus += 5;
  }
  return bonus;
}

// ==================== PRESTIGE CHANCE ====================

export const PRESTIGE_DROP_CHANCE = 0.10; // 10%

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
  },
  {
    id: 'gem_void', name: 'Gem of Void', gemType: 'VOID',
    statRanges: {
      physicalDefense: { min: 15, max: 21 },
      magicResistance: { min: 15, max: 21 },
      maxHp: { min: 75, max: 105 },
    },
    sellPrice: 500,
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
  },
  {
    id: 'crystal_dominion', name: 'Crystal of Dominion', description: 'Used to enhance equipment from +8 to +15.',
    type: 'CRYSTAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0,
    socketCount: 0, stackable: true, maxStack: 99, sellPrice: 2000,
  },
  {
    id: 'crystal_creation', name: 'Crystal of Creation', description: 'Required for all forging recipes. T1:1, T2:2, T3:3, T4:4, T5:6 crystals needed.',
    type: 'MATERIAL' as const, slot: 'NONE' as const, tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0,
    socketCount: 0, stackable: true, maxStack: 99, sellPrice: 200, icon: 'crystal_creation',
  },
];

// ==================== SLOT ICON MAP ====================

const SLOT_ICON: Record<string, string> = {
  HEAD: '/assets/icons/equipment/head.svg',
  CHEST: '/assets/icons/equipment/chest.svg',
  LEGS: '/assets/icons/equipment/legs.svg',
  BOOTS: '/assets/icons/equipment/boots.svg',
  GLOVES: '/assets/icons/equipment/gloves.svg',
  WEAPON: '/assets/icons/equipment/weapon.svg',
  OFF_HAND: '/assets/icons/equipment/shield.svg',
  CAPE: '/assets/icons/items/accessories/sentinel_cape.png',
  WINGS: '/assets/icons/items/accessories/sentinel_wings.png',
  PENDANT: '/assets/icons/equipment/neck.svg',
  RING: '/assets/icons/equipment/ring.svg',
};

// ==================== ARMOR SET ARRAYS (avoids Mage→Cleric bug in CLASS_ARMOR_SETS) ====================

const CLASS_ARMOR_MAP: Record<string, ArmorSetDefinition[]> = {
  PALADIN: PALADIN_ARMOR_SETS,
  FIGHTER: FIGHTER_ARMOR_SETS,
  RANGER: RANGER_ARMOR_SETS,
  CLERIC: CLERIC_ARMOR_SETS,
  MAGE: MAGE_ARMOR_SETS,
};

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
    const armorSets = CLASS_ARMOR_MAP[cls];
    for (let ti = 0; ti < TIERS.length; ti++) {
      const tier = TIERS[ti];
      const cfg = getTierConfig(tier);
      const setName = CLASS_SET_NAMES[cls][ti];
      const setId = `${cls.toLowerCase()}_t${tier}`;
      const armorSet = armorSets?.[ti];
      const armorProps = armorSet ? getArmorPropsFromSet(armorSet) : undefined;
      for (const slot of ARMOR_SLOTS) {
        let spriteInfo: ItemSpriteInfo | undefined;
        if (armorProps) {
          if (slot === 'GLOVES') {
            // GLOVES slot controls gloves + shoulders + bracers sprite layers
            spriteInfo = {
              armsType: armorProps.arms, armsMaterial: armorProps.armsMaterial,
              shouldersType: armorProps.shoulders, shouldersMaterial: armorProps.shouldersMaterial,
              bracersType: armorProps.bracers, bracersMaterial: armorProps.bracersMaterial,
            };
          } else {
            spriteInfo = extractSpriteInfoForSlot(armorProps, slot as ArmorSlot);
          }
        }
        const id = `${cls.toLowerCase()}_t${tier}_${slot.toLowerCase()}`;
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
          icon: SLOT_ICON[slot],
          spriteInfo,
        });
      }
    }
  }
  return templates;
}

// Weapon definitions: class → [name1..name5], isPhysical
const CLASS_WEAPONS: Record<string, { names: string[]; isMagic: boolean }> = {
  PALADIN: { names: ['Iron Mace', 'Guardian Mace', 'Noble Flail', 'Colossus Maul', 'Dawn Breaker'], isMagic: false },
  FIGHTER: { names: ['Iron Sword', 'Gladius', 'Noble Blade', 'Berserker Axe', 'Doom Blade'], isMagic: false },
  RANGER:  { names: ['Short Bow', "Hunter's Bow", 'Black Bow', 'Venom Bow', 'Phantom Bow'], isMagic: false },
  CLERIC:  { names: ['Wooden Staff', 'Spirit Staff', 'Silver Staff', 'Manticore Staff', 'Oracle Staff'], isMagic: true },
  MAGE:    { names: ['Apprentice Staff', 'Crystal Staff', 'Flame Staff', 'Void Staff', 'Archmage Staff'], isMagic: true },
};

function generateWeaponTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (const cls of CLASSES) {
    const { names, isMagic } = CLASS_WEAPONS[cls];
    const weaponSets = CLASS_WEAPON_SETS[cls as Class];
    for (let ti = 0; ti < TIERS.length; ti++) {
      const tier = TIERS[ti];
      const cfg = getTierConfig(tier);
      const id = `${cls.toLowerCase()}_weapon_t${tier}`;
      let spriteInfo: ItemSpriteInfo | undefined;
      const weaponSet = weaponSets?.[ti];
      if (weaponSet) {
        const weaponProps = getWeaponPropsFromSet(weaponSet);
        spriteInfo = { weaponType: weaponProps.weapon, weaponColor: weaponProps.weaponColor };
      }
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
        icon: SLOT_ICON['WEAPON'],
        spriteInfo,
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
    let spriteInfo: ItemSpriteInfo | undefined;
    const fighterWeapon = FIGHTER_WEAPONS[ti];
    if (fighterWeapon?.offHand && 'color' in fighterWeapon.offHand) {
      const offHand = fighterWeapon.offHand as { path: string; color: string };
      const pathParts = offHand.path.split('/');
      spriteInfo = {
        offHandWeapon: pathParts[pathParts.length - 1],
        offHandWeaponColor: offHand.color,
      };
    }
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
      icon: SLOT_ICON['OFF_HAND'],
      spriteInfo,
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
    let spriteInfo: ItemSpriteInfo | undefined;
    const shieldDef = SHIELD_ITEMS[ti];
    if (shieldDef) {
      const pathParts = shieldDef.spritePath.split('/');
      let shieldType = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';
      if (shieldDef.spritePath.includes('round_universal')) shieldType = 'round_universal';
      else if (shieldDef.spritePath.includes('/kite')) shieldType = 'kite';
      else if (shieldDef.spritePath.includes('/heater')) shieldType = 'heater';
      else if (shieldDef.spritePath.includes('/plus')) shieldType = 'plus';
      else if (shieldDef.spritePath.includes('/spartan')) shieldType = 'spartan';
      else if (shieldDef.spritePath.includes('/crusader')) shieldType = 'crusader';
      spriteInfo = { shieldType, shieldVariant: shieldDef.spriteColor };
    }
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
      icon: SLOT_ICON['OFF_HAND'],
      spriteInfo,
    });
  }
  return templates;
}

// Pendants
const PENDANT_NAMES = ['Pendant of Vharun', 'Pendant of Saelistra', 'Pendant of Kharagul', 'Pendant of Morgathis', 'Pendant of Cassian'];

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
      icon: SLOT_ICON['PENDANT'],
    });
  }
  return templates;
}

// Rings
const RING_NAMES = ['Ring of Vharun', 'Ring of Saelistra', 'Ring of Kharagul', 'Ring of Morgathis', 'Ring of Cassian'];

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
      icon: SLOT_ICON['RING'],
    });
  }
  return templates;
}

// Wings (Paladin, Fighter)
const WING_NAMES = ['Sentinel Wings', 'Guardian Wings', 'Draconic Wings', 'Nightfall Wings', 'Celestial Wings'];

function generateWingTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    let spriteInfo: ItemSpriteInfo | undefined;
    const wingDef = WING_ITEMS[ti];
    if (wingDef) {
      const wingType = wingDef.spritePath.split('/').pop() || '';
      spriteInfo = { wingsType: wingType, wingsColor: wingDef.spriteColor };
    }
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
      icon: SLOT_ICON['WINGS'],
      spriteInfo,
    });
  }
  return templates;
}

// Capes (Ranger, Cleric, Mage)
const CAPE_NAMES = ['Sentinel Cape', 'Honor Cape', 'Warlord Cape', 'Infernal Cape', 'Eternal Cape'];

function generateCapeTemplates(): ItemTemplate[] {
  const templates: ItemTemplate[] = [];
  for (let ti = 0; ti < TIERS.length; ti++) {
    const tier = TIERS[ti];
    const cfg = getTierConfig(tier);
    let spriteInfo: ItemSpriteInfo | undefined;
    const capeDef = CAPE_ITEMS[ti];
    if (capeDef) {
      spriteInfo = { capeType: 'solid', capeColor: capeDef.spriteColor };
    }
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
      icon: SLOT_ICON['CAPE'],
      spriteInfo,
    });
  }
  return templates;
}

// Consumables — Elixirs of Life, Mana, and Power (per game design docs)
function generateConsumableTemplates(): ItemTemplate[] {
  return [
    // Elixirs of Life (HP restore)
    { id: 'elixir_life_sm', name: 'Elixir of Life (SM)', description: 'Restores 150 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 25,   consumeEffect: { hpRestore: 150, cooldown: 10 } },
    { id: 'elixir_life_md', name: 'Elixir of Life (MD)', description: 'Restores 350 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 75,   consumeEffect: { hpRestore: 350, cooldown: 10 } },
    { id: 'elixir_life_lg', name: 'Elixir of Life (LG)', description: 'Restores 600 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 200,  consumeEffect: { hpRestore: 600, cooldown: 10 } },
    { id: 'elixir_life_xl', name: 'Elixir of Life (XL)', description: 'Restores 1000 HP.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 500,  consumeEffect: { hpRestore: 1000, cooldown: 10 } },
    // Elixirs of Mana (Mana restore)
    { id: 'elixir_mana_sm', name: 'Elixir of Mana (SM)', description: 'Restores 100 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 25,   consumeEffect: { manaRestore: 100, cooldown: 10 } },
    { id: 'elixir_mana_md', name: 'Elixir of Mana (MD)', description: 'Restores 250 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 75,   consumeEffect: { manaRestore: 250, cooldown: 10 } },
    { id: 'elixir_mana_lg', name: 'Elixir of Mana (LG)', description: 'Restores 450 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 200,  consumeEffect: { manaRestore: 450, cooldown: 10 } },
    { id: 'elixir_mana_xl', name: 'Elixir of Mana (XL)', description: 'Restores 750 Mana.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 500,  consumeEffect: { manaRestore: 750, cooldown: 10 } },
    // Elixirs of Power (ATK buff)
    { id: 'elixir_power_sm', name: 'Elixir of Power (SM)', description: '+5% ATK for 5 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1,  baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 50,   consumeEffect: { buffStat: 'physicalAttack', buffValue: 5, buffDuration: 300, cooldown: 10 } },
    { id: 'elixir_power_md', name: 'Elixir of Power (MD)', description: '+10% ATK for 10 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 150,  consumeEffect: { buffStat: 'physicalAttack', buffValue: 10, buffDuration: 600, cooldown: 10 } },
    { id: 'elixir_power_lg', name: 'Elixir of Power (LG)', description: '+15% ATK for 15 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 400,  consumeEffect: { buffStat: 'physicalAttack', buffValue: 15, buffDuration: 900, cooldown: 10 } },
    { id: 'elixir_power_xl', name: 'Elixir of Power (XL)', description: '+20% ATK for 30 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 50, sellPrice: 1000, consumeEffect: { buffStat: 'physicalAttack', buffValue: 20, buffDuration: 1800, cooldown: 10 } },
  ];
}

// Material templates — per game design docs
function generateMaterialTemplates(): ItemTemplate[] {
  return [
    { id: 'material_feather_of_roc',      name: 'Feather of Roc',      description: 'Used to forge Wings.',                          type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 50 },
    { id: 'material_thread_of_silkworm',   name: 'Thread of Silkworm',  description: 'Used to forge Capes.',                          type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 50 },
    { id: 'material_finger_of_titan',      name: 'Finger of Titan',     description: '250 = forge random T4-T5 armor.',               type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 100 },
    { id: 'material_fang_of_griffin',       name: 'Fang of Griffin',     description: '250 = forge random T4-T5 weapon/shield.',       type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 100 },
    { id: 'material_hand_of_blacksmith',    name: 'Hand of Blacksmith',  description: 'Remove gem from socket (destroys gem).',        type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 25 },
    { id: 'material_hand_of_forgemaster',   name: 'Hand of Forgemaster', description: 'Upgrade Standard to Prestige quality.',        type: 'MATERIAL', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 99, sellPrice: 500 },
  ];
}

// Scroll templates — 13 scrolls per game design docs
function generateScrollTemplates(): ItemTemplate[] {
  return [
    { id: 'scroll_resurrection', name: 'Scroll of Resurrection', description: 'Revives a fallen ally (5min CD) or self-resurrect (30min CD).', type: 'CONSUMABLE', tier: 0, requiredLevel: 30, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 500,  consumeEffect: { specialEffect: 'resurrect', cooldown: 300 } },
    { id: 'scroll_empowerment', name: 'Scroll of Empowerment', description: 'Grants a random stat buff for 5 minutes.', type: 'CONSUMABLE', tier: 0, requiredLevel: 10, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 200,  consumeEffect: { specialEffect: 'random_buff', cooldown: 300 } },
    // Homeland teleport scrolls (faction capitals)
    { id: 'scroll_meridia',  name: 'Scroll of Meridia',  description: 'Teleport to Meridia (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    { id: 'scroll_lumeria',  name: 'Scroll of Lumeria',  description: 'Teleport to Lumeria (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    { id: 'scroll_lythora',  name: 'Scroll of Lythora',  description: 'Teleport to Lythora (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    { id: 'scroll_redmire',  name: 'Scroll of Redmire',  description: 'Teleport to Redmire (homeland). 30min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 100, consumeEffect: { specialEffect: 'teleport_homeland', cooldown: 1800 } },
    // Neutral city
    { id: 'scroll_valoryn',  name: 'Scroll of Valoryn',  description: 'Teleport to Valoryn (neutral city). 15min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 1, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 20, sellPrice: 150, consumeEffect: { specialEffect: 'teleport_valoryn', cooldown: 900 } },
    // Dominion (contested/dangerous zones)
    { id: 'scroll_dreadmar',   name: 'Scroll of Dreadmar',    description: 'Teleport to Dreadmar (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_whispers',   name: 'Scroll of Whispers',    description: 'Teleport to Whispers (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_stonegrave',  name: 'Scroll of Stonegrave',  description: 'Teleport to Stonegrave (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_eclipse',    name: 'Scroll of Eclipse',     description: 'Teleport to Eclipse (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    { id: 'scroll_fallen',     name: 'Scroll of the Fallen',  description: 'Teleport to the Fallen (dominion). 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 20, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 10, sellPrice: 300, consumeEffect: { specialEffect: 'teleport_dominion', cooldown: 3600 } },
    // Ultimate scroll
    { id: 'scroll_atlas',      name: 'Scroll of Atlas',       description: 'Teleport to any discovered location. 60min cooldown.', type: 'CONSUMABLE', tier: 0, requiredLevel: 50, baseStatMin: 0, baseStatMax: 0, socketCount: 0, stackable: true, maxStack: 5, sellPrice: 2000, consumeEffect: { specialEffect: 'teleport_any', cooldown: 3600 } },
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
