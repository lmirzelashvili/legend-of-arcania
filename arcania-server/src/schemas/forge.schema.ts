import { z } from 'zod';

export const ForgeSchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
  recipeId: z.string().min(1, 'recipeId is required'),
  extraCrystals: z.object({
    spiritCount: z.number().optional(),
    dominionCount: z.number().optional(),
  }).optional(),
});
