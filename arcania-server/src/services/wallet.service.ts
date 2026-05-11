// Wallet Service — server-side wallet management & spin validation

import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import type { Prisma } from '@prisma/client';

const SPINS_PER_DAY = 3;

interface SpinReward {
  type: 'gold' | 'arcanite' | 'creation_token';
  gold?: number;
  arcanite?: number;
  weight: number;
}

const SPIN_REWARDS: SpinReward[] = [
  { type: 'gold', gold: 200, weight: 25 },
  { type: 'gold', gold: 500, weight: 20 },
  { type: 'gold', gold: 1000, weight: 12 },
  { type: 'gold', gold: 2000, weight: 5 },
  { type: 'arcanite', arcanite: 5, weight: 15 },
  { type: 'arcanite', arcanite: 10, weight: 10 },
  { type: 'arcanite', arcanite: 15, weight: 5 },
  { type: 'creation_token', weight: 8 },
];

function selectSpinReward(): SpinReward {
  const totalWeight = SPIN_REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const reward of SPIN_REWARDS) {
    random -= reward.weight;
    if (random <= 0) return reward;
  }

  return SPIN_REWARDS[0];
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();
}

export async function getWallet(userId: string) {
  let wallet = await prisma.accountWallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.accountWallet.create({
      data: { userId, creationTokens: 1, spinsRemaining: SPINS_PER_DAY },
    });
  }

  // Daily spin reset
  const now = new Date();
  if (!isSameDay(wallet.lastSpinReset, now)) {
    wallet = await prisma.accountWallet.update({
      where: { userId },
      data: { spinsRemaining: SPINS_PER_DAY, lastSpinReset: now },
    });
  }

  return {
    creationTokens: wallet.creationTokens,
    spinsRemaining: wallet.spinsRemaining,
    lastSpinReset: wallet.lastSpinReset.toISOString(),
  };
}

export async function performSpin(userId: string) {
  let wallet = await prisma.accountWallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError(404, 'Wallet not found');

  // Daily reset check
  const now = new Date();
  if (!isSameDay(wallet.lastSpinReset, now)) {
    wallet = await prisma.accountWallet.update({
      where: { userId },
      data: { spinsRemaining: SPINS_PER_DAY, lastSpinReset: now },
    });
  }

  if (wallet.spinsRemaining <= 0) {
    throw new AppError(400, 'No spins remaining today');
  }

  const reward = selectSpinReward();

  const updateData: Prisma.AccountWalletUpdateInput = {
    spinsRemaining: wallet.spinsRemaining - 1,
  };

  if (reward.type === 'creation_token') {
    updateData.creationTokens = wallet.creationTokens + 1;
  }

  // Wrap wallet update + vault deposits in a transaction for atomicity
  let goldDeposited = 0;
  let arcaniteDeposited = 0;
  const updatedWallet = await prisma.$transaction(async (tx) => {
    const walletResult = await tx.accountWallet.update({
      where: { userId },
      data: updateData,
    });

    // Route spin gold/arcanite to user's vault (create if missing)
    if (reward.gold || reward.arcanite) {
      let vault = await tx.vault.findUnique({ where: { userId } });
      if (!vault) {
        vault = await tx.vault.create({ data: { userId } });
      }
      const vaultUpdate: Record<string, number> = {};
      if (reward.gold) {
        vaultUpdate.gold = vault.gold + reward.gold;
        goldDeposited = reward.gold;
      }
      if (reward.arcanite) {
        vaultUpdate.arcanite = vault.arcanite + reward.arcanite;
        arcaniteDeposited = reward.arcanite;
      }
      await tx.vault.update({ where: { id: vault.id }, data: vaultUpdate });
    }

    return walletResult;
  });

  return {
    reward: {
      type: reward.type,
      gold: reward.gold || 0,
      arcanite: reward.arcanite || 0,
      goldDeposited,
      arcaniteDeposited,
    },
    wallet: {
      creationTokens: updatedWallet.creationTokens,
      spinsRemaining: updatedWallet.spinsRemaining,
      lastSpinReset: updatedWallet.lastSpinReset.toISOString(),
    },
  };
}

export async function useCreationToken(userId: string) {
  const wallet = await prisma.accountWallet.findUnique({ where: { userId } });
  if (!wallet) throw new AppError(404, 'Wallet not found');

  if (wallet.creationTokens <= 0) {
    throw new AppError(400, 'No creation tokens available');
  }

  const updated = await prisma.accountWallet.update({
    where: { userId },
    data: { creationTokens: wallet.creationTokens - 1 },
  });

  return {
    success: true,
    creationTokens: updated.creationTokens,
  };
}
