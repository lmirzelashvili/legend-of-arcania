import { z } from 'zod';
import { VaultTier } from '../types/index.js';

export const DepositItemSchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
  inventoryItemId: z.string().min(1, 'inventoryItemId is required'),
  quantity: z.number().int().min(1, 'quantity must be a positive integer'),
});

export const WithdrawItemSchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
  vaultItemId: z.string().min(1, 'vaultItemId is required'),
  quantity: z.number().int().min(1, 'quantity must be a positive integer'),
});

export const UpgradeVaultSchema = z.object({
  tier: z.nativeEnum(VaultTier),
  characterId: z.string().optional(),
});

const VALID_CURRENCIES = ['gold', 'arcanite'] as const;

export const WithdrawCurrencySchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
  currency: z.enum(VALID_CURRENCIES, { message: 'currency must be gold or arcanite' }),
  amount: z.number().int().min(1, 'amount must be a positive integer'),
});

export const DepositCurrencySchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
  currency: z.enum(VALID_CURRENCIES, { message: 'currency must be gold or arcanite' }),
  amount: z.number().int().min(1, 'amount must be a positive integer'),
});
