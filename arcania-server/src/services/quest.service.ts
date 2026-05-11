import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { xpRequiredForLevel, statPointsForLevelUp, MAX_LEVEL } from '../utils/game-constants.js';
import type { QuestReward, QuestDataResponse, PlayerQuestData, QuestStatus } from '../types/index.js';
import type { PlayerQuest, QuestDefinition, Prisma } from '@prisma/client';

// ==================== HELPERS ====================

type PlayerQuestWithQuest = PlayerQuest & { quest: QuestDefinition };

function mapPlayerQuest(row: PlayerQuestWithQuest): PlayerQuestData {
  return {
    id: row.id,
    questId: row.questId,
    status: row.status as QuestStatus,
    progress: row.progress,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    claimedAt: row.claimedAt ? row.claimedAt.toISOString() : null,
    quest: {
      id: row.quest.id,
      title: row.quest.title,
      description: row.quest.description,
      category: row.quest.category,
      subcategory: row.quest.subcategory ?? undefined,
      targetProgress: row.quest.targetProgress,
      reward: row.quest.reward as QuestReward,
      unlockLevel: row.quest.unlockLevel ?? undefined,
      prerequisiteQuestId: row.quest.prerequisiteQuestId ?? undefined,
      isRepeatable: row.quest.isRepeatable,
      resetPeriod: row.quest.resetPeriod as 'daily' | 'weekly' | undefined,
      trackingKey: row.quest.trackingKey,
    },
  };
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// ==================== GET QUESTS ====================

export async function getQuests(userId: string): Promise<QuestDataResponse> {
  let rows = await prisma.playerQuest.findMany({
    where: { userId },
    include: { quest: true },
  });

  // If the player has no quests yet, initialize them first
  if (rows.length === 0) {
    await initializeQuests(userId);
    rows = await prisma.playerQuest.findMany({
      where: { userId },
      include: { quest: true },
    });
  }

  const mapped = rows.map(mapPlayerQuest);

  const quests: QuestDataResponse['quests'] = {
    social: [],
    achievement: [],
    daily: [],
    weekly: [],
    referral: [],
  };

  for (const pq of mapped) {
    const cat = pq.quest.category as keyof typeof quests;
    if (quests[cat]) {
      quests[cat].push(pq);
    }
  }

  const totalQuests = mapped.length;
  const completedQuests = mapped.filter(q => q.status === 'COMPLETED').length;
  const claimableQuests = mapped.filter(q => q.status === 'CLAIMABLE').length;

  return { quests, totalQuests, completedQuests, claimableQuests };
}

// ==================== GET QUESTS BY CATEGORY ====================

export async function getQuestsByCategory(userId: string, category: string): Promise<PlayerQuestData[]> {
  let rows = await prisma.playerQuest.findMany({
    where: { userId },
    include: { quest: true },
  });

  if (rows.length === 0) {
    await initializeQuests(userId);
    rows = await prisma.playerQuest.findMany({
      where: { userId },
      include: { quest: true },
    });
  }

  return rows
    .filter(row => row.quest.category === category)
    .map(mapPlayerQuest);
}

// ==================== CLAIM REWARD ====================

export async function claimReward(userId: string, questId: string, characterId?: string): Promise<{ reward: QuestReward; message: string }> {
  // Try finding by PlayerQuest.id first, then by questId field
  let playerQuest = await prisma.playerQuest.findFirst({
    where: { id: questId, userId },
    include: { quest: true },
  });

  if (!playerQuest) {
    playerQuest = await prisma.playerQuest.findFirst({
      where: { questId, userId },
      include: { quest: true },
    });
  }

  if (!playerQuest) {
    throw new AppError(404, 'Quest not found');
  }

  if (playerQuest.status !== 'CLAIMABLE') {
    throw new AppError(400, `Quest is not claimable (current status: ${playerQuest.status})`);
  }

  const reward = playerQuest.quest.reward as QuestReward;

  // Atomic: apply all reward writes in a single transaction
  await prisma.$transaction(async (tx) => {
    // Apply gold / xp rewards to the specified character (or first if not specified)
    if (reward.gold || reward.xp) {
      const character = characterId
        ? await tx.character.findFirst({ where: { id: characterId, userId } })
        : await tx.character.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });

      if (character) {
        let newLevel = character.level;
        let newExperience = character.experience;
        let bonusStatPoints = 0;
        let bonusAbilityPoints = 0;

        if (reward.xp) {
          newExperience += reward.xp;

          // Level-up check using correct XP formula with max level cap
          while (newLevel < MAX_LEVEL && newExperience >= xpRequiredForLevel(newLevel)) {
            newExperience -= xpRequiredForLevel(newLevel);
            newLevel++;
            bonusStatPoints += statPointsForLevelUp(newLevel);
            bonusAbilityPoints += 1;
          }
          if (newLevel >= MAX_LEVEL) {
            newExperience = 0;
          }
        }

        await tx.character.update({
          where: { id: character.id },
          data: {
            ...(reward.gold ? { gold: { increment: reward.gold } } : {}),
            level: newLevel,
            experience: newExperience,
            unspentStatPoints: character.unspentStatPoints + bonusStatPoints,
            abilityPoints: character.abilityPoints + bonusAbilityPoints,
          },
        });
      }
    }

    // Apply arcanite reward to vault
    if (reward.arcanite) {
      let vault = await tx.vault.findUnique({ where: { userId } });
      if (!vault) {
        vault = await tx.vault.create({ data: { userId } });
      }
      await tx.vault.update({
        where: { id: vault.id },
        data: { arcanite: vault.arcanite + reward.arcanite },
      });
    }

    // Mark quest as COMPLETED with claimedAt timestamp.
    // Use updateMany with status in the WHERE clause so that only one concurrent
    // request can succeed — if another request already claimed it, count will be 0.
    const { count } = await tx.playerQuest.updateMany({
      where: { id: playerQuest.id, status: 'CLAIMABLE' },
      data: {
        status: 'COMPLETED',
        claimedAt: new Date(),
        completedAt: playerQuest.completedAt ?? new Date(),
      },
    });

    if (count === 0) {
      throw new AppError(400, 'Quest already claimed');
    }
  });

  return { reward, message: `Claimed reward for "${playerQuest.quest.title}"` };
}

// ==================== INITIALIZE QUESTS ====================

export async function initializeQuests(userId: string): Promise<void> {
  const definitions = await prisma.questDefinition.findMany();

  if (definitions.length === 0) {
    return; // No quest definitions seeded yet
  }

  // Check if user already has quests to avoid duplicates
  const existing = await prisma.playerQuest.count({ where: { userId } });
  if (existing > 0) {
    return;
  }

  const questData = definitions.map(def => ({
    userId,
    questId: def.id,
    status: def.prerequisiteQuestId ? 'LOCKED' : 'AVAILABLE',
    progress: 0,
  }));

  await prisma.playerQuest.createMany({ data: questData });
}

// ==================== COMPLETE SOCIAL QUEST ====================

export async function completeSocialQuest(userId: string, questId: string): Promise<void> {
  // Try finding by PlayerQuest.id first, then by questId field
  let playerQuest = await prisma.playerQuest.findFirst({
    where: { id: questId, userId },
    include: { quest: true },
  });

  if (!playerQuest) {
    playerQuest = await prisma.playerQuest.findFirst({
      where: { questId, userId },
      include: { quest: true },
    });
  }

  if (!playerQuest) {
    throw new AppError(404, 'Quest not found');
  }

  if (playerQuest.quest.category !== 'social') {
    throw new AppError(400, 'Quest is not a social quest');
  }

  if (playerQuest.status === 'COMPLETED') {
    throw new AppError(400, 'Quest already completed');
  }

  if (playerQuest.status === 'CLAIMABLE') {
    return; // Already claimable, nothing to do
  }

  await prisma.playerQuest.update({
    where: { id: playerQuest.id },
    data: {
      status: 'CLAIMABLE',
      progress: playerQuest.quest.targetProgress,
      completedAt: new Date(),
    },
  });
}

// ==================== ACHIEVEMENT TRACKING ====================

export async function trackAchievement(
  userId: string,
  trackingKey: string,
  incrementBy: number = 1,
  tx?: Prisma.TransactionClient,
): Promise<boolean> {
  const client = tx ?? prisma;

  // Find player quests matching the tracking key that are available or in-progress
  const matchingQuests = await client.playerQuest.findMany({
    where: {
      userId,
      quest: { trackingKey },
      status: { in: ['AVAILABLE', 'IN_PROGRESS'] },
    },
    include: { quest: true },
  });

  if (matchingQuests.length === 0) return false;

  let anyUpdated = false;

  for (const pq of matchingQuests) {
    const newProgress = Math.min(pq.progress + incrementBy, pq.quest.targetProgress);
    const newStatus = newProgress >= pq.quest.targetProgress ? 'CLAIMABLE' : 'IN_PROGRESS';

    await client.playerQuest.update({
      where: { id: pq.id },
      data: {
        progress: newProgress,
        status: newStatus,
        ...(newStatus === 'CLAIMABLE' ? { completedAt: new Date() } : {}),
      },
    });

    anyUpdated = true;
  }

  return anyUpdated;
}

// ==================== HELPERS USED BY LOGIN-STREAK SERVICE ====================

export async function markDailyLoginQuestClaimable(userId: string): Promise<void> {
  // Find the quest with trackingKey 'daily_login'
  const quest = await prisma.playerQuest.findFirst({
    where: {
      userId,
      quest: { trackingKey: 'daily_login' },
      status: { in: ['AVAILABLE', 'IN_PROGRESS'] },
    },
  });

  if (quest) {
    await prisma.playerQuest.update({
      where: { id: quest.id },
      data: {
        status: 'CLAIMABLE',
        progress: 1,
        completedAt: new Date(),
      },
    });
  }
}

// ==================== RESET REPEATABLE QUESTS ====================

export async function resetRepeatableQuests(userId: string): Promise<void> {
  const today = todayString();

  // Find all completed repeatable quests for this user
  const completedRepeatables = await prisma.playerQuest.findMany({
    where: {
      userId,
      status: 'COMPLETED',
      quest: { isRepeatable: true },
    },
    include: { quest: true },
  });

  // Calculate the start of this week (Monday 00:00 UTC)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceMonday));
  const weekStartString = weekStart.toISOString().slice(0, 10);

  const idsToReset: string[] = [];

  for (const pq of completedRepeatables) {
    // Reset quests that were completed but never claimed (stuck forever)
    if (!pq.claimedAt) {
      idsToReset.push(pq.id);
      continue;
    }

    const claimedDateString = pq.claimedAt.toISOString().slice(0, 10);

    if (pq.quest.resetPeriod === 'daily' && claimedDateString < today) {
      idsToReset.push(pq.id);
    } else if (pq.quest.resetPeriod === 'weekly' && claimedDateString < weekStartString) {
      idsToReset.push(pq.id);
    }
  }

  if (idsToReset.length > 0) {
    await prisma.playerQuest.updateMany({
      where: { id: { in: idsToReset } },
      data: { status: 'AVAILABLE', progress: 0, claimedAt: null, completedAt: null },
    });
  }
}
