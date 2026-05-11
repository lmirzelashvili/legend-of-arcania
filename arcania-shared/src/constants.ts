// ==================== SHARED GAME CONSTANTS ====================
// Single source of truth for game balance data, stat formulas, and configuration.

import { Race, CharacterClass, VaultTier } from './enums.js';
import type { StatBonuses } from './types.js';

// ==================== CLASS BASE STATS ====================

export interface ClassBaseConfig {
  baseHp: number;
  baseMana: number;
  primaryStats: StatBonuses;
}

export const CLASS_BASE_STATS: Record<CharacterClass, ClassBaseConfig> = {
  [CharacterClass.PALADIN]: {
    baseHp: 200,
    baseMana: 100,
    primaryStats: { strength: 14, intelligence: 6, vitality: 14, agility: 8, spirit: 8 },
  },
  [CharacterClass.FIGHTER]: {
    baseHp: 150,
    baseMana: 80,
    primaryStats: { strength: 16, intelligence: 4, vitality: 12, agility: 14, spirit: 4 },
  },
  [CharacterClass.CLERIC]: {
    baseHp: 120,
    baseMana: 180,
    primaryStats: { strength: 6, intelligence: 12, vitality: 10, agility: 6, spirit: 16 },
  },
  [CharacterClass.MAGE]: {
    baseHp: 100,
    baseMana: 200,
    primaryStats: { strength: 4, intelligence: 18, vitality: 8, agility: 10, spirit: 10 },
  },
  [CharacterClass.RANGER]: {
    baseHp: 120,
    baseMana: 120,
    primaryStats: { strength: 12, intelligence: 8, vitality: 8, agility: 16, spirit: 6 },
  },
};

// ==================== STAT CAPS ====================

export const STAT_CAPS = {
  criticalChance: 50,
  criticalDamage: 200,
  armorPenetration: 40,
  magicPenetration: 40,
  attackSpeedSoftCap: 2.5,
};

// ==================== STAT POINTS PER LEVEL ====================

export const STAT_POINTS_CONFIG = {
  earlyGame: { maxLevel: 50, pointsPerLevel: 5 },
  lateGame: { maxLevel: 85, pointsPerLevel: 4 },
};

export function calculateTotalStatPoints(level: number): number {
  if (level <= 1) return 0;

  const earlyLevels = Math.min(level - 1, STAT_POINTS_CONFIG.earlyGame.maxLevel - 1);
  const lateLevels = Math.max(0, level - STAT_POINTS_CONFIG.earlyGame.maxLevel);

  return (earlyLevels * STAT_POINTS_CONFIG.earlyGame.pointsPerLevel) +
         (lateLevels * STAT_POINTS_CONFIG.lateGame.pointsPerLevel);
}

export const MAX_LEVEL = 85;

export function xpRequiredForLevel(level: number): number {
  return Math.floor(level * 1000 * (1 + level * 0.05));
}

export function statPointsForLevelUp(newLevel: number): number {
  return newLevel <= 50 ? 5 : 4;
}

// ==================== RACIAL BONUSES ====================

export const RACIAL_BONUSES: Record<Race, Partial<StatBonuses>> = {
  [Race.HUMAN]: { strength: 2, agility: 1, intelligence: 1, vitality: 1, spirit: 1 },
  [Race.LUMINAR]: { intelligence: 3, spirit: 3 },
  [Race.LILIN]: { agility: 4, spirit: 2 },
  [Race.DARKAN]: { strength: 3, vitality: 3 },
};

// ==================== RACE-CLASS COMPATIBILITY ====================

export const RACE_CLASS_COMPATIBILITY: Record<Race, CharacterClass[]> = {
  [Race.HUMAN]: [CharacterClass.PALADIN, CharacterClass.CLERIC, CharacterClass.FIGHTER, CharacterClass.RANGER],
  [Race.LUMINAR]: [CharacterClass.CLERIC, CharacterClass.MAGE, CharacterClass.FIGHTER, CharacterClass.RANGER],
  [Race.LILIN]: [CharacterClass.PALADIN, CharacterClass.CLERIC, CharacterClass.MAGE],
  [Race.DARKAN]: [CharacterClass.PALADIN, CharacterClass.MAGE, CharacterClass.FIGHTER],
};

// ==================== STAT CALCULATION ====================

export function calculateBaseStats(race: Race, characterClass: CharacterClass): StatBonuses {
  const classBase = CLASS_BASE_STATS[characterClass].primaryStats;
  const racialBonus = RACIAL_BONUSES[race];

  return {
    strength: classBase.strength + (racialBonus.strength || 0),
    agility: classBase.agility + (racialBonus.agility || 0),
    intelligence: classBase.intelligence + (racialBonus.intelligence || 0),
    vitality: classBase.vitality + (racialBonus.vitality || 0),
    spirit: classBase.spirit + (racialBonus.spirit || 0),
  };
}

// ==================== STAT DISPLAY NAMES (client uses this) ====================

export const STAT_NAMES: Record<keyof StatBonuses, {
  name: string;
  abbr: string;
  color: string;
  description: string;
  effects: string;
}> = {
  strength: {
    name: 'Strength',
    abbr: 'STR',
    color: 'red',
    description: 'Physical power and armor penetration',
    effects: '+2.0 P.ATK, +0.05% Armor Pen per point',
  },
  agility: {
    name: 'Agility',
    abbr: 'AGI',
    color: 'green',
    description: 'Speed, precision, and critical strikes',
    effects: '+0.12% Crit, +0.25% Crit Dmg, +0.5% ATK Spd per point',
  },
  intelligence: {
    name: 'Intelligence',
    abbr: 'INT',
    color: 'purple',
    description: 'Magical power and mana pool',
    effects: '+2.5 M.ATK, +8 Max Mana, +0.05% Magic Pen per point',
  },
  vitality: {
    name: 'Vitality',
    abbr: 'VIT',
    color: 'pink',
    description: 'Health and physical toughness',
    effects: '+12 Max HP, +2.0 P.DEF, +0.5 HP Regen per point',
  },
  spirit: {
    name: 'Spirit',
    abbr: 'SPR',
    color: 'cyan',
    description: 'Magic attunement and mana recovery',
    effects: '+4 Max Mana, +2.0 M.RES, +0.8 Mana Regen per point',
  },
};

// ==================== VAULT TIER CONFIG ====================

export const VAULT_TIER_CONFIG = {
  [VaultTier.BASE]: { slots: 100, cost: 0 },
  [VaultTier.EXPANDED]: { slots: 150, cost: 50000 },
  [VaultTier.PREMIUM]: { slots: 200, cost: 0 },
} as const;

// ==================== BAG CAPACITY ====================

export interface BagCapacityConfig {
  baseSlots: number;
  level30Bonus: number;
  level60Bonus: number;
  premiumBonus: number;
}

export const BAG_CAPACITY_CONFIG: BagCapacityConfig = {
  baseSlots: 40,
  level30Bonus: 20,
  level60Bonus: 20,
  premiumBonus: 20,
};

export function calculateBagCapacity(level: number, hasBattlePass: boolean): number {
  let slots = BAG_CAPACITY_CONFIG.baseSlots;
  if (level >= 30) slots += BAG_CAPACITY_CONFIG.level30Bonus;
  if (level >= 60) slots += BAG_CAPACITY_CONFIG.level60Bonus;
  if (hasBattlePass) slots += BAG_CAPACITY_CONFIG.premiumBonus;
  return slots;
}

// ==================== SPIN REWARDS ====================

import type { SpinReward } from './types.js';

export const SPIN_REWARDS: SpinReward[] = [
  { type: 'gold', gold: 200, weight: 25 },
  { type: 'gold', gold: 500, weight: 20 },
  { type: 'gold', gold: 1000, weight: 12 },
  { type: 'gold', gold: 2000, weight: 5 },
  { type: 'arcanite', arcanite: 5, weight: 15 },
  { type: 'arcanite', arcanite: 10, weight: 10 },
  { type: 'arcanite', arcanite: 15, weight: 5 },
  { type: 'creation_token', weight: 8 },
];
