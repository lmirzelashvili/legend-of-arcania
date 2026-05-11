import { Race, CharacterClass as Class } from '@shared/enums';
import type { StatBonuses } from '@shared/types';

// ==================== RE-EXPORTS FROM SHARED ====================

export {
  CLASS_BASE_STATS,
  STAT_CAPS,
  STAT_POINTS_CONFIG,
  calculateTotalStatPoints,
  MAX_LEVEL,
  xpRequiredForLevel,
  statPointsForLevelUp,
  RACIAL_BONUSES,
  RACE_CLASS_COMPATIBILITY,
  calculateBaseStats,
  STAT_NAMES,
  VAULT_TIER_CONFIG,
  BAG_CAPACITY_CONFIG,
  calculateBagCapacity,
  SPIN_REWARDS,
} from '@shared/constants';

export type { ClassBaseConfig, BagCapacityConfig } from '@shared/constants';
export type { StatBonuses } from '@shared/types';

// ==================== CLIENT-ONLY CONSTANTS ====================
// RACE_INFO and CLASS_INFO contain UI-specific display data (lore, colors, difficulty)
// that belongs only in the client.

// Race Information with lore and display data
export const RACE_INFO: Record<Race, {
  name: string;
  description: string;
  identity: string;
  lore: string;
  baseStats: StatBonuses;
  bonuses: string[];
}> = {
  [Race.HUMAN]: {
    name: 'Human',
    description: 'The Unbound Children',
    identity: 'The Unbound Children',
    lore: 'The youngest of Arcania\'s races, humans carry no cosmic burden-only the gift of choice. Their lack of cosmic allegiance makes them truly free.',
    baseStats: {
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      spirit: 10,
    },
    bonuses: ['All Stats +1', '+5% XP Gain'],
  },
  [Race.LUMINAR]: {
    name: 'Luminar',
    description: 'Fragments of the First Light',
    identity: 'Fragments of the First Light',
    lore: 'When Anias awakened, her first intentional act was creation. The Luminar were born from her deliberate radiance-willed into existence as extensions of her divine light.',
    baseStats: {
      strength: 8,
      agility: 10,
      intelligence: 13,
      vitality: 8,
      spirit: 11,
    },
    bonuses: ['INT +3', 'SPR +3'],
  },
  [Race.LILIN]: {
    name: 'Lilin',
    description: 'Daughters of the First Forest',
    identity: 'Daughters of the First Forest',
    lore: 'While Anias slumbered, her peaceful dreams took form. The Lilin emerged from the First Forest-small, graceful beings of pure magic and innocent hearts. They are the oldest mortals in existence.',
    baseStats: {
      strength: 8,
      agility: 14,
      intelligence: 10,
      vitality: 8,
      spirit: 10,
    },
    bonuses: ['AGI +4', 'SPR +2'],
  },
  [Race.DARKAN]: {
    name: 'Darkan',
    description: 'Heirs of the Dark Titan',
    identity: 'Heirs of the Dark Titan',
    lore: 'When the Dark Titan was destroyed, its physical form scattered across the cosmos. The Darkan coalesced from this matter-not children of evil, but of ambition itself.',
    baseStats: {
      strength: 14,
      agility: 10,
      intelligence: 8,
      vitality: 12,
      spirit: 6,
    },
    bonuses: ['STR +4', 'VIT +4'],
  },
};

// Class Information with display data (role, difficulty, color, starting abilities)
export const CLASS_INFO: Record<Class, {
  name: string;
  role: string;
  description: string;
  playstyle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statPriority: StatBonuses;
  primaryStat: keyof StatBonuses;
  startingAbilities: string[];
  color: string;
}> = {
  [Class.PALADIN]: {
    name: 'Paladin',
    role: 'Tank',
    description: 'Heavy armor tank specializing in protecting allies and controlling enemies',
    playstyle: 'Lead the charge, absorb damage, and shield your allies with divine protection.',
    difficulty: 'Medium',
    statPriority: {
      strength: 14,
      agility: 8,
      intelligence: 6,
      vitality: 14,
      spirit: 8,
    },
    primaryStat: 'vitality',
    startingAbilities: ['Divine Shield', 'Consecration', 'Righteous Strike'],
    color: 'amber',
  },
  [Class.CLERIC]: {
    name: 'Cleric',
    role: 'Healer',
    description: 'Primary healer with reactive healing and preventative buffs',
    playstyle: 'Keep your party alive with powerful heals and protective blessings.',
    difficulty: 'Hard',
    statPriority: {
      strength: 6,
      agility: 6,
      intelligence: 12,
      vitality: 10,
      spirit: 16,
    },
    primaryStat: 'spirit',
    startingAbilities: ['Holy Light', 'Blessing of Protection', 'Purify'],
    color: 'emerald',
  },
  [Class.MAGE]: {
    name: 'Mage',
    role: 'Magic DPS',
    description: 'Ranged magic damage dealer with powerful area control',
    playstyle: 'Unleash devastating spells from a distance, controlling the battlefield with arcane power.',
    difficulty: 'Medium',
    statPriority: {
      strength: 4,
      agility: 10,
      intelligence: 18,
      vitality: 8,
      spirit: 10,
    },
    primaryStat: 'intelligence',
    startingAbilities: ['Fireball', 'Frost Nova', 'Arcane Missiles'],
    color: 'purple',
  },
  [Class.FIGHTER]: {
    name: 'Warrior',
    role: 'Melee DPS',
    description: 'High-damage melee warrior focused on sustained damage output',
    playstyle: 'Get up close and deal massive damage with powerful weapon strikes.',
    difficulty: 'Easy',
    statPriority: {
      strength: 16,
      agility: 14,
      intelligence: 4,
      vitality: 12,
      spirit: 4,
    },
    primaryStat: 'strength',
    startingAbilities: ['Crushing Blow', 'Whirlwind', 'Battle Cry'],
    color: 'red',
  },
  [Class.RANGER]: {
    name: 'Ranger',
    role: 'Ranged DPS',
    description: 'Mobile ranged damage dealer specializing in kiting and precision',
    playstyle: 'Strike from afar with deadly accuracy, using mobility to stay out of danger.',
    difficulty: 'Medium',
    statPriority: {
      strength: 12,
      agility: 16,
      intelligence: 8,
      vitality: 8,
      spirit: 6,
    },
    primaryStat: 'agility',
    startingAbilities: ['Power Shot', 'Evasive Roll', 'Multi-Shot'],
    color: 'green',
  },
};
