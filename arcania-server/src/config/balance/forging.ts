// Balance config — forging system values.
// Edit these values to tune success rates, crystal bonuses, and material return rates.

/** Base success rate for each forge recipe tier (key = tier number). */
export const TIER_SUCCESS_RATES: Record<number, number> = {
  1: 0.60,
  2: 0.40,
  3: 0.25,
  4: 0.12,
  5: 0.05,
};

/** Base success rate for random-equipment forge recipes (armor and weapon/shield). */
export const RANDOM_EQUIP_BASE_RATE = 0.40;

/**
 * Crystal bonus configuration for optional extra crystals added before forging.
 * bonusPerCrystal: percentage points added to success rate per crystal used.
 * maxQty: maximum number of this crystal type a player may add in one forge attempt.
 */
export const CRYSTAL_BONUS: Record<string, { bonusPerCrystal: number; maxQty: number }> = {
  crystal_spirit:   { bonusPerCrystal: 0.5, maxQty: 30 },
  crystal_dominion: { bonusPerCrystal: 1,   maxQty: 20 },
};

/**
 * Material template IDs that are eligible to be partially returned on forge failure.
 * On failure, each returnable material has a 20–70% chance of being returned.
 */
export const RETURNABLE_MATERIAL_IDS: readonly string[] = [
  'material_feather_of_roc',
  'material_thread_of_silkworm',
  'material_finger_of_titan',
  'material_fang_of_griffin',
];

/** Minimum fraction of consumed returnable materials returned on failure. */
export const MATERIAL_RETURN_MIN = 0.20;

/** Maximum fraction of consumed returnable materials returned on failure. */
export const MATERIAL_RETURN_MAX = 0.70;
