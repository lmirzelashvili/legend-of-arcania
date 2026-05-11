import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

export async function expireStaleTradesJob(): Promise<void> {
  const result = await prisma.trade.updateMany({
    where: {
      status: { in: ['PENDING', 'ACTIVE', 'LOCKED'] },
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
  if (result.count > 0) logger.info({ count: result.count }, 'Stale trades expired');
}
