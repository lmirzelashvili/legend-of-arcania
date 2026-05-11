import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { ADVANCED_ABILITIES } from '../utils/ability-data.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import type { CharacterData } from '../types/index.js';
import { toJsonInput } from '../utils/prisma-json-helpers.js';

// ==================== ABILITIES ====================

export async function getAvailableAbilities(userId: string, characterId: string) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const learned = await prisma.characterAbility.findMany({ where: { characterId } });
  const learnedIds = new Set(learned.map(a => a.abilityId));

  return (ADVANCED_ABILITIES[char.class] || []).filter(a => !learnedIds.has(a.id));
}

export async function learnAbility(userId: string, characterId: string, abilityId: string): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const available = await getAvailableAbilities(userId, characterId);
  const ability = available.find(a => a.id === abilityId);
  if (!ability) throw new AppError(400, 'Ability not available');
  if (ability.unlockLevel > char.level) throw new AppError(400, `Requires level ${ability.unlockLevel}`);

  await prisma.$transaction(async (tx) => {
    // Fresh read inside transaction to prevent race condition
    const freshChar = await tx.character.findFirst({ where: { id: characterId, userId } });
    if (!freshChar || freshChar.abilityPoints < 1) {
      throw new AppError(400, 'Not enough ability points');
    }

    await tx.characterAbility.create({
      data: {
        characterId,
        abilityId: ability.id,
        abilityData: toJsonInput(ability),
        level: 1,
      },
    });

    await tx.character.update({
      where: { id: characterId },
      data: { abilityPoints: freshChar.abilityPoints - 1 },
    });
  });

  return loadFullCharacter(characterId);
}

export async function upgradeAbility(userId: string, characterId: string, abilityId: string): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const charAbility = await prisma.characterAbility.findFirst({
    where: { characterId, OR: [{ abilityId }, { id: abilityId }] },
  });
  if (!charAbility) throw new AppError(404, 'Ability not found');
  if (charAbility.level >= 5) throw new AppError(400, 'Ability already at max level');

  await prisma.$transaction(async (tx) => {
    // Fresh read inside transaction to prevent race condition
    const freshChar = await tx.character.findFirst({ where: { id: characterId, userId } });
    if (!freshChar || freshChar.abilityPoints < 1) {
      throw new AppError(400, 'Not enough ability points');
    }

    await tx.characterAbility.update({
      where: { id: charAbility.id },
      data: { level: charAbility.level + 1 },
    });

    await tx.character.update({
      where: { id: characterId },
      data: { abilityPoints: freshChar.abilityPoints - 1 },
    });
  });

  return loadFullCharacter(characterId);
}
