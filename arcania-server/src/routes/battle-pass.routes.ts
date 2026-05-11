import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as battlePassService from '../services/battle-pass.service.js';
import { PurchaseBattlePassSchema, ClaimTierSchema } from '../schemas/battle-pass.schema.js';

const router = Router();
router.use(authMiddleware);

// GET / — Get active season with tiers
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const season = await battlePassService.getActiveSeason();
    if (!season) {
      res.json({ season: null, tiers: [] });
      return;
    }
    res.json({ season, tiers: season.tiers });
  } catch (err) { next(err); }
});

// GET /progress — Get player's battle pass progress
router.get('/progress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progress = await battlePassService.getProgress(req.userId!);
    res.json(progress);
  } catch (err) { next(err); }
});

// POST /purchase — Purchase premium battle pass
router.post('/purchase', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId } = PurchaseBattlePassSchema.parse(req.body);
    const result = await battlePassService.purchaseBattlePass(req.userId!, characterId);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /claim/:tierNumber — Claim a tier reward
router.post('/claim/:tierNumber', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tierNumber = parseInt(req.params.tierNumber, 10);
    if (isNaN(tierNumber) || tierNumber < 1) {
      res.status(400).json({ error: 'Invalid tier number' });
      return;
    }

    const { track } = ClaimTierSchema.parse(req.body);

    const result = await battlePassService.claimTierReward(req.userId!, tierNumber, track);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
