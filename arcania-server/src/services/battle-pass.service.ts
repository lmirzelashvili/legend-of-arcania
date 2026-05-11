// Battle Pass Service — Season-based progression with free & premium reward tracks

import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { toJsonInput } from '../utils/prisma-json-helpers.js';

// ==================== TYPES ====================

export interface TierReward {
  type: 'gold' | 'arcanite' | 'box';
  amount?: number;
  boxName?: string;
}

export interface BattlePassSeasonData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  tiers: BattlePassTierData[];
}

export interface BattlePassTierData {
  id: string;
  tierNumber: number;
  xpRequired: number;
  freeReward: TierReward | null;
  premiumReward: TierReward | null;
}

export interface BattlePassProgressData {
  id: string;
  seasonId: string;
  hasPremium: boolean;
  currentXp: number;
  currentTier: number;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
}

// ==================== GET ACTIVE SEASON ====================

export async function getActiveSeason(): Promise<BattlePassSeasonData | null> {
  const now = new Date();

  const season = await prisma.battlePassSeason.findFirst({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      tiers: { orderBy: { tierNumber: 'asc' } },
    },
  });

  if (!season) return null;

  return {
    id: season.id,
    name: season.name,
    startDate: season.startDate.toISOString(),
    endDate: season.endDate.toISOString(),
    isActive: season.isActive,
    tiers: season.tiers.map(t => ({
      id: t.id,
      tierNumber: t.tierNumber,
      xpRequired: t.xpRequired,
      freeReward: t.freeReward as TierReward | null,
      premiumReward: t.premiumReward as TierReward | null,
    })),
  };
}

// ==================== GET TIERS ====================

export async function getTiers(seasonId: string): Promise<BattlePassTierData[]> {
  const tiers = await prisma.battlePassTier.findMany({
    where: { seasonId },
    orderBy: { tierNumber: 'asc' },
  });

  return tiers.map(t => ({
    id: t.id,
    tierNumber: t.tierNumber,
    xpRequired: t.xpRequired,
    freeReward: t.freeReward as TierReward | null,
    premiumReward: t.premiumReward as TierReward | null,
  }));
}

// ==================== GET PROGRESS ====================

export async function getProgress(userId: string): Promise<BattlePassProgressData | null> {
  const season = await getActiveSeason();
  if (!season) return null;

  let progress = await prisma.playerBattlePassProgress.findUnique({
    where: { userId_seasonId: { userId, seasonId: season.id } },
  });

  if (!progress) {
    progress = await prisma.playerBattlePassProgress.create({
      data: {
        userId,
        seasonId: season.id,
        hasPremium: false,
        currentXp: 0,
        currentTier: 0,
        claimedFreeTiers: [],
        claimedPremiumTiers: [],
      },
    });
  }

  return {
    id: progress.id,
    seasonId: progress.seasonId,
    hasPremium: progress.hasPremium,
    currentXp: progress.currentXp,
    currentTier: progress.currentTier,
    claimedFreeTiers: progress.claimedFreeTiers as number[],
    claimedPremiumTiers: progress.claimedPremiumTiers as number[],
  };
}

// ==================== PURCHASE BATTLE PASS ====================

const BATTLE_PASS_ARCANITE_COST = 500;

export async function purchaseBattlePass(
  userId: string,
  characterId: string,
): Promise<{ success: boolean; message: string }> {
  const season = await getActiveSeason();
  if (!season) throw new AppError(400, 'No active battle pass season');

  // Check if already purchased
  const existing = await prisma.playerBattlePassProgress.findUnique({
    where: { userId_seasonId: { userId, seasonId: season.id } },
  });

  if (existing?.hasPremium) {
    throw new AppError(400, 'You already own the premium battle pass for this season');
  }

  // Check arcanite on the character
  const character = await prisma.character.findFirst({
    where: { id: characterId, userId },
  });
  if (!character) throw new AppError(404, 'Character not found');

  if (character.arcanite < BATTLE_PASS_ARCANITE_COST) {
    throw new AppError(400, `Not enough arcanite. Need ${BATTLE_PASS_ARCANITE_COST}, have ${character.arcanite}.`);
  }

  await prisma.$transaction(async (tx) => {
    // Deduct arcanite atomically
    await tx.character.update({
      where: { id: character.id },
      data: { arcanite: { decrement: BATTLE_PASS_ARCANITE_COST } },
    });

    // Set hasPremium on progress (upsert)
    await tx.playerBattlePassProgress.upsert({
      where: { userId_seasonId: { userId, seasonId: season.id } },
      create: {
        userId,
        seasonId: season.id,
        hasPremium: true,
        currentXp: 0,
        currentTier: 0,
        claimedFreeTiers: [],
        claimedPremiumTiers: [],
      },
      update: { hasPremium: true },
    });
  });

  return { success: true, message: 'Premium Battle Pass purchased!' };
}

// ==================== ADD BATTLE PASS XP ====================

export async function addBattlePassXP(
  userId: string,
  xp: number,
): Promise<BattlePassProgressData | null> {
  const season = await getActiveSeason();
  if (!season) return null;

  let progress = await prisma.playerBattlePassProgress.findUnique({
    where: { userId_seasonId: { userId, seasonId: season.id } },
  });

  if (!progress) {
    progress = await prisma.playerBattlePassProgress.create({
      data: {
        userId,
        seasonId: season.id,
        hasPremium: false,
        currentXp: 0,
        currentTier: 0,
        claimedFreeTiers: [],
        claimedPremiumTiers: [],
      },
    });
  }

  const maxTier = season.tiers.length;
  let currentXp = progress.currentXp + xp;
  let currentTier = progress.currentTier;

  // Auto-advance tiers
  while (currentTier < maxTier) {
    const nextTier = season.tiers.find(t => t.tierNumber === currentTier + 1);
    if (!nextTier) break;

    if (currentXp >= nextTier.xpRequired) {
      currentXp -= nextTier.xpRequired;
      currentTier++;
    } else {
      break;
    }
  }

  // Cap XP at 0 if max tier reached
  if (currentTier >= maxTier) {
    currentXp = 0;
  }

  const updated = await prisma.playerBattlePassProgress.update({
    where: { id: progress.id },
    data: { currentXp, currentTier },
  });

  return {
    id: updated.id,
    seasonId: updated.seasonId,
    hasPremium: updated.hasPremium,
    currentXp: updated.currentXp,
    currentTier: updated.currentTier,
    claimedFreeTiers: updated.claimedFreeTiers as number[],
    claimedPremiumTiers: updated.claimedPremiumTiers as number[],
  };
}

// ==================== CLAIM TIER REWARD ====================

export async function claimTierReward(
  userId: string,
  tierNumber: number,
  track: 'free' | 'premium',
): Promise<{ success: boolean; reward: TierReward; message: string }> {
  const season = await getActiveSeason();
  if (!season) throw new AppError(400, 'No active battle pass season');

  const progress = await prisma.playerBattlePassProgress.findUnique({
    where: { userId_seasonId: { userId, seasonId: season.id } },
  });
  if (!progress) throw new AppError(400, 'No battle pass progress found');

  // Validate tier reached
  if (tierNumber > progress.currentTier) {
    throw new AppError(400, `You have not reached tier ${tierNumber} yet (current: ${progress.currentTier})`);
  }

  // Validate premium track access
  if (track === 'premium' && !progress.hasPremium) {
    throw new AppError(400, 'Premium battle pass required to claim premium rewards');
  }

  // Find tier data
  const tier = season.tiers.find(t => t.tierNumber === tierNumber);
  if (!tier) throw new AppError(404, `Tier ${tierNumber} not found`);

  const reward = track === 'free' ? tier.freeReward : tier.premiumReward;
  if (!reward) throw new AppError(400, `No ${track} reward for tier ${tierNumber}`);

  // Check if already claimed
  const claimedTiers = (track === 'free'
    ? progress.claimedFreeTiers
    : progress.claimedPremiumTiers) as number[];

  if (claimedTiers.includes(tierNumber)) {
    throw new AppError(400, `Tier ${tierNumber} ${track} reward already claimed`);
  }

  // Apply reward and mark claimed in a transaction
  await prisma.$transaction(async (tx) => {
    // Apply reward to vault
    let vault = await tx.vault.findUnique({ where: { userId } });
    if (!vault) {
      vault = await tx.vault.create({ data: { userId } });
    }

    if (reward.type === 'gold' && reward.amount) {
      await tx.vault.update({
        where: { id: vault.id },
        data: { gold: vault.gold + reward.amount },
      });
    } else if (reward.type === 'arcanite' && reward.amount) {
      await tx.vault.update({
        where: { id: vault.id },
        data: { arcanite: vault.arcanite + reward.amount },
      });
    }
    // Box rewards: deposit box item to vault (would require item template system)
    // For now, box rewards grant arcanite as placeholder
    if (reward.type === 'box' && reward.amount) {
      await tx.vault.update({
        where: { id: vault.id },
        data: { arcanite: vault.arcanite + reward.amount },
      });
    }

    // Update claimed tiers
    const updatedClaimedTiers = [...claimedTiers, tierNumber];
    const updateData = track === 'free'
      ? { claimedFreeTiers: updatedClaimedTiers }
      : { claimedPremiumTiers: updatedClaimedTiers };

    await tx.playerBattlePassProgress.update({
      where: { id: progress.id },
      data: updateData,
    });
  });

  return {
    success: true,
    reward,
    message: `Claimed tier ${tierNumber} ${track} reward: ${reward.amount} ${reward.type}`,
  };
}

// ==================== SEED DEFAULT SEASON ====================

export async function seedDefaultSeason(): Promise<void> {
  const existingCount = await prisma.battlePassSeason.count();
  if (existingCount > 0) return;

  const now = new Date();
  const endDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  const season = await prisma.battlePassSeason.create({
    data: {
      name: 'Dawn of Arcania',
      startDate: now,
      endDate,
      isActive: true,
    },
  });

  // Build 30 tiers
  const tiers: Array<{
    seasonId: string;
    tierNumber: number;
    xpRequired: number;
    freeReward: TierReward;
    premiumReward: TierReward;
  }> = [];

  for (let i = 1; i <= 30; i++) {
    // Free rewards: gold at every tier (scaling 500-5000), arcanite every 5 tiers
    const freeGold = Math.floor(500 + ((i - 1) / 29) * 4500); // 500 at T1, 5000 at T30
    let freeReward: TierReward;

    if (i % 5 === 0) {
      // Arcanite tiers: 10/20/30/40/50 arcanite scaling
      freeReward = { type: 'arcanite', amount: i * 2 };
    } else {
      freeReward = { type: 'gold', amount: freeGold };
    }

    // Premium rewards: better gold, arcanite every 3 tiers, boxes at 10/20/30
    let premiumReward: TierReward;

    if (i === 10 || i === 20 || i === 30) {
      // Box rewards at milestone tiers
      const boxArcanite = i === 10 ? 50 : i === 20 ? 100 : 200;
      premiumReward = { type: 'box', amount: boxArcanite, boxName: `Season Chest (Tier ${i})` };
    } else if (i % 3 === 0) {
      // Arcanite every 3 tiers
      premiumReward = { type: 'arcanite', amount: i * 3 };
    } else {
      // Better gold
      premiumReward = { type: 'gold', amount: freeGold * 2 };
    }

    tiers.push({
      seasonId: season.id,
      tierNumber: i,
      xpRequired: 1000,
      freeReward,
      premiumReward,
    });
  }

  // Prisma createMany with Json fields requires casting
  await prisma.battlePassTier.createMany({
    data: tiers.map(t => ({
      seasonId: t.seasonId,
      tierNumber: t.tierNumber,
      xpRequired: t.xpRequired,
      freeReward: toJsonInput(t.freeReward),
      premiumReward: toJsonInput(t.premiumReward),
    })),
  });

  console.log(`[BattlePass] Seeded Season 1: "${season.name}" with 30 tiers`);
}
