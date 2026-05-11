import prisma from '../config/db.js';
import { logger } from '../config/logger.js';

export async function checkPremiumExpiry(): Promise<void> {
  const now = new Date();

  // Find all subscriptions that are still flagged active but have passed their end date
  const expired = await prisma.premiumSubscription.findMany({
    where: { isActive: true, endDate: { lt: now } },
    select: { id: true, userId: true },
  });

  if (expired.length === 0) return;

  const subscriptionIds = expired.map(s => s.id);
  const userIds = [...new Set(expired.map(s => s.userId))];

  await prisma.$transaction([
    prisma.premiumSubscription.updateMany({
      where: { id: { in: subscriptionIds } },
      data: { isActive: false },
    }),
    prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: { isPremium: false },
    }),
  ]);

  logger.info({ count: expired.length }, 'Expired premium subscriptions revoked');
}
