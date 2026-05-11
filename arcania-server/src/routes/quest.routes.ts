import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as questService from '../services/quest.service.js';
import * as loginStreakService from '../services/login-streak.service.js';
import * as referralService from '../services/referral.service.js';

const router = Router();
router.use(authMiddleware);

// ==================== QUEST ROUTES ====================
// NOTE: Specific routes MUST come before parameterized ones to avoid
// /quests/login, /quests/streak, /quests/initialize, /quests/social/:id
// being swallowed by /quests/:category or /quests/:id/claim.

// POST /quests/login — Record daily login and advance streak
router.post('/quests/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginStreakService.handleLogin(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /quests/streak — Get current login streak info
router.get('/quests/streak', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginStreakService.getLoginStreak(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /quests/initialize — Manually initialize quest rows for user
router.post('/quests/initialize', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await questService.initializeQuests(req.userId!);
    res.json({ message: 'Quests initialized' });
  } catch (err) { next(err); }
});

// POST /quests/social/:id — Complete a social quest (mark as claimable)
router.post('/quests/social/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await questService.completeSocialQuest(req.userId!, req.params.id);
    res.json({ message: 'Social quest completed' });
  } catch (err) { next(err); }
});

// POST /quests/:id/claim — Claim reward for a completed quest
router.post('/quests/:id/claim', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const characterId = req.body.characterId || undefined;
    const result = await questService.claimReward(req.userId!, req.params.id, characterId);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /quests — Get all quests grouped by category
router.get('/quests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await questService.getQuests(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /quests/:category — Get quests filtered by category
router.get('/quests/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await questService.getQuestsByCategory(req.userId!, req.params.category);
    res.json(result);
  } catch (err) { next(err); }
});

// ==================== REFERRAL ROUTES ====================

// POST /referral/generate — Generate or retrieve referral code
router.post('/referral/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const code = await referralService.generateReferralCode(req.userId!);
    res.json({ code });
  } catch (err) { next(err); }
});

// POST /referral/use — Use a referral code
router.post('/referral/use', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Referral code is required' });
      return;
    }
    await referralService.useReferralCode(req.userId!, code);
    res.json({ message: 'Referral code accepted' });
  } catch (err) { next(err); }
});

// GET /referral/stats — Get referral statistics
router.get('/referral/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await referralService.getReferralStats(req.userId!);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
