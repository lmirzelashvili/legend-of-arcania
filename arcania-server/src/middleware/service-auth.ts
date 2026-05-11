import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function serviceAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] || req.headers['x-internal-key'];
  if (apiKey !== env.INTERNAL_API_KEY) {
    res.status(403).json({ error: 'Invalid service API key' });
    return;
  }
  next();
}
