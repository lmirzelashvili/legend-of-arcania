import { Router, Request, Response, NextFunction } from 'express';
import { serviceAuthMiddleware } from '../middleware/service-auth.js';
import { AppError } from '../middleware/errors.js';
import * as internalService from '../services/internal.service.js';

const router = Router();
router.use(serviceAuthMiddleware);

// ==================== XP AWARD ====================

router.post('/xp-award', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, xp } = req.body;
    if (!characterId || typeof xp !== 'number' || xp <= 0) {
      throw new AppError(400, 'characterId and positive xp are required');
    }

    const result = await internalService.awardXp(characterId, xp);
    res.json(result);
  } catch (err) { next(err); }
});

// ==================== LOOT TO INVENTORY ====================

router.post('/loot-to-inventory', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, itemTemplateId, quantity } = req.body;
    if (!characterId || !itemTemplateId) {
      throw new AppError(400, 'characterId and itemTemplateId are required');
    }

    const result = await internalService.lootToInventory(characterId, itemTemplateId, quantity || 1);
    res.json(result);
  } catch (err) { next(err); }
});

// ==================== QUEST TRACK ====================

router.post('/quest-track', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, trackingKey, incrementBy } = req.body;
    if (!userId || !trackingKey) {
      throw new AppError(400, 'userId and trackingKey are required');
    }

    const result = await internalService.questTrack(userId, trackingKey, incrementBy || 1);
    res.json(result);
  } catch (err) { next(err); }
});

// ==================== CHARACTER LOADOUT ====================

router.get('/character-loadout/:characterId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId } = req.params;
    const result = await internalService.getCharacterLoadout(characterId);
    res.json(result);
  } catch (err) { next(err); }
});

// ==================== COMBAT RESULT ====================

router.post('/combat-result', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, killerId, victimId, characterId } = req.body;

    if (!type) {
      throw new AppError(400, 'type is required (pvp_kill, pve_kill, or death)');
    }

    const result = await internalService.processCombatResult({ type, killerId, victimId, characterId });
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
