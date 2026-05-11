import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { expensiveOpLimiter } from '../middleware/rate-limiters.js';
import * as tradeService from '../services/trade.service.js';
import { CreateTradeSchema, UpdateOfferSchema, ConfirmTradeSchema } from '../schemas/trade.schema.js';

const router = Router();
router.use(authMiddleware);

// GET / — Get all active trades for the current user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trades = await tradeService.getActiveTrades(req.userId!);
    res.json(trades);
  } catch (err) { next(err); }
});

// GET /:id — Get a specific trade
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trade = await tradeService.getTrade(req.userId!, req.params.id);
    res.json(trade);
  } catch (err) { next(err); }
});

// POST / — Create a new trade
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { receiverUsername, characterId } = CreateTradeSchema.parse(req.body);
    const trade = await tradeService.createTrade(req.userId!, receiverUsername, characterId);
    res.status(201).json(trade);
  } catch (err) { next(err); }
});

// POST /:id/accept — Accept a pending trade (receiver only)
router.post('/:id/accept', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trade = await tradeService.acceptTrade(req.userId!, req.params.id);
    res.json(trade);
  } catch (err) { next(err); }
});

// PUT /:id/offer — Update your trade offer
router.put('/:id/offer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, items, goldAmount } = UpdateOfferSchema.parse(req.body);
    const trade = await tradeService.updateOffer(req.userId!, req.params.id, characterId, items, goldAmount);
    res.json(trade);
  } catch (err) { next(err); }
});

// POST /:id/lock — Lock your offer
router.post('/:id/lock', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trade = await tradeService.lockOffer(req.userId!, req.params.id);
    res.json(trade);
  } catch (err) { next(err); }
});

// POST /:id/confirm — Confirm and execute the trade
router.post('/:id/confirm', expensiveOpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId } = ConfirmTradeSchema.parse(req.body);
    const result = await tradeService.confirmTrade(req.userId!, req.params.id, characterId);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /:id/cancel — Cancel the trade
router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await tradeService.cancelTrade(req.userId!, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
