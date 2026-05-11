import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.js';
import { blacklistToken } from '../services/token-blacklist.service.js';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema.js';
import { AppError } from '../middleware/errors.js';

const router = Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password } = RegisterSchema.parse(req.body);
    const result = await authService.register(email, username, password);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const result = await authService.login(email, password);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/profile', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getProfile(req.userId!);
    res.json(user);
  } catch (err) { next(err); }
});

router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token ?? req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new AppError(401, 'No token provided');
    const result = await authService.refreshToken(token);
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json(result);
  } catch (err) { next(err); }
});

router.post('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token ?? req.headers.authorization!.slice(7);
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp !== undefined) {
      const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
      if (remainingSeconds > 0) {
        await blacklistToken(token, remainingSeconds);
      }
    }
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
});

router.post('/revoke', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token ?? req.headers.authorization!.slice(7);
    const decoded = jwt.decode(token) as { exp?: number } | null;
    if (decoded?.exp === undefined) {
      throw new AppError(400, 'Token has no expiry and cannot be revoked');
    }
    const remainingSeconds = decoded.exp - Math.floor(Date.now() / 1000);
    if (remainingSeconds <= 0) {
      // Token is already expired — nothing to blacklist
      res.clearCookie('token', { path: '/' });
      res.json({ message: 'Token revoked' });
      return;
    }
    await blacklistToken(token, remainingSeconds);
    res.clearCookie('token', { path: '/' });
    res.json({ message: 'Token revoked' });
  } catch (err) { next(err); }
});

export default router;
