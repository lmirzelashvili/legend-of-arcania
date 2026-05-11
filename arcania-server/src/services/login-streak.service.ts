import prisma from '../config/db.js';
import type { QuestReward, LoginStreakResponse } from '../types/index.js';
import { resetRepeatableQuests, markDailyLoginQuestClaimable } from './quest.service.js';
import { LOGIN_STREAK_REWARDS } from '../config/balance/login-streak.js';

export { LOGIN_STREAK_REWARDS };

// ==================== HELPERS ====================

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// ==================== LOGIN STREAK ====================

export async function handleLogin(userId: string): Promise<LoginStreakResponse> {
  const today = todayString();

  let streak = await prisma.loginStreak.findUnique({ where: { userId } });

  if (!streak) {
    streak = await prisma.loginStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
      },
    });

    // Also mark the daily_login quest as CLAIMABLE
    await markDailyLoginQuestClaimable(userId);

    return {
      streakDay: 1,
      reward: LOGIN_STREAK_REWARDS[0],
      isNewDay: true,
    };
  }

  // Already logged in today
  if (streak.lastLoginDate === today) {
    const dayIndex = ((streak.currentStreak - 1) % 7);
    return {
      streakDay: streak.currentStreak,
      reward: LOGIN_STREAK_REWARDS[dayIndex],
      isNewDay: false,
    };
  }

  // New day — check if consecutive
  let newStreak: number;
  if (streak.lastLoginDate) {
    const lastDate = new Date(streak.lastLoginDate + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    const diffMs = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = streak.currentStreak + 1;
    } else {
      newStreak = 1; // Streak broken
    }
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(streak.longestStreak, newStreak);

  await prisma.loginStreak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastLoginDate: today,
    },
  });

  // Mark the daily_login quest as CLAIMABLE
  await markDailyLoginQuestClaimable(userId);

  // Reset any repeatable quests that are due
  await resetRepeatableQuests(userId);

  // Cycle rewards: after day 7, wrap back to day 1
  const dayIndex = ((newStreak - 1) % 7);

  return {
    streakDay: newStreak,
    reward: LOGIN_STREAK_REWARDS[dayIndex],
    isNewDay: true,
  };
}

// ==================== GET LOGIN STREAK ====================

export async function getLoginStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  lastLoginDate: string | null;
}> {
  const streak = await prisma.loginStreak.findUnique({ where: { userId } });

  if (!streak) {
    return { currentStreak: 0, longestStreak: 0, lastLoginDate: null };
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastLoginDate: streak.lastLoginDate,
  };
}
