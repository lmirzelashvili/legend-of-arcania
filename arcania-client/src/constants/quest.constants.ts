import type { QuestReward } from '@/services/api.service';

export const LOGIN_STREAK_REWARDS: QuestReward[] = [
  { gold: 1000 },                                    // Day 1
  { gold: 2000 },                                    // Day 2
  { arcanite: 5 },                                   // Day 3
  { gold: 5000 },                                    // Day 4
  { item: 'Box of Cinder' },                         // Day 5
  { arcanite: 10 },                                  // Day 6
  { gold: 25000, booster: 'Mega Booster (8h)' },     // Day 7
];

export const ACHIEVEMENT_SUBCATEGORIES = {
  combat: 'COMBAT',
  exploration: 'EXPLORATION',
  progression: 'PROGRESSION',
  economy: 'ECONOMY',
  social_achievement: 'SOCIAL',
} as const;

export type AchievementSubcategory = keyof typeof ACHIEVEMENT_SUBCATEGORIES;
