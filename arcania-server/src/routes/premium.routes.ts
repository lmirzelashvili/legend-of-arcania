import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as premiumService from '../services/premium.service.js';

const router = Router();
router.use(authMiddleware);

// GET /status — Check current premium status
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await premiumService.checkPremiumStatus(req.userId!);
    res.json(status);
  } catch (err) { next(err); }
});

// POST /activate — Activate premium subscription
// Restricted: requires admin key or payment webhook validation
// TODO: Integrate with payment provider (Stripe, etc.)
router.post('/activate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Require admin API key for manual activation
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_API_KEY) {
      res.status(403).json({ error: 'Premium activation requires payment verification' });
      return;
    }
    const { durationDays, userId } = req.body;
    if (!durationDays || typeof durationDays !== 'number' || durationDays <= 0) {
      res.status(400).json({ error: 'durationDays must be a positive number' });
      return;
    }
    // Admin can activate for any user; default to authenticated user
    const targetUserId = userId || req.userId!;
    const result = await premiumService.activatePremium(targetUserId, durationDays);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
