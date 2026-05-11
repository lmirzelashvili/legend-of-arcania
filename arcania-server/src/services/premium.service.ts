// Premium Subscription Service — Premium status management and bonus calculations

import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';

// ==================== TYPES ====================

export interface PremiumBonuses {
  xpBonus: number;          // 0.2 = +20% XP
  goldBonus: number;        // 0.1 = +10% gold
  enhancementBonus: number; // +5% enhancement success rate
  forgingBonus: number;     // +5% forging success rate
  marketplaceFeeRate: number; // 2% fee (vs standard 5%)
}

export interface PremiumStatusData {
  isPremium: boolean;
  subscription: {
    id: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    daysRemaining: number;
  } | null;
}

// ==================== CONSTANTS ====================

const PREMIUM_BONUSES: PremiumBonuses = {
  xpBonus: 0.2,
  goldBonus: 0.1,
  enhancementBonus: 5,
  forgingBonus: 5,
  marketplaceFeeRate: 0.02,
};

const DEFAULT_BONUSES: PremiumBonuses = {
  xpBonus: 0,
  goldBonus: 0,
  enhancementBonus: 0,
  forgingBonus: 0,
  marketplaceFeeRate: 0.05,
};

// ==================== ACTIVATE PREMIUM ====================

export async function activatePremium(
  userId: string,
  durationDays: number,
): Promise<PremiumStatusData> {
  if (durationDays <= 0) throw new AppError(400, 'Duration must be positive');
  if (durationDays > 365) throw new AppError(400, 'Maximum subscription duration is 365 days');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  const now = new Date();
  const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Deactivate any existing active subscriptions
  await prisma.premiumSubscription.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false },
  });

  // Create new subscription
  const subscription = await prisma.premiumSubscription.create({
    data: {
      userId,
      startDate: now,
      endDate,
      isActive: true,
    },
  });

  // Set user.isPremium
  await prisma.user.update({
    where: { id: userId },
    data: { isPremium: true },
  });

  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  return {
    isPremium: true,
    subscription: {
      id: subscription.id,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      isActive: true,
      daysRemaining,
    },
  };
}

// ==================== ENSURE PREMIUM FRESH ====================

// Checks whether the user's active subscription has expired and revokes it if so.
// Returns the current real premium status after any necessary cleanup.
// This is the single source of truth for expiry enforcement — call it from any
// endpoint that gates behaviour on premium status.
export async function ensurePremiumFresh(userId: string): Promise<boolean> {
  const now = new Date();

  // Find the most recent active subscription
  const subscription = await prisma.premiumSubscription.findFirst({
    where: { userId, isActive: true },
    orderBy: { endDate: 'desc' },
  });

  if (!subscription) {
    // No active subscription — clear user flag only if it is currently set
    await prisma.user.updateMany({
      where: { id: userId, isPremium: true },
      data: { isPremium: false },
    });
    return false;
  }

  // Subscription has expired — revoke it
  if (subscription.endDate < now) {
    await prisma.$transaction([
      prisma.premiumSubscription.update({
        where: { id: subscription.id },
        data: { isActive: false },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { isPremium: false },
      }),
    ]);
    return false;
  }

  // Active and valid — set user flag only if it is currently unset
  await prisma.user.updateMany({
    where: { id: userId, isPremium: false },
    data: { isPremium: true },
  });

  return true;
}

// ==================== CHECK PREMIUM STATUS ====================

export async function checkPremiumStatus(userId: string): Promise<PremiumStatusData> {
  const isPremium = await ensurePremiumFresh(userId);

  if (!isPremium) {
    return { isPremium: false, subscription: null };
  }

  // Fetch the now-confirmed active subscription for display data
  const subscription = await prisma.premiumSubscription.findFirst({
    where: { userId, isActive: true },
    orderBy: { endDate: 'desc' },
  });

  // Guard: subscription disappeared between the two queries (edge case)
  if (!subscription) {
    return { isPremium: false, subscription: null };
  }

  const now = new Date();
  const daysRemaining = Math.ceil(
    (subscription.endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );

  return {
    isPremium: true,
    subscription: {
      id: subscription.id,
      startDate: subscription.startDate.toISOString(),
      endDate: subscription.endDate.toISOString(),
      isActive: true,
      daysRemaining,
    },
  };
}

// ==================== GET PREMIUM BONUSES ====================

export async function getPremiumBonuses(userId: string): Promise<PremiumBonuses> {
  const isPremium = await isUserPremium(userId);
  return isPremium ? { ...PREMIUM_BONUSES } : { ...DEFAULT_BONUSES };
}

// ==================== IS USER PREMIUM ====================

export async function isUserPremium(userId: string): Promise<boolean> {
  const now = new Date();

  const activeSubscription = await prisma.premiumSubscription.findFirst({
    where: {
      userId,
      isActive: true,
      endDate: { gte: now },
    },
  });

  return !!activeSubscription;
}
