import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

export async function resetWeeklyQuests(): Promise<void> {
  const result = await prisma.playerQuest.updateMany({
    where: {
      quest: { resetPeriod: 'weekly' },
      status: { in: ['COMPLETED', 'CLAIMED'] },
    },
    data: { status: 'IN_PROGRESS', progress: 0, completedAt: null, claimedAt: null },
  });
  if (result.count > 0) logger.info({ count: result.count }, 'Weekly quests reset');
}
