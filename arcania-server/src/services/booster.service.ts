import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { publishEvent } from './event-bus.service.js';

// ==================== BOOSTER CONFIG ====================

type BoosterType = 'xp' | 'gold' | 'combo' | 'mega';

interface BoosterConfig {
  xpBonus: number;
  goldBonus: number;
  durationHours: number;
  arcaniteCost: number;
}

const BOOSTER_CONFIG: Record<BoosterType, BoosterConfig> = {
  xp:    { xpBonus: 0.5, goldBonus: 0,    durationHours: 2, arcaniteCost: 100 },
  gold:  { xpBonus: 0,   goldBonus: 0.25, durationHours: 2, arcaniteCost: 100 },
  combo: { xpBonus: 0.5, goldBonus: 0.25, durationHours: 2, arcaniteCost: 150 },
  mega:  { xpBonus: 1.0, goldBonus: 0.5,  durationHours: 8, arcaniteCost: 400 },
};

const VALID_TYPES = new Set<string>(['xp', 'gold', 'combo', 'mega']);

// ==================== ACTIVATE BOOSTER ====================

export async function activateBooster(userId: string, type: BoosterType) {
  if (!VALID_TYPES.has(type)) {
    throw new AppError(400, `Invalid booster type: ${type}`);
  }

  const config = BOOSTER_CONFIG[type];

  // Deduct arcanite from the user's vault
  const vault = await prisma.vault.findUnique({ where: { userId } });
  if (!vault) throw new AppError(404, 'Vault not found. Create a character first.');
  if (vault.arcanite < config.arcaniteCost) {
    throw new AppError(400, `Not enough Arcanite. Need ${config.arcaniteCost}, have ${vault.arcanite}`);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.durationHours * 60 * 60 * 1000);

  const [booster] = await prisma.$transaction([
    prisma.activeBooster.create({
      data: {
        userId,
        type,
        xpBonus: config.xpBonus,
        goldBonus: config.goldBonus,
        activatedAt: now,
        expiresAt,
      },
    }),
    prisma.vault.update({
      where: { userId },
      data: { arcanite: vault.arcanite - config.arcaniteCost },
    }),
  ]);

  publishEvent('booster.activated', {
    userId,
    type,
    xpBonus: config.xpBonus,
    goldBonus: config.goldBonus,
    expiresAt: expiresAt.toISOString(),
  }).catch(err => console.warn('Event publish failed:', err));

  return {
    id: booster.id,
    type: booster.type,
    xpBonus: booster.xpBonus,
    goldBonus: booster.goldBonus,
    activatedAt: booster.activatedAt.toISOString(),
    expiresAt: booster.expiresAt.toISOString(),
    cost: config.arcaniteCost,
  };
}

// ==================== GET ACTIVE BOOSTERS ====================

export async function getActiveBoosters(userId: string) {
  const now = new Date();
  const boosters = await prisma.activeBooster.findMany({
    where: { userId, expiresAt: { gt: now } },
    orderBy: { expiresAt: 'asc' },
  });

  return boosters.map(b => ({
    id: b.id,
    type: b.type,
    xpBonus: b.xpBonus,
    goldBonus: b.goldBonus,
    activatedAt: b.activatedAt.toISOString(),
    expiresAt: b.expiresAt.toISOString(),
  }));
}

// ==================== GET BONUSES ====================

export async function getBonuses(userId: string) {
  const now = new Date();
  const boosters = await prisma.activeBooster.findMany({
    where: { userId, expiresAt: { gt: now } },
  });

  let totalXpBonus = 0;
  let totalGoldBonus = 0;

  for (const b of boosters) {
    totalXpBonus += b.xpBonus;
    totalGoldBonus += b.goldBonus;
  }

  return { totalXpBonus, totalGoldBonus };
}

// ==================== CLEANUP EXPIRED ====================

export async function cleanupExpired(userId: string) {
  const now = new Date();
  const result = await prisma.activeBooster.deleteMany({
    where: { userId, expiresAt: { lte: now } },
  });
  return { deletedCount: result.count };
}
