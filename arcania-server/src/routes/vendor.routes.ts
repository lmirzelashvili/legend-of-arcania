import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as vendorService from '../services/vendor.service.js';
import { requireString, requirePositiveInt } from '../utils/validate.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const vendors = await vendorService.getVendors();
    res.json(vendors);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vendor = await vendorService.getVendor(req.params.id);
    res.json(vendor);
  } catch (err) { next(err); }
});

router.post('/:id/buy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const characterId = requireString(req.body.characterId, 'characterId');
    const vendorItemId = requireString(req.body.vendorItemId, 'vendorItemId');
    const quantity = req.body.quantity ? requirePositiveInt(req.body.quantity, 'quantity') : 1;
    const result = await vendorService.purchaseItem(
      req.userId!, characterId, req.params.id, vendorItemId, quantity
    );
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
