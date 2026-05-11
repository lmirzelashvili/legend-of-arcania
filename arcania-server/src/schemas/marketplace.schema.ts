import { z } from 'zod';

export const CreateListingSchema = z.object({
  characterId: z.string().optional(),
  inventoryItemId: z.string().optional(),
  vaultItemId: z.string().optional(),
  itemSource: z.enum(['bag', 'vault']),
  price: z.number(),
  currency: z.enum(['gold', 'arcanite']),
  quantity: z.number(),
});

export const BuyListingSchema = z.object({
  characterId: z.string().min(1, 'characterId is required'),
});

const VALID_SORTS = ['price_asc', 'price_desc', 'recent', 'relevant'] as const;

export const ListingQuerySchema = z.object({
  type: z.string().optional(),
  rarity: z.string().optional(),
  minLevel: z.coerce.number().optional(),
  maxLevel: z.coerce.number().optional(),
  class: z.string().optional(),
  currency: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minEnhancement: z.coerce.number().optional(),
  maxEnhancement: z.coerce.number().optional(),
  search: z.string().optional(),
  source: z.string().optional(),
  sort: z.enum(VALID_SORTS).optional().default('relevant'),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(20),
});
