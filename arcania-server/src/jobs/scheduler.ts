import cron from 'node-cron';
import { logger } from '../config/logger.js';
import { resetDailyQuests } from './daily-quest-reset.js';
import { resetWeeklyQuests } from './weekly-quest-reset.js';
import { cleanupExpiredBoosters } from './booster-cleanup.js';
import { checkPremiumExpiry } from './premium-expiry.js';
import { expireStaleTradesJob } from './trade-expiry.js';
import { checkSeasonRotation } from './season-rotation.js';
import { expireOldListings } from './listing-expiry.js';

export function startScheduler(): void {
  logger.info('Starting background job scheduler');

  // Daily quest reset — every day at UTC midnight
  cron.schedule('0 0 * * *', () => runJob('daily-quest-reset', resetDailyQuests));

  // Weekly quest reset — every Monday at UTC midnight
  cron.schedule('0 0 * * 1', () => runJob('weekly-quest-reset', resetWeeklyQuests));

  // Booster cleanup — every 5 minutes
  cron.schedule('*/5 * * * *', () => runJob('booster-cleanup', cleanupExpiredBoosters));

  // Premium expiry check — every hour
  cron.schedule('0 * * * *', () => runJob('premium-expiry', checkPremiumExpiry));

  // Trade expiry — every 2 minutes
  cron.schedule('*/2 * * * *', () => runJob('trade-expiry', expireStaleTradesJob));

  // Battle pass season rotation — every hour
  cron.schedule('0 * * * *', () => runJob('season-rotation', checkSeasonRotation));

  // Marketplace listing expiry — every hour
  cron.schedule('0 * * * *', () => runJob('listing-expiry', expireOldListings));
}

async function runJob(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (err) {
    logger.error({ job: name, err }, 'Background job failed');
  }
}
