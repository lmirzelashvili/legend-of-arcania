// Premium expiry middleware — silently revokes expired premium before the
// request handler runs. Add to any route that gates behaviour on premium status
// (e.g. marketplace listing limits, forge/enhancement bonuses).
//
// Must be placed AFTER authMiddleware so req.userId is populated.
// Never blocks the request — if the DB call fails we log and continue.

import { Request, Response, NextFunction } from 'express';
import { ensurePremiumFresh } from '../services/premium.service.js';

export async function checkPremiumExpiry(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId) {
    next();
    return;
  }

  try {
    await ensurePremiumFresh(req.userId);
  } catch (err) {
    // Non-fatal: log the error but do not block the request
    console.error('[checkPremiumExpiry] Failed to refresh premium status:', err);
  }

  next();
}
