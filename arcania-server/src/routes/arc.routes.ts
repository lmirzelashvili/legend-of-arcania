import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import type { RedisReply } from 'rate-limit-redis';
import { authMiddleware } from '../middleware/auth.js';
import prisma from '../config/db.js';
import { redis } from '../config/redis.js';
import { arcConfig } from '../config/arc.js';
import { getDepositAddressFor, checkAndSweepUser } from '../services/arc/deposit.service.js';
import { withdraw, getHotWalletBalance } from '../services/arc/withdraw.service.js';
import { hotWalletPublicKey } from '../services/arc/hd.js';

const router = Router();

const sendCommand = (...args: string[]): Promise<RedisReply> => {
  const [command, ...rest] = args;
  return redis.call(command, rest) as Promise<RedisReply>;
};

const depositCheckLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  keyGenerator: (req) => `arc-check:${(req as Request).userId ?? 'anon'}`,
  store: new RedisStore({ prefix: 'rl:arc-check:', sendCommand }),
});

const withdrawLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  keyGenerator: (req) => `arc-withdraw:${(req as Request).userId ?? 'anon'}`,
  store: new RedisStore({ prefix: 'rl:arc-withdraw:', sendCommand }),
});

router.use(authMiddleware);

// GET /api/arc/wallet — user's ARC info: balance, deposit address, hot wallet status
router.get('/wallet', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const depositAddress = await getDepositAddressFor(userId);
    const wallet = await prisma.arcWallet.findUnique({ where: { userId } });
    res.json({
      mint: arcConfig.mintString,
      decimals: arcConfig.decimals,
      cluster: arcConfig.cluster,
      depositAddress,
      balance: (wallet?.balance ?? 0n).toString(),
      hotWalletCap: arcConfig.hotWalletCapRaw.toString(),
      minWithdraw: arcConfig.minWithdrawRaw.toString(),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/arc/deposits/check — user-triggered scan of their deposit address
router.post('/deposits/check', depositCheckLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    await getDepositAddressFor(userId);
    const result = await checkAndSweepUser(userId);
    res.json({
      swept: result.swept,
      amount: result.amount.toString(),
      signature: result.signature,
      reason: result.reason,
    });
  } catch (err) {
    next(err);
  }
});

const WithdrawSchema = z.object({
  amount: z.string().regex(/^\d+$/, 'amount must be a non-negative integer (raw token units)'),
  destination: z.string().min(32).max(44).optional(),
}).strict();

// POST /api/arc/withdraw — withdraw to linked wallet (or override destination)
router.post('/withdraw', withdrawLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const parsed = WithdrawSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'invalid request' });
      return;
    }
    let destination = parsed.data.destination;
    if (!destination) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { solanaPublicKey: true },
      });
      destination = user?.solanaPublicKey ?? undefined;
    }
    if (!destination) {
      res.status(400).json({ error: 'no_destination', message: 'Link a Solana wallet or pass an explicit destination.' });
      return;
    }

    const amount = BigInt(parsed.data.amount);
    const result = await withdraw(userId, amount, destination);
    if (!result.ok) {
      res.status(400).json({ error: result.error, message: result.errorDetail });
      return;
    }
    res.json({
      ok: true,
      signature: result.signature,
      transactionId: result.transactionId,
      destination,
      amount: amount.toString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/arc/transactions — list user's deposit/withdraw history
router.get('/transactions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const limit = Math.min(parseInt(String(req.query.limit ?? '20'), 10) || 20, 100);
    const rows = await prisma.arcTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    res.json({
      transactions: rows.map((t) => ({
        id: t.id,
        type: t.type,
        status: t.status,
        amount: t.amount.toString(),
        signature: t.txSignature,
        destination: t.destination,
        source: t.source,
        error: t.error,
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/arc/operator-status — public-ish dev info: hot wallet pubkey + balance + cap
router.get('/operator-status', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hot = hotWalletPublicKey().toBase58();
    const hotBalance = await getHotWalletBalance();
    res.json({
      mint: arcConfig.mintString,
      cluster: arcConfig.cluster,
      hotWallet: hot,
      coldWallet: arcConfig.coldWalletAddress.toBase58(),
      hotWalletBalance: hotBalance.toString(),
      hotWalletCap: arcConfig.hotWalletCapRaw.toString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
