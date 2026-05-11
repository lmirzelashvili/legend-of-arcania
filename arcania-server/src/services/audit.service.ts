import { logger } from '../config/logger.js';

/**
 * Structured audit log for sensitive operations.
 * Outputs as a pino log entry with `audit: true` for easy filtering.
 */
export function auditLog(action: string, userId: string, details: Record<string, unknown> = {}) {
  logger.info({ audit: true, action, userId, ...details });
}
