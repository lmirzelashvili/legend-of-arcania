import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as pvpService from '../services/pvp.service.js';
import { RecordKillSchema } from '../schemas/pvp.schema.js';
import prisma from '../config/db.js';

const router = Router();
router.use(authMiddleware);

// GET /leaderboard — Top PvP players
router.get('/leaderboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sortBy = (req.query.sort as string) || 'kills';
    const validSorts = ['kills', 'kd_ratio', 'streak'];
    const sort = validSorts.includes(sortBy) ? sortBy : 'kills';
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const leaderboard = await pvpService.getLeaderboard(
      sort as 'kills' | 'kd_ratio' | 'streak',
      limit,
    );
    res.json(leaderboard);
  } catch (err) { next(err); }
});

// GET /stats/:characterId — Get PvP stats for a character
router.get('/stats/:characterId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await pvpService.getStats(req.params.characterId);
    res.json(stats);
  } catch (err) { next(err); }
});

// POST /record-kill — Record a PvP kill
// TODO: Move to /internal/ namespace with service-level auth when Go game server is ready
router.post('/record-kill', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { killerId, victimId } = RecordKillSchema.parse(req.body);
    // Verify the authenticated user owns the killer character
    const killerChar = await prisma.character.findFirst({ where: { id: killerId, userId: req.userId! } });
    if (!killerChar) {
      res.status(403).json({ error: 'You do not own this character' });
      return;
    }
    const result = await pvpService.recordKill(killerId, victimId);
    res.json(result);
  } catch (err) { next(err); }
});

// GET /seasons — List PvP seasons
router.get('/seasons', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seasons = await pvpService.getSeasons();
    res.json(seasons);
  } catch (err) { next(err); }
});

export default router;
