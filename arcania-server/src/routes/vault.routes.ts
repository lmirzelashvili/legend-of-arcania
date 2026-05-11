import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as vaultService from '../services/vault.service.js';
import { DepositItemSchema, WithdrawItemSchema, UpgradeVaultSchema, WithdrawCurrencySchema, DepositCurrencySchema } from '../schemas/vault.schema.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vault = await vaultService.getVault(req.userId!);
    res.json(vault);
  } catch (err) { next(err); }
});

router.post('/deposit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, inventoryItemId, quantity } = DepositItemSchema.parse(req.body);
    const result = await vaultService.depositItem(req.userId!, characterId, inventoryItemId, quantity);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/withdraw', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, vaultItemId, quantity } = WithdrawItemSchema.parse(req.body);
    const result = await vaultService.withdrawItem(req.userId!, characterId, vaultItemId, quantity);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/upgrade', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tier, characterId } = UpgradeVaultSchema.parse(req.body);
    const result = await vaultService.upgradeVault(req.userId!, tier, characterId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/withdraw-currency', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, currency, amount } = WithdrawCurrencySchema.parse(req.body);
    const result = await vaultService.withdrawCurrency(req.userId!, characterId, currency, amount);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/deposit-currency', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, currency, amount } = DepositCurrencySchema.parse(req.body);
    const result = await vaultService.depositCurrency(req.userId!, characterId, currency, amount);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/can-transfer/:characterId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await vaultService.canTransfer(req.userId!, req.params.characterId);
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/transfer-all/:characterId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await vaultService.transferAllToVault(req.userId!, req.params.characterId);
    res.json({ message: 'All items transferred to vault' });
  } catch (err) { next(err); }
});

export default router;
