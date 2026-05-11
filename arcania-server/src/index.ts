import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import type { RedisReply } from 'rate-limit-redis';
import { redis } from './config/redis.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler } from './middleware/errors.js';
import { requestLogger } from './middleware/request-logger.js';
import authRoutes from './routes/auth.routes.js';
import characterRoutes from './routes/character.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import questRoutes from './routes/quest.routes.js';
import vaultRoutes from './routes/vault.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import errorLogRoutes from './routes/error-log.routes.js';
import forgeRoutes from './routes/forge.routes.js';
import friendsRoutes from './routes/friends.routes.js';
import tradeRoutes from './routes/trade.routes.js';
import battlePassRoutes from './routes/battle-pass.routes.js';
import premiumRoutes from './routes/premium.routes.js';
import boosterRoutes from './routes/booster.routes.js';
import pvpRoutes from './routes/pvp.routes.js';
import internalRoutes from './routes/internal.routes.js';
import sseRoutes from './routes/sse.routes.js';
import walletLinkRoutes from './routes/wallet.link.routes.js';
import arcRoutes from './routes/arc.routes.js';
import { connectEventBus, disconnectEventBus } from './services/event-bus.service.js';
import { initSSESubscriptions } from './services/sse.service.js';
import { initEventHandlers } from './services/event-handlers.service.js';
import { startScheduler } from './jobs/scheduler.js';

const app = express();

// Security middleware
app.use(helmet({ contentSecurityPolicy: false })); // CSP off for game client
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);

// Shared sendCommand bridge for ioredis → rate-limit-redis
const sendCommand = (...args: string[]): Promise<RedisReply> => {
  const [command, ...rest] = args;
  return redis.call(command, rest) as Promise<RedisReply>;
};

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  passOnStoreError: true,
  store: new RedisStore({ prefix: 'rl:general:', sendCommand }),
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many attempts, please try again later' },
  passOnStoreError: true,
  store: new RedisStore({ prefix: 'rl:auth:', sendCommand }),
});
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (error-log before quest routes — quest router at /api has authMiddleware that would block it)
app.use('/api/error-log', errorLogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api', questRoutes); // Quest routes handle /quests and /referral prefixes
app.use('/api/vault', vaultRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/forge', forgeRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/battle-pass', battlePassRoutes);
app.use('/api/premium', premiumRoutes);
app.use('/api/boosters', boosterRoutes);
app.use('/api/pvp', pvpRoutes);
app.use('/api/internal', internalRoutes);
app.use('/api/sse', sseRoutes);
app.use('/api/wallet-link', walletLinkRoutes);
app.use('/api/arc', arcRoutes);

// Error handler
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

// Graceful shutdown
function gracefulShutdown(signal: string) {
  logger.info({ signal }, 'Signal received. Shutting down gracefully...');
  disconnectEventBus();
  process.exit(0);
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
connectEventBus().then(() => {
  initSSESubscriptions();
  initEventHandlers();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'Arcania Nexus server running');
    logger.info({ env: env.NODE_ENV }, 'Environment');
    startScheduler();
  });
});

export default app;
