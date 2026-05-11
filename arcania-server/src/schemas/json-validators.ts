/**
 * Zod schemas for validating JSON columns read from the database.
 *
 * These schemas are intentionally structural — they validate that the shape
 * coming out of Prisma matches the TypeScript interfaces. Business-rule
 * validation (e.g. "strength must be <= cap") stays in the services.
 *
 * Used by prisma-json-helpers.ts helpers so malformed DB data throws at
 * read time rather than silently propagating wrong values.
 */

import { z } from 'zod';
import {
  CharacterClass,
  EquipmentSlot,
  ItemRarity,
  ItemType,
  ZoneType,
} from '@shared/enums';

// ── StatBlock ───────────────────────────────────────────────────────

export const StatBlockSchema = z.object({
  strength: z.number(),
  agility: z.number(),
  intelligence: z.number(),
  vitality: z.number(),
  spirit: z.number(),
}).passthrough();

// ── DerivedStats ────────────────────────────────────────────────────

export const DerivedStatsSchema = z.object({
  maxHp: z.number(),
  maxMana: z.number(),
  physicalAttack: z.number(),
  magicAttack: z.number(),
  physicalDefense: z.number(),
  magicResistance: z.number(),
  criticalChance: z.number(),
  criticalDamage: z.number(),
  attackSpeed: z.number(),
  armorPenetration: z.number(),
  magicPenetration: z.number(),
  dodgeChance: z.number().optional().default(0),
  blockChance: z.number().optional().default(0),
  hpRegen: z.number(),
  manaRegen: z.number(),
  movementSpeed: z.number(),
  prestigeDamage: z.number().optional().default(0),
});

// ── ItemData ────────────────────────────────────────────────────────
// Only the required fields are validated strictly; optional stat fields
// use z.number().optional() so partial records still parse cleanly.

export const ItemDataSchema = z.object({
  // Required identity fields
  id: z.string(),
  name: z.string(),
  type: z.string(), // Relaxed: accepts any string (ItemType enum + legacy values)
  rarity: z.string(), // Relaxed: accepts any string (ItemRarity enum + legacy values)
  requiredLevel: z.number(),
  stackable: z.boolean(),
  maxStack: z.number(),
  sellPrice: z.number(),

  // Optional identity / class restriction
  description: z.string().optional(),
  isPrestige: z.boolean().optional(),
  requiredClass: z.string().optional(), // Relaxed: accepts any string
  equipmentSlot: z.string().optional(), // Relaxed: accepts "NONE", enum values, etc.

  // Optional combat stats
  physicalAttack: z.number().optional(),
  magicAttack: z.number().optional(),
  physicalDefense: z.number().optional(),
  magicResistance: z.number().optional(),

  // Optional consumable effects
  maxHp: z.number().optional(),
  maxMana: z.number().optional(),

  // Optional primary stat bonuses
  strength: z.number().optional(),
  agility: z.number().optional(),
  intelligence: z.number().optional(),
  vitality: z.number().optional(),
  spirit: z.number().optional(),

  // Optional derived stat bonuses
  criticalChance: z.number().optional(),
  criticalDamage: z.number().optional(),
  attackSpeed: z.number().optional(),
  armorPenetration: z.number().optional(),
  magicPenetration: z.number().optional(),
  hpRegen: z.number().optional(),
  manaRegen: z.number().optional(),
  movementSpeed: z.number().optional(),

  // Optional excellent bonus
  excellentBonus: z.number().optional(),
  excellentType: z.string().optional(),

  // Optional random stats
  randomStats: z
    .array(z.object({ stat: z.string(), value: z.number() }))
    .optional(),

  // Optional enhancement
  enhancementLevel: z.number().optional(),
  maxEnhancement: z.number().optional(),

  // Optional gem data
  gemTemplateId: z.string().optional(),
  gemStat: z.string().optional(),
  gemValue: z.number().optional(),

  // Optional set & socket data
  setId: z.string().optional(),
  sockets: z
    .array(
      z.object({
        gemId: z.string().nullable(),
        gemName: z.string().optional(),
        gemStat: z.string().optional(),
        gemValue: z.number().optional(),
      }),
    )
    .optional(),

  // Optional sprite info
  spriteInfo: z.record(z.string()).optional(),

  // Optional display metadata
  icon: z.string().optional(),
}).passthrough(); // Allow extra fields not in schema (legacy data compatibility)

// ── CharacterPosition ───────────────────────────────────────────────

export const CharacterPositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  mapId: z.string(),
  zoneType: z.nativeEnum(ZoneType).optional(),
});

// ── AbilityData ─────────────────────────────────────────────────────

export const AbilityEffectSchema = z.object({
  type: z.string(),
  value: z.number(),
  duration: z.number().optional(),
  description: z.string(),
});

export const AbilityDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  class: z.string(), // Relaxed: accepts any string
  description: z.string(),
  cooldown: z.number(),
  manaCost: z.number(),
  isUltimate: z.boolean(),
  unlockLevel: z.number(),
  effects: z.array(AbilityEffectSchema),
  icon: z.string().optional(),
}).passthrough();
