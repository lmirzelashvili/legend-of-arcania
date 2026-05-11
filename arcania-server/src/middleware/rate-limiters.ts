import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

// Per-user rate limiter for expensive game operations.
// Keys by userId (set by authMiddleware) when available, falls back to default IP key.
export const expensiveOpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' },
  keyGenerator: (req: Request): string => {
    return req.userId ?? 'anonymous';
  },
  validate: false,
});
