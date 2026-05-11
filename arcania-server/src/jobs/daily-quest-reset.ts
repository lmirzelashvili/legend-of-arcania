import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

export async function resetDailyQuests(): Promise<void> {
  const result = await prisma.playerQuest.updateMany({
    where: {
      quest: { resetPeriod: 'daily' },
      status: { in: ['COMPLETED', 'CLAIMED'] },
    },
    data: { status: 'IN_PROGRESS', progress: 0, completedAt: null, claimedAt: null },
  });
  if (result.count > 0) logger.info({ count: result.count }, 'Daily quests reset');
}
