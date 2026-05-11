// Re-export all game constants from arcania-shared (single source of truth)
export type { ClassBaseConfig } from '@shared/constants';
export {
  CLASS_BASE_STATS,
  STAT_CAPS,
  RACIAL_BONUSES,
  RACE_CLASS_COMPATIBILITY,
  calculateBaseStats,
  MAX_LEVEL,
  STAT_POINTS_CONFIG,
  calculateTotalStatPoints,
  xpRequiredForLevel,
  statPointsForLevelUp,
} from '@shared/constants';
