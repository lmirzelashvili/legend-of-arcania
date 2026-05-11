import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import { rollItemInstance } from './item-generator.service.js';
import { itemInstanceToItemData } from '../utils/item-adapter.js';
import { addItemToInventory } from '../utils/inventory-utils.js';
import { trackAchievement } from './quest.service.js';
import { recordKill } from './pvp.service.js';
import { getActiveBoosters } from './booster.service.js';
import { recalculateStats } from './character.service.js';
import { publishEvent } from './event-bus.service.js';
import { xpRequiredForLevel, statPointsForLevelUp, MAX_LEVEL } from '../utils/game-constants.js';
import { calculateBagCapacity } from '../types/index.js';

// ==================== XP AWARD ====================

export async function awardXp(characterId: string, xp: number) {
  const char = await prisma.character.findUnique({ where: { id: characterId } });
  if (!char) throw new AppError(404, 'Character not found');

  let newLevel = char.level;
  let newExperience = char.experience + xp;
  let bonusStatPoints = 0;
  let bonusAbilityPoints = 0;

  while (newLevel < MAX_LEVEL && newExperience >= xpRequiredForLevel(newLevel)) {
    newExperience -= xpRequiredForLevel(newLevel);
    newLevel++;
    bonusStatPoints += statPointsForLevelUp(newLevel);
    bonusAbilityPoints += 1;
  }
  if (newLevel >= MAX_LEVEL) {
    newExperience = 0;
  }

  const levelsGained = newLevel - char.level;

  await prisma.character.update({
    where: { id: characterId },
    data: {
      level: newLevel,
      experience: newExperience,
      unspentStatPoints: char.unspentStatPoints + bonusStatPoints,
      abilityPoints: char.abilityPoints + bonusAbilityPoints,
    },
  });

  // Recalculate derived stats if leveled up
  if (levelsGained > 0) {
    await recalculateStats(characterId);
    publishEvent('character.levelup', { characterId, newLevel, levelsGained }).catch(err =>
      console.warn('Event publish failed:', err)
    );
  }

  return {
    characterId,
    xpAwarded: xp,
    newLevel,
    newExperience,
    levelsGained,
    statPointsAwarded: bonusStatPoints,
    abilityPointsAwarded: bonusAbilityPoints,
  };
}

// ==================== LOOT TO INVENTORY ====================

export async function lootToInventory(characterId: string, itemTemplateId: string, quantity: number) {
  const char = await prisma.character.findUnique({ where: { id: characterId } });
  if (!char) throw new AppError(404, 'Character not found');

  const instance = rollItemInstance(itemTemplateId);
  const itemData = itemInstanceToItemData(instance);
  const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);

  await prisma.$transaction(async (tx) => {
    await addItemToInventory(tx, characterId, itemData, quantity, bagCapacity);
    await trackAchievement(char.userId, 'items_looted', 1, tx);
  });

  return {
    characterId,
    item: itemData,
    quantity,
  };
}

// ==================== QUEST TRACK ====================

export async function questTrack(userId: string, trackingKey: string, incrementBy: number) {
  const updated = await trackAchievement(userId, trackingKey, incrementBy);
  return { updated };
}

// ==================== CHARACTER LOADOUT ====================

export async function getCharacterLoadout(characterId: string) {
  const char = await prisma.character.findUnique({ where: { id: characterId } });
  if (!char) throw new AppError(404, 'Character not found');

  const character = await loadFullCharacter(characterId);
  const boosters = await getActiveBoosters(char.userId);

  return {
    character,
    activeBoosters: boosters,
  };
}

// ==================== COMBAT RESULT ====================

export async function processCombatResult(payload: {
  type: string;
  killerId?: string;
  victimId?: string;
  characterId?: string;
}) {
  const { type, killerId, victimId, characterId } = payload;

  switch (type) {
    case 'pvp_kill': {
      if (!killerId || !victimId) {
        throw new AppError(400, 'killerId and victimId are required for pvp_kill');
      }
      const result = await recordKill(killerId, victimId);

      // Track PvP quest progress for killer
      const killer = await prisma.character.findUnique({ where: { id: killerId }, select: { userId: true } });
      if (killer) {
        trackAchievement(killer.userId, 'pvp_kills', 1).catch(err =>
          console.warn('Achievement tracking failed:', err)
        );
      }

      publishEvent('combat.pvp_kill', { killerId, victimId }).catch(err =>
        console.warn('Event publish failed:', err)
      );

      return { type: 'pvp_kill', ...result };
    }

    case 'pve_kill': {
      const targetCharId = characterId || killerId;
      if (!targetCharId) {
        throw new AppError(400, 'characterId or killerId is required for pve_kill');
      }

      const char = await prisma.character.findUnique({ where: { id: targetCharId }, select: { userId: true } });
      if (char) {
        trackAchievement(char.userId, 'monsters_killed', 1).catch(err =>
          console.warn('Achievement tracking failed:', err)
        );
      }

      publishEvent('combat.pve_kill', { characterId: targetCharId }).catch(err =>
        console.warn('Event publish failed:', err)
      );

      return { type: 'pve_kill', characterId: targetCharId };
    }

    case 'death': {
      const deadCharId = characterId || victimId;
      if (!deadCharId) {
        throw new AppError(400, 'characterId or victimId is required for death');
      }

      publishEvent('combat.death', { characterId: deadCharId }).catch(err =>
        console.warn('Event publish failed:', err)
      );

      return { type: 'death', characterId: deadCharId };
    }

    default:
      throw new AppError(400, `Unknown combat result type: ${type}`);
  }
}
