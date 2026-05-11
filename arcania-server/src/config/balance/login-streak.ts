// Balance config — login streak reward cycle.
// Edit these values to tune the 7-day reward cycle for daily logins.

import type { QuestReward } from '../../types/index.js';

/**
 * 7-day reward cycle for consecutive daily logins.
 * After day 7, the cycle wraps back to day 1.
 * Index 0 = Day 1, index 6 = Day 7+.
 */
export const LOGIN_STREAK_REWARDS: QuestReward[] = [
  { gold: 1000 },                                    // Day 1
  { gold: 2000 },                                    // Day 2
  { arcanite: 5 },                                   // Day 3
  { gold: 5000 },                                    // Day 4
  { item: 'Box of Cinder' },                         // Day 5
  { arcanite: 10 },                                  // Day 6
  { gold: 25000, booster: 'Mega Booster (8h)' },     // Day 7+
];
