/**
 * Typed helpers for reading Prisma JSON columns.
 *
 * Prisma stores JSON columns as `Prisma.JsonValue` (≈ `unknown`).  Every
 * service was previously casting those values via `as any`, letting untyped
 * data leak into business logic.  These helpers centralise that one
 * unavoidable cast so callers get the correct TypeScript type back.
 *
 * Each JSON reader now validates the incoming value against a Zod schema
 * before returning it.  If the data stored in the database does not match
 * the expected shape a ZodError is thrown immediately (fail-fast), making
 * data corruption visible at read time rather than at the point of use.
 *
 * For JSON *writes* Prisma accepts plain objects, so no helper is needed —
 * we only add `as unknown as Prisma.InputJsonValue` where the compiler
 * complains (handled via toJsonInput).
 */

import type {
  StatBlock,
  DerivedStats,
  ItemData,
  CharacterPosition,
  AbilityData,
  Race,
  CharacterClass,
  Gender,
  VaultTier,
} from '../types/index.js';
import type { PrismaClient } from '@prisma/client';
import {
  StatBlockSchema,
  DerivedStatsSchema,
  ItemDataSchema,
  CharacterPositionSchema,
  AbilityDataSchema,
} from '../schemas/json-validators.js';

/** The transactional client passed into `prisma.$transaction(async (tx) => ...)` callbacks. */
export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// ── JSON column READERS ─────────────────────────────────────────────

/** Character.primaryStats → StatBlock */
export function toStatBlock(json: unknown): StatBlock {
  return StatBlockSchema.parse(json) as StatBlock;
}

/** Character.derivedStats → DerivedStats */
export function toDerivedStats(json: unknown): DerivedStats {
  return DerivedStatsSchema.parse(json) as DerivedStats;
}

/** InventoryItem.itemData / EquipmentSlotRow.itemData / VaultItem.itemData → ItemData */
export function toItemData(json: unknown): ItemData {
  return ItemDataSchema.parse(json) as ItemData;
}

/** Character.position → CharacterPosition | undefined */
export function toPosition(json: unknown): CharacterPosition | undefined {
  if (json == null) return undefined;
  return CharacterPositionSchema.parse(json) as CharacterPosition;
}

/** CharacterAbility.abilityData → AbilityData */
export function toAbilityData(json: unknown): AbilityData {
  return AbilityDataSchema.parse(json) as AbilityData;
}

/** Character.race (Prisma enum → shared enum) */
export function toRace(value: string): Race {
  return value as Race;
}

/** Character.class (Prisma enum → shared enum) */
export function toCharacterClass(value: string): CharacterClass {
  return value as CharacterClass;
}

/** Character.gender (Prisma enum → shared enum) */
export function toGender(value: string): Gender {
  return value as Gender;
}

/** Vault.tier (String column) → VaultTier enum */
export function toVaultTier(value: string): VaultTier {
  return value as VaultTier;
}

/**
 * Like toItemData but returns a mutable record type for services that
 * need to set dynamic keys (e.g. gem stat values on item data).
 */
export function toMutableItemData(json: unknown): Record<string, unknown> & ItemData {
  return ItemDataSchema.parse(json) as Record<string, unknown> & ItemData;
}

// ── JSON column WRITER helper ───────────────────────────────────────

/**
 * Use when writing a typed object into a Prisma `Json` column.
 * Avoids `as any` on the write side — keeps the cast in one place.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toJsonInput(value: unknown): any {
  return value;
}
