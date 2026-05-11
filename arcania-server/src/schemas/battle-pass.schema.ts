import { z } from 'zod';

export const PurchaseBattlePassSchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
});

export const ClaimTierSchema = z.object({
  track: z.enum(['free', 'premium'], { message: 'track must be "free" or "premium"' }),
});
