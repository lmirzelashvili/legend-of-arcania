import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';

// ==================== HELPERS ====================

interface PvPStatsRow {
  characterId: string;
  kills: number;
  deaths: number;
  killStreak: number;
  bestStreak: number;
  character: { name: string; class: string; level: number };
}

function mapPvPStats(s: PvPStatsRow) {
  const kdRatio = s.deaths > 0
    ? Math.round((s.kills / s.deaths) * 100) / 100
    : s.kills;

  return {
    characterId: s.characterId,
    characterName: s.character.name,
    characterClass: s.character.class,
    characterLevel: s.character.level,
    kills: s.kills,
    deaths: s.deaths,
    kdRatio,
    killStreak: s.killStreak,
    bestStreak: s.bestStreak,
  };
}

// ==================== RECORD KILL ====================

export async function recordKill(killerId: string, victimId: string) {
  if (killerId === victimId) {
    throw new AppError(400, 'Cannot record a self-kill');
  }

  // Ensure both characters exist
  const [killer, victim] = await Promise.all([
    prisma.character.findUnique({ where: { id: killerId }, select: { id: true, name: true } }),
    prisma.character.findUnique({ where: { id: victimId }, select: { id: true, name: true } }),
  ]);

  if (!killer) throw new AppError(404, 'Killer character not found');
  if (!victim) throw new AppError(404, 'Victim character not found');

  const killerStats = await prisma.$transaction(async (tx) => {
    // Upsert killer stats
    const stats = await tx.pvPStats.upsert({
      where: { characterId: killerId },
      create: { characterId: killerId, kills: 1, deaths: 0, killStreak: 1, bestStreak: 1 },
      update: {
        kills: { increment: 1 },
        killStreak: { increment: 1 },
      },
    });

    // Update bestStreak if current streak exceeds it
    if (stats.killStreak > stats.bestStreak) {
      await tx.pvPStats.update({
        where: { characterId: killerId },
        data: { bestStreak: stats.killStreak },
      });
    }

    // Upsert victim stats: increment deaths, reset killStreak
    await tx.pvPStats.upsert({
      where: { characterId: victimId },
      create: { characterId: victimId, kills: 0, deaths: 1, killStreak: 0, bestStreak: 0 },
      update: {
        deaths: { increment: 1 },
        killStreak: 0,
      },
    });

    return stats;
  });

  return {
    killer: killer.name,
    victim: victim.name,
    killerKills: killerStats.kills,
    killerStreak: killerStats.killStreak,
  };
}

// ==================== GET STATS ====================

export async function getStats(characterId: string) {
  let stats = await prisma.pvPStats.findUnique({
    where: { characterId },
    include: { character: { select: { name: true, class: true, level: true } } },
  });

  if (!stats) {
    stats = await prisma.pvPStats.create({
      data: { characterId, kills: 0, deaths: 0, killStreak: 0, bestStreak: 0 },
      include: { character: { select: { name: true, class: true, level: true } } },
    });
  }

  return mapPvPStats(stats);
}

// ==================== LEADERBOARD ====================

export async function getLeaderboard(
  sortBy: 'kills' | 'kd_ratio' | 'streak' = 'kills',
  limit: number = 20,
) {
  const stats = await prisma.pvPStats.findMany({
    include: { character: { select: { name: true, class: true, level: true } } },
  });

  const entries = stats.map(mapPvPStats);

  // Sort
  switch (sortBy) {
    case 'kd_ratio':
      entries.sort((a, b) => b.kdRatio - a.kdRatio);
      break;
    case 'streak':
      entries.sort((a, b) => b.bestStreak - a.bestStreak);
      break;
    case 'kills':
    default:
      entries.sort((a, b) => b.kills - a.kills);
      break;
  }

  return entries.slice(0, limit);
}

// ==================== SEASONS ====================

export async function getSeasons() {
  return prisma.pvPSeason.findMany({
    orderBy: { startDate: 'desc' },
  });
}

// ==================== RESET SEASON STATS ====================

export async function resetSeasonStats() {
  await prisma.pvPStats.updateMany({
    data: { kills: 0, deaths: 0, killStreak: 0, bestStreak: 0 },
  });
  return { message: 'All PvP stats have been reset for the new season' };
}
