import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { expensiveOpLimiter } from '../middleware/rate-limiters.js';
import * as charService from '../services/character.service.js';
import * as equipService from '../services/equipment.service.js';
import * as enhanceService from '../services/enhancement.service.js';
import * as gemService from '../services/gem.service.js';
import * as consumableService from '../services/consumable.service.js';
import * as abilityService from '../services/ability.service.js';
import * as boxService from '../services/box.service.js';
import { validateGender, validateUUID } from '../utils/validate.js';
import { success } from '../utils/response.js';
import {
  CreateCharacterSchema,
  EquipItemSchema,
  UnequipItemSchema,
  MoveInventoryItemSchema,
  LearnAbilitySchema,
  UpgradeAbilitySchema,
  UseConsumableSchema,
  UseScrollSchema,
  EnhanceItemSchema,
  SocketGemSchema,
  UnsocketGemSchema,
  OpenBoxSchema,
  SellItemSchema,
} from '../schemas/character.schema.js';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, race, class: characterClass, gender: rawGender } = CreateCharacterSchema.parse(req.body);
    const gender = validateGender(rawGender !== undefined ? rawGender : 'male');
    const character = await charService.createCharacter(req.userId!, name, race, characterClass, gender);
    res.status(201).json(character);
  } catch (err) { next(err); }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[DEBUG] GET /characters - userId:', req.userId);
    const characters = await charService.getAllCharacters(req.userId!);
    console.log('[DEBUG] GET /characters - found:', characters.length, 'characters');
    res.json(success(characters));
  } catch (err) {
    console.error('[DEBUG] GET /characters - ERROR:', err);
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const character = await charService.getCharacterById(req.userId!, id);
    res.json(character);
  } catch (err) { next(err); }
});

router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const stats = await charService.getCharacterStats(req.userId!, id);
    res.json(stats);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    await charService.deleteCharacter(req.userId!, id);
    res.json({ message: 'Character deleted' });
  } catch (err) { next(err); }
});

router.put('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const character = await charService.updateStats(req.userId!, id, req.body);
    res.json(character);
  } catch (err) { next(err); }
});

router.post('/:id/respec', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const character = await charService.respecStats(req.userId!, id);
    res.json(character);
  } catch (err) { next(err); }
});

router.post('/:id/equip', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { itemId, slot } = EquipItemSchema.parse(req.body);
    const character = await equipService.equipItem(req.userId!, id, itemId, slot);
    res.json(character);
  } catch (err) { next(err); }
});

router.post('/:id/unequip', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { slot } = UnequipItemSchema.parse(req.body);
    const character = await equipService.unequipItem(req.userId!, id, slot);
    res.json(character);
  } catch (err) { next(err); }
});

router.put('/:id/inventory/move', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { itemId, fromSlot, toSlot } = MoveInventoryItemSchema.parse(req.body);
    const character = await charService.moveInventoryItem(req.userId!, id, itemId, fromSlot, toSlot);
    res.json(character);
  } catch (err) { next(err); }
});

router.get('/:id/abilities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const abilities = await abilityService.getAvailableAbilities(req.userId!, id);
    res.json(abilities);
  } catch (err) { next(err); }
});

router.post('/:id/abilities/learn', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { abilityId } = LearnAbilitySchema.parse(req.body);
    const character = await abilityService.learnAbility(req.userId!, id, abilityId);
    res.json(character);
  } catch (err) { next(err); }
});

router.post('/:id/abilities/upgrade', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { abilityId } = UpgradeAbilitySchema.parse(req.body);
    const character = await abilityService.upgradeAbility(req.userId!, id, abilityId);
    res.json(character);
  } catch (err) { next(err); }
});

router.post('/:id/consumable', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { inventoryItemId } = UseConsumableSchema.parse(req.body);
    const result = await consumableService.useConsumable(req.userId!, id, inventoryItemId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:id/use-scroll', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { inventoryItemId } = UseScrollSchema.parse(req.body);
    const result = await consumableService.useScroll(req.userId!, id, inventoryItemId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:id/enhance', expensiveOpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = validateUUID(req.params.id, 'characterId');
    const { targetItemId, crystalItemId } = EnhanceItemSchema.parse(req.body);
    const result = await enhanceService.enhanceInventoryItem(req.userId!, id, targetItemId, crystalItemId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:id/socket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetItemId, gemItemId, socketIndex } = SocketGemSchema.parse(req.body);
    const result = await gemService.socketGem(req.userId!, req.params.id, targetItemId, gemItemId, socketIndex);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:id/unsocket', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { targetItemId, socketIndex } = UnsocketGemSchema.parse(req.body);
    const result = await gemService.unsocketGem(req.userId!, req.params.id, targetItemId, socketIndex);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:id/open-box', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inventoryItemId } = OpenBoxSchema.parse(req.body);
    const result = await boxService.openBox(req.userId!, req.params.id, inventoryItemId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/:id/sell', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { inventoryItemId, quantity } = SellItemSchema.parse(req.body);
    const result = await charService.sellItem(req.userId!, req.params.id, inventoryItemId, quantity ?? 1);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
