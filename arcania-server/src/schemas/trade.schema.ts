import { z } from 'zod';

export const CreateTradeSchema = z.object({
  receiverUsername: z.string().min(1, 'receiverUsername is required'),
  characterId: z.string().min(1, 'characterId is required'),
});

export const UpdateOfferSchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
  items: z.array(z.any()).optional().default([]),
  goldAmount: z.number().int().min(0, 'goldAmount must be a non-negative integer').optional().default(0),
});

export const ConfirmTradeSchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
});
