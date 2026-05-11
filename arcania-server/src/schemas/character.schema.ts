import { z } from 'zod';
import { Race, CharacterClass } from '../types/index.js';

export const CreateCharacterSchema = z.object({
  name: z.string().min(1, 'name is required'),
  race: z.nativeEnum(Race),
  class: z.nativeEnum(CharacterClass),
  gender: z.string().optional(),
});

export const EquipItemSchema = z.object({
  itemId: z.string().min(1, 'itemId is required'),
  slot: z.string().min(1, 'slot is required'),
});

export const UnequipItemSchema = z.object({
  slot: z.string().min(1, 'slot is required'),
});

export const MoveInventoryItemSchema = z.object({
  itemId: z.string().min(1, 'itemId is required'),
  fromSlot: z.number().int().min(0, 'fromSlot must be a non-negative integer'),
  toSlot: z.number().int().min(0, 'toSlot must be a non-negative integer'),
});

export const LearnAbilitySchema = z.object({
  abilityId: z.string().min(1, 'abilityId is required'),
});

export const UpgradeAbilitySchema = z.object({
  abilityId: z.string().min(1, 'abilityId is required'),
});

export const UseConsumableSchema = z.object({
  inventoryItemId: z.string().min(1, 'inventoryItemId is required'),
});

export const UseScrollSchema = z.object({
  inventoryItemId: z.string().min(1, 'inventoryItemId is required'),
});

export const EnhanceItemSchema = z.object({
  targetItemId: z.string().min(1, 'targetItemId is required'),
  crystalItemId: z.string().min(1, 'crystalItemId is required'),
});

export const SocketGemSchema = z.object({
  targetItemId: z.string().min(1, 'targetItemId is required'),
  gemItemId: z.string().min(1, 'gemItemId is required'),
  socketIndex: z.number().int().min(0, 'socketIndex must be a non-negative integer'),
});

export const UnsocketGemSchema = z.object({
  targetItemId: z.string().min(1, 'targetItemId is required'),
  socketIndex: z.number().int().min(0, 'socketIndex must be a non-negative integer'),
});

export const OpenBoxSchema = z.object({
  inventoryItemId: z.string().min(1, 'inventoryItemId is required'),
});

export const SellItemSchema = z.object({
  inventoryItemId: z.string().min(1, 'inventoryItemId is required'),
  quantity: z.number().int().min(1, 'quantity must be a positive integer').optional(),
});
