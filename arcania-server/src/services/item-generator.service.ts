// Item Generator Service — server-side item instance rolling

import type {
  ItemInstance,
  DerivedStatKey,
  SocketSlot,
  RolledStat,
} from '../types/index.js';
import type { ItemType, EquipmentSlot } from '../types/index.js';
import {
  getItemTemplate,
  ItemTemplate,
  getTierConfig,
  IDENTITY_STATS,
  BONUS_STAT_POOLS,
  BONUS_STAT_RANGES,
  PRESTIGE_STATS,
  PRESTIGE_DROP_CHANCE,
  getEnhancementBonusPercent,
  StatRange,
} from '../data/item-templates.js';
import { randomUUID } from 'crypto';

function rollRange(range: StatRange): number {
  return range.min + Math.random() * (range.max - range.min);
}

function roundStat(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function mapItemType(type: string): string {
  return type; // Server uses string enums
}

export interface RollOptions {
  forcePrestige?: boolean;
  forceEnhancement?: number;
  tier?: number;
}

export function rollItemInstance(templateId: string, options?: RollOptions): ItemInstance {
  const template = getItemTemplate(templateId);
  if (!template) throw new Error(`Unknown template: ${templateId}`);
  return rollFromTemplate(template, options);
}

export function rollFromTemplate(template: ItemTemplate, options?: RollOptions): ItemInstance {
  const tier = options?.tier ?? template.tier;
  const tierCfg = getTierConfig(tier);

  let baseStat = 0;
  if (template.baseStatMin > 0 || template.baseStatMax > 0) {
    baseStat = roundStat(rollRange({ min: template.baseStatMin, max: template.baseStatMax }), 0);
  }

  let identityStat: DerivedStatKey | undefined;
  let identityValue: number | undefined;
  if (template.identityKey && IDENTITY_STATS[template.identityKey]) {
    const idConfig = IDENTITY_STATS[template.identityKey];
    const range = idConfig.ranges[tier];
    if (range) {
      identityStat = idConfig.stat;
      identityValue = roundStat(rollRange(range));
    }
  }

  const bonusStats: RolledStat[] = [];
  if (template.bonusPoolKey && BONUS_STAT_POOLS[template.bonusPoolKey]) {
    const pool = [...BONUS_STAT_POOLS[template.bonusPoolKey]];
    const count = tierCfg.bonusStatCount;
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      const stat = pool.splice(idx, 1)[0];
      const range = BONUS_STAT_RANGES[stat]?.[tier];
      if (range) {
        bonusStats.push({ stat, value: roundStat(rollRange(range)) });
      }
    }
  }

  const forcePrestige = options?.forcePrestige ?? false;
  const isPrestige = forcePrestige || Math.random() < PRESTIGE_DROP_CHANCE;
  let prestigeStat: DerivedStatKey | undefined;
  let prestigeValue: number | undefined;
  if (isPrestige && template.prestigeKey && PRESTIGE_STATS[template.prestigeKey]) {
    const pCfg = PRESTIGE_STATS[template.prestigeKey];
    prestigeStat = pCfg.stat;
    prestigeValue = pCfg.values[tier] ?? 0;
  }

  const sockets: SocketSlot[] = [];
  for (let i = 0; i < template.socketCount; i++) {
    sockets.push({ gemId: null });
  }

  const enhancementLevel = options?.forceEnhancement ?? 0;

  const instance: ItemInstance = {
    instanceId: randomUUID(),
    templateId: template.id,
    name: template.name,
    description: template.description,
    type: template.type as ItemType,
    slot: template.slot as EquipmentSlot | undefined,
    tier,
    requiredLevel: template.requiredLevel,
    requiredClass: template.requiredClass as ItemInstance['requiredClass'],
    baseStat,
    baseStatType: template.baseStatType,
    identityStat,
    identityValue,
    bonusStats,
    isPrestige,
    prestigeStat,
    prestigeValue,
    sockets,
    enhancementLevel,
    setId: template.setId,
    stackable: template.stackable,
    maxStack: template.maxStack,
    sellPrice: template.sellPrice,
    icon: template.icon,
    spriteInfo: template.spriteInfo,
    effectiveStats: {},
  };

  instance.effectiveStats = computeEffectiveStats(instance);
  return instance;
}

export function computeEffectiveStats(instance: ItemInstance): Partial<Record<DerivedStatKey, number>> {
  const stats: Record<string, number> = {};

  function add(key: string, value: number) {
    stats[key] = (stats[key] || 0) + value;
  }

  if (instance.baseStat > 0) {
    if (instance.baseStatType === 'defense') {
      add('physicalDefense', instance.baseStat);
    } else if (instance.baseStatType === 'damage') {
      if (instance.identityStat === 'magicAttack') {
        add('magicAttack', instance.baseStat);
      } else {
        add('physicalAttack', instance.baseStat);
      }
    }
  }

  if (instance.identityStat && instance.identityValue) {
    add(instance.identityStat, instance.identityValue);
  }

  for (const bonus of instance.bonusStats) {
    add(bonus.stat, bonus.value);
  }

  for (const socket of instance.sockets) {
    if (socket.gemStat && socket.gemValue) {
      add(socket.gemStat, socket.gemValue);
    }
  }

  if (instance.isPrestige && instance.prestigeStat && instance.prestigeValue) {
    add(instance.prestigeStat, instance.prestigeValue);
  }

  const enhBonus = getEnhancementBonusPercent(instance.enhancementLevel);
  if (enhBonus > 0) {
    const multiplier = 1 + enhBonus / 100;
    for (const key of Object.keys(stats)) {
      stats[key] = stats[key] * multiplier;
    }
  }

  const result: Partial<Record<DerivedStatKey, number>> = {};
  for (const [key, value] of Object.entries(stats)) {
    if (value !== 0) {
      result[key as DerivedStatKey] = roundStat(value);
    }
  }

  return result;
}
