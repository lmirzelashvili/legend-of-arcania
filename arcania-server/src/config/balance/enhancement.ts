// Balance config — item enhancement system values.
// Edit these values to tune enhancement success rates, failure outcomes, stat bonuses, and crystal requirements.

/** Success probability for each enhancement level (key = target level). */
export const ENHANCEMENT_SUCCESS_RATES: Record<number, number> = {
  1: 0.95, 2: 0.90, 3: 0.85, 4: 0.75, 5: 0.65,
  6: 0.55, 7: 0.45, 8: 0.40, 9: 0.35, 10: 0.30,
  11: 0.25, 12: 0.20, 13: 0.15, 14: 0.10, 15: 0.05,
};

/**
 * Failure outcome thresholds by target level.
 * Levels up to and including `maxLevel` produce `result`.
 * Entries are evaluated in order; the first match wins.
 */
export const ENHANCEMENT_FAILURE_RESULTS: Array<{
  maxLevel: number;
  result: 'crystal_consumed' | 'level_drop' | 'destroyed';
  dropTo?: number;
}> = [
  { maxLevel: 4,  result: 'crystal_consumed' },
  { maxLevel: 7,  result: 'level_drop', dropTo: 4 },
  { maxLevel: 10, result: 'level_drop', dropTo: 5 },
  { maxLevel: Infinity, result: 'destroyed' },
];

/**
 * Cumulative stat bonus percent added per enhancement tier group.
 * Each entry applies to levels from `fromLevel` to `toLevel` inclusive,
 * adding `bonusPerLevel` percent per level within that range.
 */
export const ENHANCEMENT_STAT_BONUSES: Array<{
  fromLevel: number;
  toLevel: number;
  bonusPerLevel: number;
}> = [
  { fromLevel: 1,  toLevel: 5,  bonusPerLevel: 2 },
  { fromLevel: 6,  toLevel: 7,  bonusPerLevel: 3 },
  { fromLevel: 8,  toLevel: 10, bonusPerLevel: 3 },
  { fromLevel: 11, toLevel: 15, bonusPerLevel: 5 },
];

/**
 * Crystal type required per enhancement target level.
 * Levels up to and including `maxLevel` require the specified crystal.
 * Entries are evaluated in order; the first match wins.
 */
export const CRYSTAL_REQUIREMENTS: Array<{
  maxLevel: number;
  crystal: 'spirit' | 'dominion';
}> = [
  { maxLevel: 7,        crystal: 'spirit' },
  { maxLevel: Infinity, crystal: 'dominion' },
];

/** Base chance (0–1) that a dropped item rolls as Prestige quality. */
export const PRESTIGE_DROP_CHANCE = 0.10;
