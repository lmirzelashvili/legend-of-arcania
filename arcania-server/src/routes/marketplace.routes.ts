import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { expensiveOpLimiter } from '../middleware/rate-limiters.js';
import * as marketplaceService from '../services/marketplace.service.js';
import type { ListingSortOption } from '../types/index.js';
import { CreateListingSchema, BuyListingSchema, ListingQuerySchema } from '../schemas/marketplace.schema.js';
import { success, paginated } from '../utils/response.js';

const router = Router();
router.use(authMiddleware);

// ==================== LISTINGS ====================

// GET /listings — Browse marketplace with filters and sort
router.get('/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, rarity, minLevel, maxLevel, class: cls, currency, minPrice, maxPrice, minEnhancement, maxEnhancement, search, source, sort, page, pageSize } = ListingQuerySchema.parse(req.query);

    const filters: Record<string, any> = {};
    if (type !== undefined) filters.type = type;
    if (rarity !== undefined) filters.rarity = rarity;
    if (minLevel !== undefined) filters.minLevel = minLevel;
    if (maxLevel !== undefined) filters.maxLevel = maxLevel;
    if (cls !== undefined) filters.class = cls;
    if (currency !== undefined) filters.currency = currency;
    if (minPrice !== undefined) filters.minPrice = minPrice;
    if (maxPrice !== undefined) filters.maxPrice = maxPrice;
    if (minEnhancement !== undefined) filters.minEnhancement = minEnhancement;
    if (maxEnhancement !== undefined) filters.maxEnhancement = maxEnhancement;
    if (search !== undefined) filters.search = search;
    if (source !== undefined) filters.source = source;

    const hasFilters = Object.keys(filters).length > 0;

    const result = await marketplaceService.getListings(
      hasFilters ? filters : undefined,
      sort as ListingSortOption,
      page,
      pageSize,
    );

    res.json(paginated(result.listings, result.total, result.page, result.pageSize));
  } catch (err) { next(err); }
});

// GET /my-listings — Current user's active listings
router.get('/my-listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listings = await marketplaceService.getMyListings(req.userId!);
    res.json(listings);
  } catch (err) { next(err); }
});

// POST /listings — Create a new listing
router.post('/listings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, inventoryItemId, vaultItemId, itemSource, price, currency, quantity } = CreateListingSchema.parse(req.body);
    const result = await marketplaceService.createListing(req.userId!, {
      characterId,
      inventoryItemId,
      vaultItemId,
      itemSource,
      price,
      currency,
      quantity,
    });
    res.status(201).json(success(result));
  } catch (err) { next(err); }
});

// DELETE /listings/:id — Cancel a listing
router.delete('/listings/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const characterId = (req.query.characterId as string) || req.body?.characterId;
    const result = await marketplaceService.cancelListing(req.userId!, req.params.id, characterId);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /listings/:id/buy — Purchase a listing
router.post('/listings/:id/buy', expensiveOpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId } = BuyListingSchema.parse(req.body);
    const result = await marketplaceService.purchaseListing(req.userId!, characterId, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
