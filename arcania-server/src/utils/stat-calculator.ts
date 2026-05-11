import type { StatBlock, DerivedStats, ItemData, DerivedStatKey, CharacterClass } from '../types/index.js';
import { CLASS_BASE_STATS, STAT_CAPS } from './game-constants.js';
import { SET_BONUSES } from '../data/item-templates.js';
import { STAT_MULTIPLIERS, BASE_DERIVED, LEVEL_SCALING, DODGE_CAP } from '../config/balance/stat-multipliers.js';

export interface EquipmentBonuses {
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicResistance: number;
  maxHp: number;
  maxMana: number;
  criticalChance: number;
  criticalDamage: number;
  attackSpeed: number;
  armorPenetration: number;
  magicPenetration: number;
  hpRegen: number;
  manaRegen: number;
  movementSpeed: number;
}

export function getEquipmentBonuses(equippedItems: (ItemData | null | undefined)[]): EquipmentBonuses {
  const bonuses: EquipmentBonuses = {
    physicalAttack: 0, magicAttack: 0, physicalDefense: 0, magicResistance: 0,
    maxHp: 0, maxMana: 0, criticalChance: 0, criticalDamage: 0, attackSpeed: 0,
    armorPenetration: 0, magicPenetration: 0, hpRegen: 0, manaRegen: 0, movementSpeed: 0,
  };

  for (const item of equippedItems) {
    if (!item) continue;

    // Tally gem contributions from sockets so we can separate them from base item stats.
    // socketGem() writes gem values directly onto the item's top-level stat properties,
    // so the flat stats (e.g. item.physicalAttack) already include gem contributions.
    // For derived stats this is fine (block 1 reads them once).
    // For primary stats (strength, agility, etc.) we must exclude the gem portion
    // to prevent the conversion chain (block 2) from double-counting gems that
    // were already baked into the derived stat properties.
    const gemContributions: Record<string, number> = {};
    if (item.sockets) {
      for (const socket of item.sockets) {
        if (socket.gemStat && socket.gemValue) {
          gemContributions[socket.gemStat] = (gemContributions[socket.gemStat] || 0) + socket.gemValue;
        }
      }
    }

    // Direct stat bonuses (includes gem-added derived stats — counted once here)
    bonuses.physicalAttack += item.physicalAttack || 0;
    bonuses.magicAttack += item.magicAttack || 0;
    bonuses.physicalDefense += item.physicalDefense || 0;
    bonuses.magicResistance += item.magicResistance || 0;
    bonuses.maxHp += item.maxHp || 0;
    bonuses.maxMana += item.maxMana || 0;
    bonuses.criticalChance += item.criticalChance || 0;
    bonuses.criticalDamage += item.criticalDamage || 0;
    bonuses.attackSpeed += item.attackSpeed || 0;
    bonuses.armorPenetration += item.armorPenetration || 0;
    bonuses.magicPenetration += item.magicPenetration || 0;
    bonuses.hpRegen += item.hpRegen || 0;
    bonuses.manaRegen += item.manaRegen || 0;
    bonuses.movementSpeed += item.movementSpeed || 0;

    // Primary stat contributions to derived stats
    // Subtract gem contributions to primary stats to avoid double-counting
    // (gem values are already included in the derived stat properties above)
    const baseStrength = (item.strength || 0) - (gemContributions['strength'] || 0);
    const baseAgility = (item.agility || 0) - (gemContributions['agility'] || 0);
    const baseIntelligence = (item.intelligence || 0) - (gemContributions['intelligence'] || 0);
    const baseVitality = (item.vitality || 0) - (gemContributions['vitality'] || 0);
    const baseSpirit = (item.spirit || 0) - (gemContributions['spirit'] || 0);

    bonuses.physicalAttack += baseStrength * STAT_MULTIPLIERS.strength.physicalAttack;
    bonuses.armorPenetration += baseStrength * STAT_MULTIPLIERS.strength.armorPenetration;
    bonuses.magicAttack += baseIntelligence * STAT_MULTIPLIERS.intelligence.magicAttack;
    bonuses.maxMana += baseIntelligence * STAT_MULTIPLIERS.intelligence.maxMana;
    bonuses.magicPenetration += baseIntelligence * STAT_MULTIPLIERS.intelligence.magicPenetration;
    bonuses.maxHp += baseVitality * STAT_MULTIPLIERS.vitality.maxHp;
    bonuses.physicalDefense += baseVitality * STAT_MULTIPLIERS.vitality.physicalDefense;
    bonuses.hpRegen += baseVitality * STAT_MULTIPLIERS.vitality.hpRegen;
    bonuses.criticalChance += baseAgility * STAT_MULTIPLIERS.agility.criticalChance;
    bonuses.criticalDamage += baseAgility * STAT_MULTIPLIERS.agility.criticalDamage;
    bonuses.attackSpeed += baseAgility * STAT_MULTIPLIERS.agility.attackSpeed;
    bonuses.maxMana += baseSpirit * STAT_MULTIPLIERS.spirit.maxMana;
    bonuses.magicResistance += baseSpirit * STAT_MULTIPLIERS.spirit.magicResistance;
    bonuses.manaRegen += baseSpirit * STAT_MULTIPLIERS.spirit.manaRegen;
  }

  return bonuses;
}

function getSetBonuses(equippedItems: (ItemData | null | undefined)[], characterClass: string): Partial<Record<DerivedStatKey, number>> {
  const setCounts: Record<string, number> = {};
  for (const item of equippedItems) {
    if (!item?.setId) continue;
    setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
  }

  const result: Partial<Record<DerivedStatKey, number>> = {};
  for (const [setId, count] of Object.entries(setCounts)) {
    if (count < 2) continue;
    const bonuses = SET_BONUSES.filter(b =>
      b.setId === setId &&
      b.piecesRequired <= count &&
      (!b.className || b.className === characterClass)
    );
    for (const bonus of bonuses) {
      result[bonus.bonusStat] = (result[bonus.bonusStat] || 0) + bonus.bonusValue;
    }
  }
  return result;
}

export function calculateDerivedStats(
  primaryStats: StatBlock,
  characterClass: string | CharacterClass,
  level: number,
  equippedItems: (ItemData | null | undefined)[] = []
): DerivedStats {
  const classBase = CLASS_BASE_STATS[characterClass as CharacterClass];
  const equipBonuses = getEquipmentBonuses(equippedItems);
  const setBonuses = getSetBonuses(equippedItems, characterClass);

  // Helper to get set bonus for a stat
  const sb = (stat: DerivedStatKey) => setBonuses[stat] || 0;

  const rawCritChance = BASE_DERIVED.criticalChance + (primaryStats.agility * STAT_MULTIPLIERS.agility.criticalChance) + equipBonuses.criticalChance + sb('criticalChance');
  const rawCritDamage = BASE_DERIVED.criticalDamage + (primaryStats.agility * STAT_MULTIPLIERS.agility.criticalDamage) + equipBonuses.criticalDamage + sb('criticalDamage');
  const rawArmorPen = (primaryStats.strength * STAT_MULTIPLIERS.strength.armorPenetration) + equipBonuses.armorPenetration + sb('armorPenetration');
  const rawMagicPen = (primaryStats.intelligence * STAT_MULTIPLIERS.intelligence.magicPenetration) + equipBonuses.magicPenetration + sb('magicPenetration');

  return {
    maxHp: classBase.baseHp + (primaryStats.vitality * STAT_MULTIPLIERS.vitality.maxHp) + (level * LEVEL_SCALING.hpPerLevel) + equipBonuses.maxHp + sb('maxHp'),
    maxMana: classBase.baseMana + (primaryStats.intelligence * STAT_MULTIPLIERS.intelligence.maxMana) + (primaryStats.spirit * STAT_MULTIPLIERS.spirit.maxMana) + (level * LEVEL_SCALING.manaPerLevel) + equipBonuses.maxMana + sb('maxMana'),
    physicalAttack: (primaryStats.strength * STAT_MULTIPLIERS.strength.physicalAttack) + equipBonuses.physicalAttack + sb('physicalAttack'),
    magicAttack: (primaryStats.intelligence * STAT_MULTIPLIERS.intelligence.magicAttack) + equipBonuses.magicAttack + sb('magicAttack'),
    physicalDefense: (primaryStats.vitality * STAT_MULTIPLIERS.vitality.physicalDefense) + equipBonuses.physicalDefense + sb('physicalDefense'),
    magicResistance: (primaryStats.spirit * STAT_MULTIPLIERS.spirit.magicResistance) + equipBonuses.magicResistance + sb('magicResistance'),
    criticalChance: Math.min(rawCritChance, STAT_CAPS.criticalChance),
    criticalDamage: Math.min(rawCritDamage, STAT_CAPS.criticalDamage),
    attackSpeed: Math.min(
      BASE_DERIVED.attackSpeed * (1 + primaryStats.agility * 0.005) * (1 + equipBonuses.attackSpeed / 100),
      STAT_CAPS.attackSpeedSoftCap
    ),
    armorPenetration: Math.min(rawArmorPen, STAT_CAPS.armorPenetration),
    magicPenetration: Math.min(rawMagicPen, STAT_CAPS.magicPenetration),
    dodgeChance: Math.min(BASE_DERIVED.dodgeChance + (primaryStats.agility * STAT_MULTIPLIERS.agility.dodgeChance) + sb('dodgeChance'), DODGE_CAP),
    hpRegen: (primaryStats.vitality * STAT_MULTIPLIERS.vitality.hpRegen) + (primaryStats.spirit * STAT_MULTIPLIERS.spirit.hpRegen) + equipBonuses.hpRegen + sb('hpRegen'),
    manaRegen: (primaryStats.spirit * STAT_MULTIPLIERS.spirit.manaRegen) + equipBonuses.manaRegen + sb('manaRegen'),
    movementSpeed: BASE_DERIVED.movementSpeed + (primaryStats.agility * STAT_MULTIPLIERS.agility.movementSpeed) + equipBonuses.movementSpeed + sb('movementSpeed'),
    blockChance: sb('blockChance'),
    prestigeDamage: sb('prestigeDamage'),
  };
}
