import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { isTokenBlacklisted } from '../services/token-blacklist.service.js';

export interface JwtPayload {
  userId: string;
  email: string;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Prefer httpOnly cookie; fall back to Bearer token for API clients
  const token = req.cookies?.token ?? req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  // Check blacklist — gracefully degrade if Redis is unavailable
  try {
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      res.status(401).json({ error: 'Token has been revoked' });
      return;
    }
  } catch (err) {
    console.warn('Token blacklist check failed (Redis may be down), skipping:', (err as Error).message);
  }

  req.userId = decoded.userId;
  next();
}
