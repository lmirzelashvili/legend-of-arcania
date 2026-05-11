import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { authMiddleware } from '../middleware/auth.js';
import { redis } from '../config/redis.js';
import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

const router = Router();

// Module-scope in-memory fallback for when Redis is unavailable
const memoryNonces = new Map<string, { message: string; expiresAt: number }>();

const LinkWalletSchema = z.object({
  publicKey: z.string().min(32).max(44),
  signature: z.string().min(1),
}).strict();

// GET /api/wallet-link/nonce — generate a nonce and message for the client to sign
router.get('/nonce', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const nonce = crypto.randomBytes(32).toString('hex');
    const message = `Sign to link your Solana wallet to Arcania Nexus.\nNonce: ${nonce}\nIssued: ${new Date().toISOString()}`;
    const expiresAt = Date.now() + 300_000; // 5 minutes in ms

    const redisKey = `wallet_link_nonce:${userId}`;
    const payload = JSON.stringify({ nonce, message, expiresAt });

    try {
      await redis.set(redisKey, payload, 'EX', 300);
    } catch (redisErr) {
      logger.warn({ err: redisErr, userId }, 'Redis setex failed for wallet link nonce; using in-memory fallback');
      memoryNonces.set(userId, { message, expiresAt });
    }

    res.json({ nonce, message, expiresAt });
  } catch (err) {
    next(err);
  }
});

// POST /api/wallet-link — verify signature and link the Solana wallet to the user account
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const parsed = LinkWalletSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid request body.' });
      return;
    }
    const { publicKey, signature } = parsed.data;

    // Retrieve stored nonce — try Redis first, fall back to memory
    const redisKey = `wallet_link_nonce:${userId}`;
    let storedMessage: string | null = null;
    let storedExpiresAt: number | null = null;

    try {
      const raw = await redis.get(redisKey);
      if (raw !== null) {
        const stored = JSON.parse(raw) as { nonce: string; message: string; expiresAt: number };
        storedMessage = stored.message;
        storedExpiresAt = stored.expiresAt;
      }
    } catch (redisErr) {
      logger.warn({ err: redisErr, userId }, 'Redis get failed for wallet link nonce; using in-memory fallback');
      const mem = memoryNonces.get(userId);
      if (mem) {
        storedMessage = mem.message;
        storedExpiresAt = mem.expiresAt;
      }
    }

    if (storedMessage === null || storedExpiresAt === null) {
      res.status(400).json({ error: 'Nonce expired, request a new one.' });
      return;
    }

    if (storedExpiresAt < Date.now()) {
      res.status(400).json({ error: 'Nonce expired, request a new one.' });
      return;
    }

    // Verify ed25519 signature
    const pubKeyBytes = bs58.decode(publicKey);
    const sigBytes = Uint8Array.from(Buffer.from(signature, 'base64'));
    const msgBytes = new TextEncoder().encode(storedMessage);
    const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubKeyBytes);

    if (!ok) {
      res.status(400).json({ error: 'Signature verification failed.' });
      return;
    }

    // Persist wallet link
    let date: Date;
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { solanaPublicKey: publicKey, solanaLinkedAt: new Date() },
      });
      date = updated.solanaLinkedAt!;
    } catch (prismaErr: unknown) {
      const code = (prismaErr as { code?: string }).code;
      if (code === 'P2002') {
        res.status(409).json({ error: 'This Solana wallet is already linked to another account.' });
        return;
      }
      throw prismaErr;
    }

    // Delete the stored nonce
    try {
      await redis.del(redisKey);
    } catch {
      // Best-effort; fall through to memory cleanup
    }
    memoryNonces.delete(userId);

    res.json({ ok: true, solanaPublicKey: publicKey, solanaLinkedAt: date.toISOString() });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/wallet-link — unlink the Solana wallet from the user account
router.delete('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    await prisma.user.update({
      where: { id: userId },
      data: { solanaPublicKey: null, solanaLinkedAt: null },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
