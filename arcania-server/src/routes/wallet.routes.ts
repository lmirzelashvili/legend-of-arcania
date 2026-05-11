import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { expensiveOpLimiter } from '../middleware/rate-limiters.js';
import * as walletService from '../services/wallet.service.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await walletService.getWallet(req.userId!);
    res.json(wallet);
  } catch (err) { next(err); }
});

router.post('/spin', expensiveOpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await walletService.performSpin(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/use-token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await walletService.useCreationToken(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
