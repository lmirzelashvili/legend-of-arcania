import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { expensiveOpLimiter } from '../middleware/rate-limiters.js';
import { getRecipes, forge } from '../services/forging.service.js';
import { ForgeSchema } from '../schemas/forge.schema.js';

const router = Router();

// GET /api/forge/recipes — list all recipes (public, but behind auth for consistency)
router.get('/recipes', authMiddleware, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const recipes = getRecipes();
    res.json(recipes);
  } catch (err) { next(err); }
});

// POST /api/forge — execute a forge attempt
router.post('/', authMiddleware, expensiveOpLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { characterId, recipeId, extraCrystals } = ForgeSchema.parse(req.body);

    const result = await forge(req.userId!, characterId, recipeId, extraCrystals);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
