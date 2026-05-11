// Balance config — stat multipliers used in derived stat calculations.
// Edit these values to tune how primary stats translate into combat stats.

export const STAT_MULTIPLIERS = {
  strength: {
    physicalAttack: 2.0,
    armorPenetration: 0.05,
  },
  agility: {
    criticalChance: 0.12,
    criticalDamage: 0.25,
    attackSpeed: 0.5,
    dodgeChance: 0.1,
    movementSpeed: 0.1,
  },
  intelligence: {
    magicAttack: 2.5,
    maxMana: 8,
    magicPenetration: 0.05,
  },
  vitality: {
    maxHp: 12,
    physicalDefense: 2,
    hpRegen: 0.5,
  },
  spirit: {
    maxMana: 4,
    magicResistance: 2,
    manaRegen: 0.8,
    hpRegen: 0.2,
  },
};

/** Flat base values added to derived stats before primary stat contributions. */
export const BASE_DERIVED = {
  criticalChance: 5,
  criticalDamage: 125,
  dodgeChance: 3,
  movementSpeed: 100,
  attackSpeed: 1.0,
};

/** HP and mana gained per character level. */
export const LEVEL_SCALING = {
  hpPerLevel: 15,
  manaPerLevel: 8,
};

/** Hard cap for dodge chance (percentage). */
export const DODGE_CAP = 40;
