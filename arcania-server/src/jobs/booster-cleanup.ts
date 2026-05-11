import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

export async function cleanupExpiredBoosters(): Promise<void> {
  const result = await prisma.activeBooster.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  if (result.count > 0) logger.info({ count: result.count }, 'Expired boosters cleaned up');
}
