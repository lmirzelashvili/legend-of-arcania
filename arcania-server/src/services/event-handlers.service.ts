import { subscribeToEvent } from './event-bus.service.js';
import { trackAchievement } from './quest.service.js';
import { saveFailedEvent } from './dead-letter.service.js';
import { logger } from '../config/logger.js';

export function initEventHandlers() {
  subscribeToEvent('combat.pvp_kill', async (data) => {
    if (data.userId) {
      await trackAchievement(data.userId as string, 'pvp_kills', 1).catch(async (err) => {
        logger.warn({ err, event: 'combat.pvp_kill' }, 'Achievement tracking failed');
        await saveFailedEvent('combat.pvp_kill', data, String(err?.message ?? err)).catch(() => {});
      });
    }
  });

  subscribeToEvent('combat.pve_kill', async (data) => {
    if (data.userId) {
      await trackAchievement(data.userId as string, 'monsters_killed', 1).catch(async (err) => {
        logger.warn({ err, event: 'combat.pve_kill' }, 'Achievement tracking failed');
        await saveFailedEvent('combat.pve_kill', data, String(err?.message ?? err)).catch(() => {});
      });
    }
  });
}
