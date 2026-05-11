import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as boosterService from '../services/booster.service.js';
import { requireString } from '../utils/validate.js';

const router = Router();
router.use(authMiddleware);

// GET / — List active boosters for the current user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const boosters = await boosterService.getActiveBoosters(req.userId!);
    res.json(boosters);
  } catch (err) { next(err); }
});

// GET /bonuses — Get summed booster bonuses
router.get('/bonuses', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bonuses = await boosterService.getBonuses(req.userId!);
    res.json(bonuses);
  } catch (err) { next(err); }
});

// POST /activate — Activate a booster
router.post('/activate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = requireString(req.body.type, 'type') as 'xp' | 'gold' | 'combo' | 'mega';
    const result = await boosterService.activateBooster(req.userId!, type);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// POST /cleanup — Clean up expired boosters
router.post('/cleanup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await boosterService.cleanupExpired(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
