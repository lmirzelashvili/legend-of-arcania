import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

export async function checkSeasonRotation(): Promise<void> {
  const now = new Date();

  // Deactivate battle pass seasons whose end date has passed but are still flagged active
  const result = await prisma.battlePassSeason.updateMany({
    where: { isActive: true, endDate: { lt: now } },
    data: { isActive: false },
  });

  if (result.count > 0) logger.info({ count: result.count }, 'Battle pass seasons deactivated');
}
