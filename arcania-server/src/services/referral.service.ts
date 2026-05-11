import { randomBytes } from 'crypto';
import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import type { ReferralStatsResponse } from '../types/index.js';

// ==================== HELPERS ====================

function generateSecureCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(bytes[i] % chars.length);
  }
  return code;
}

// ==================== REFERRAL CODE ====================

export async function generateReferralCode(userId: string): Promise<string> {
  const existing = await prisma.referral.findUnique({ where: { userId } });

  if (existing) {
    return existing.referralCode;
  }

  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateSecureCode();
    try {
      const referral = await prisma.referral.create({
        data: {
          userId,
          referralCode: code,
        },
      });
      return referral.referralCode;
    } catch (err: unknown) {
      // Prisma unique constraint violation code
      const prismaErr = err as { code?: string; message?: string };
      const isUniqueViolation =
        prismaErr?.code === 'P2002' ||
        prismaErr?.message?.includes('Unique constraint');
      if (!isUniqueViolation || attempt === MAX_ATTEMPTS - 1) {
        throw err;
      }
      // Retry with a new code
    }
  }

  // Should never reach here, but satisfy TypeScript
  throw new AppError(500, 'Failed to generate a unique referral code');
}

// ==================== USE REFERRAL CODE ====================

export async function useReferralCode(userId: string, code: string): Promise<void> {
  // Validate inputs before entering the transaction
  const userReferral = await prisma.referral.findUnique({ where: { userId } });
  if (userReferral?.referredBy) {
    throw new AppError(400, 'You have already used a referral code');
  }

  const referrer = await prisma.referral.findUnique({ where: { referralCode: code } });
  if (!referrer) {
    throw new AppError(404, 'Invalid referral code');
  }

  if (referrer.userId === userId) {
    throw new AppError(400, 'You cannot use your own referral code');
  }

  const alreadyReferred = await prisma.referralUse.findFirst({
    where: { referralId: referrer.id, userId },
  });
  if (alreadyReferred) {
    throw new AppError(400, 'You have already been referred by this user');
  }

  await prisma.$transaction(async (tx) => {
    // Record the referral use
    await tx.referralUse.create({
      data: { referralId: referrer.id, userId },
    });

    // Update referrer stats
    await tx.referral.update({
      where: { id: referrer.id },
      data: {
        totalReferrals: { increment: 1 },
        commissionEarned: { increment: 10 },
      },
    });

    // Mark the current user as referred
    if (userReferral) {
      await tx.referral.update({
        where: { userId },
        data: { referredBy: referrer.userId },
      });
    } else {
      // Generate a code for the new user if they don't have one yet
      const newCode = generateSecureCode();
      await tx.referral.create({
        data: { userId, referralCode: newCode, referredBy: referrer.userId },
      });
    }

    // Reward: Give the referred user 5 arcanite (deposited to vault)
    await tx.vault.upsert({
      where: { userId },
      create: { userId, arcanite: 5 },
      update: { arcanite: { increment: 5 } },
    });

    // Reward: Give the referrer 10 arcanite (deposited to vault)
    await tx.vault.upsert({
      where: { userId: referrer.userId },
      create: { userId: referrer.userId, arcanite: 10 },
      update: { arcanite: { increment: 10 } },
    });
  });
}

// ==================== GET REFERRAL STATS ====================

export async function getReferralStats(userId: string): Promise<ReferralStatsResponse> {
  const referral = await prisma.referral.findUnique({ where: { userId } });

  if (!referral) {
    return {
      code: null,
      totalReferrals: 0,
      commissionEarned: 0,
    };
  }

  return {
    code: referral.referralCode,
    totalReferrals: referral.totalReferrals,
    commissionEarned: referral.commissionEarned,
  };
}
