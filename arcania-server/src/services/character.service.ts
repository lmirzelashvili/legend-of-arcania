import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { calculateBaseStats } from '../utils/game-constants.js';
import { calculateDerivedStats } from '../utils/stat-calculator.js';
import { STARTING_ABILITIES } from '../utils/ability-data.js';
import { getStarterItems, SLOT_TO_EQUIPMENT_KEY } from '../utils/inventory-helpers.js';
import { loadFullCharacter, getEquippedItemsArray } from '../utils/character-helpers.js';
import type { StatBlock, ItemData, CharacterData, EquipmentData } from '../types/index.js';
import { calculateBagCapacity } from '../types/index.js';
import type { Prisma } from '@prisma/client';
import { Race, CharacterClass, Gender } from '../types/index.js';
import { toStatBlock, toItemData, toRace, toCharacterClass, toGender, toDerivedStats, toPosition, toAbilityData, toJsonInput } from '../utils/prisma-json-helpers.js';
import { trackAchievement } from './quest.service.js';
import { publishEvent } from './event-bus.service.js';

// ==================== CREATE ====================

export async function createCharacter(userId: string, name: string, race: string, characterClass: string, gender: string = 'male'): Promise<CharacterData> {
  if (!name || name.length < 2 || name.length > 20) {
    throw new AppError(400, 'Character name must be between 2 and 20 characters');
  }

  // Validate limits BEFORE consuming token
  const existing = await prisma.character.findMany({ where: { userId } });
  if (existing.length >= 5) {
    throw new AppError(400, 'Maximum 5 characters allowed');
  }

  const nameTaken = existing.some(c => c.name.toLowerCase() === name.toLowerCase());
  if (nameTaken) {
    throw new AppError(400, 'Character name already taken');
  }

  // Global uniqueness check across all users
  const globalDuplicate = await prisma.character.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } },
  });
  if (globalDuplicate) {
    throw new AppError(400, 'Character name already taken');
  }

  // Pre-check creation token (non-authoritative — real decrement inside tx)
  const wallet = await prisma.accountWallet.findUnique({ where: { userId } });
  if (!wallet || wallet.creationTokens <= 0) {
    throw new AppError(400, 'No creation tokens available. Earn tokens from daily spins or purchase them.');
  }

  const primaryStats = calculateBaseStats(race as Race, characterClass as CharacterClass);
  const derivedStats = calculateDerivedStats(primaryStats, characterClass, 1, []);
  const starterItems = getStarterItems(characterClass);
  const startingAbilities = STARTING_ABILITIES[characterClass] || [];

  // Atomic: token decrement + character create + starter items + abilities
  const character = await prisma.$transaction(async (tx) => {
    // Re-read and decrement token inside transaction
    const freshWallet = await tx.accountWallet.findUnique({ where: { userId } });
    if (!freshWallet || freshWallet.creationTokens <= 0) {
      throw new AppError(400, 'No creation tokens available. Earn tokens from daily spins or purchase them.');
    }
    await tx.accountWallet.update({
      where: { userId },
      data: { creationTokens: freshWallet.creationTokens - 1 },
    });

    const newChar = await tx.character.create({
      data: {
        userId,
        name,
        race: race as Race,
        class: characterClass as CharacterClass,
        gender: gender === 'female' ? Gender.FEMALE : Gender.MALE,
        level: 1,
        experience: 0,
        primaryStats: toJsonInput(primaryStats),
        derivedStats: toJsonInput(derivedStats),
        currentHp: derivedStats.maxHp,
        maxHp: derivedStats.maxHp,
        currentMana: derivedStats.maxMana,
        maxMana: derivedStats.maxMana,
        gold: 1000,
        arcanite: 100,
        unspentStatPoints: 10,
        abilityPoints: 0,
      },
    });

    // Create starter inventory items
    await tx.inventoryItem.createMany({
      data: starterItems.map(si => ({
        characterId: newChar.id,
        itemId: si.itemData.id,
        itemData: toJsonInput(si.itemData),
        quantity: si.quantity,
        gridX: si.gridX,
        gridY: si.gridY,
      })),
    });

    // Create starting abilities
    if (startingAbilities.length > 0) {
      await tx.characterAbility.createMany({
        data: startingAbilities.map(ability => ({
          characterId: newChar.id,
          abilityId: ability.id,
          abilityData: toJsonInput(ability),
          level: 1,
        })),
      });
    }

    await trackAchievement(userId, 'characters_created', 1, tx);

    return newChar;
  });

  return loadFullCharacter(character.id);
}

// ==================== READ ====================

export async function getAllCharacters(userId: string): Promise<CharacterData[]> {
  const chars = await prisma.character.findMany({
    where: { userId },
    include: { equipmentSlots: true, inventoryItems: true, abilities: true },
  });

  return chars.map(char => {
    const equipment: EquipmentData = { id: char.id, characterId: char.id };
    for (const slot of char.equipmentSlots) {
      const key = SLOT_TO_EQUIPMENT_KEY[slot.slot];
      if (key) (equipment as unknown as Record<string, unknown>)[key] = toItemData(slot.itemData);
    }

    return {
      id: char.id,
      name: char.name,
      race: toRace(char.race),
      class: toCharacterClass(char.class),
      gender: toGender(char.gender),
      level: char.level,
      experience: char.experience,
      primaryStats: toStatBlock(char.primaryStats),
      derivedStats: toDerivedStats(char.derivedStats),
      resources: {
        currentHp: char.currentHp,
        maxHp: char.maxHp,
        currentMana: char.currentMana,
        maxMana: char.maxMana,
        gold: char.gold,
        arcanite: char.arcanite,
      },
      position: toPosition(char.position),
      inventory: {
        id: char.id,
        characterId: char.id,
        items: char.inventoryItems.map(inv => ({
          id: inv.id,
          item: toItemData(inv.itemData),
          quantity: inv.quantity,
          gridX: inv.gridX,
          gridY: inv.gridY,
        })),
        maxSlots: calculateBagCapacity(char.level, char.hasBattlePass),
      },
      equipment,
      abilities: char.abilities.map(a => ({
        id: a.id,
        ability: toAbilityData(a.abilityData),
        level: a.level,
      })),
      unspentStatPoints: char.unspentStatPoints,
      abilityPoints: char.abilityPoints,
      hasBattlePass: char.hasBattlePass,
      createdAt: char.createdAt.toISOString(),
      lastLoginAt: char.lastLoginAt.toISOString(),
    };
  });
}

export async function getCharacterById(userId: string, characterId: string): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');
  return loadFullCharacter(characterId);
}

export async function getCharacterStats(userId: string, characterId: string) {
  const char = await getCharacterById(userId, characterId);
  return {
    primaryStats: char.primaryStats,
    derivedStats: char.derivedStats,
    unspentStatPoints: char.unspentStatPoints,
  };
}

// ==================== DELETE ====================

export async function deleteCharacter(userId: string, characterId: string): Promise<void> {
  const char = await prisma.character.findFirst({
    where: { id: characterId, userId },
    include: { equipmentSlots: true, inventoryItems: true },
  });
  if (!char) throw new AppError(404, 'Character not found');

  // Transfer all items to vault then delete character — atomically
  await prisma.$transaction(async (tx) => {
    const vault = await tx.vault.findUnique({ where: { userId } });
    if (vault) {
      const vaultItems: Prisma.VaultItemCreateManyInput[] = [];

      // Equipment
      for (const slot of char.equipmentSlots) {
        vaultItems.push({
          vaultId: vault.id,
          itemId: slot.itemId,
          itemData: slot.itemData as Prisma.InputJsonValue,
          quantity: 1,
          depositedBy: characterId,
        });
      }

      // Inventory
      for (const inv of char.inventoryItems) {
        vaultItems.push({
          vaultId: vault.id,
          itemId: inv.itemId,
          itemData: inv.itemData as Prisma.InputJsonValue,
          quantity: inv.quantity,
          depositedBy: characterId,
        });
      }

      if (vaultItems.length > 0) {
        await tx.vaultItem.createMany({ data: vaultItems });
      }
    }

    await tx.character.delete({ where: { id: characterId } });
  });

  publishEvent('character.deleted', { characterId, userId }).catch(err =>
    console.warn('Event publish failed:', err)
  );
}

// ==================== STATS ====================

const VALID_STAT_KEYS = new Set(['strength', 'agility', 'intelligence', 'vitality', 'spirit']);

export async function updateStats(userId: string, characterId: string, stats: Partial<StatBlock>): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const currentStats = toStatBlock(char.primaryStats);

  // Validate: only allow known stat keys, positive integer values
  for (const [key, value] of Object.entries(stats)) {
    if (!VALID_STAT_KEYS.has(key)) {
      throw new AppError(400, `Invalid stat key: ${key}`);
    }
    if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
      throw new AppError(400, 'Stat values must be positive integers');
    }
  }

  const pointsToSpend = Object.values(stats).reduce((sum, val) => sum + (val || 0), 0);

  if (pointsToSpend > char.unspentStatPoints) {
    throw new AppError(400, 'Not enough stat points');
  }

  const newStats: StatBlock = { ...currentStats };
  for (const [key, value] of Object.entries(stats)) {
    if (value && VALID_STAT_KEYS.has(key)) {
      newStats[key as keyof StatBlock] += value;
    }
  }

  const equippedItems = await getEquippedItemsArray(characterId);
  const derivedStats = calculateDerivedStats(newStats, char.class, char.level, equippedItems);

  await prisma.character.update({
    where: { id: characterId },
    data: {
      primaryStats: toJsonInput(newStats),
      derivedStats: toJsonInput(derivedStats),
      maxHp: derivedStats.maxHp,
      maxMana: derivedStats.maxMana,
      unspentStatPoints: char.unspentStatPoints - pointsToSpend,
    },
  });

  return loadFullCharacter(characterId);
}

const RESPEC_ARCANITE_COST = 50;

export async function respecStats(
  userId: string,
  characterId: string,
): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  if (char.arcanite < RESPEC_ARCANITE_COST) {
    throw new AppError(400, `Not enough Arcanite (need ${RESPEC_ARCANITE_COST})`);
  }

  // Server calculates refunded points and base stats — never trust client
  const currentStats = toStatBlock(char.primaryStats);
  const raceClassBase = calculateBaseStats(toRace(char.race), toCharacterClass(char.class));
  const spentPoints =
    (currentStats.strength - raceClassBase.strength) +
    (currentStats.agility - raceClassBase.agility) +
    (currentStats.intelligence - raceClassBase.intelligence) +
    (currentStats.vitality - raceClassBase.vitality) +
    (currentStats.spirit - raceClassBase.spirit);

  const equippedItems = await getEquippedItemsArray(characterId);
  const derivedStats = calculateDerivedStats(raceClassBase, char.class, char.level, equippedItems);

  await prisma.character.update({
    where: { id: characterId },
    data: {
      primaryStats: toJsonInput(raceClassBase),
      derivedStats: toJsonInput(derivedStats),
      maxHp: derivedStats.maxHp,
      maxMana: derivedStats.maxMana,
      arcanite: { decrement: RESPEC_ARCANITE_COST },
      unspentStatPoints: char.unspentStatPoints + spentPoints,
    },
  });

  return loadFullCharacter(characterId);
}

// ==================== INVENTORY ====================

export async function moveInventoryItem(userId: string, characterId: string, itemId: string, _fromSlot: number, toSlot: number): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);
  if (toSlot < 0 || toSlot >= bagCapacity) {
    throw new AppError(400, 'Invalid inventory slot');
  }

  const invItem = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: itemId }, { itemId }] },
  });
  if (!invItem) throw new AppError(404, 'Item not found');

  const cols = 8;
  const targetX = toSlot % cols;
  const targetY = Math.floor(toSlot / cols);

  // Check for slot collision
  const allItems = await prisma.inventoryItem.findMany({ where: { characterId } });
  const occupier = allItems.find(i => i.id !== invItem.id && i.gridX === targetX && i.gridY === targetY);

  if (occupier) {
    // Swap positions
    await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: invItem.id },
        data: { gridX: targetX, gridY: targetY },
      }),
      prisma.inventoryItem.update({
        where: { id: occupier.id },
        data: { gridX: invItem.gridX, gridY: invItem.gridY },
      }),
    ]);
  } else {
    await prisma.inventoryItem.update({
      where: { id: invItem.id },
      data: { gridX: targetX, gridY: targetY },
    });
  }

  return loadFullCharacter(characterId);
}

// ==================== SELL TO NPC ====================

const SELL_PRICE_MULTIPLIER = 0.5; // Sell at 50% of item's sellPrice

export async function sellItem(
  userId: string,
  characterId: string,
  inventoryItemId: string,
  quantity: number = 1
): Promise<{ goldReceived: number; character: CharacterData }> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const invItem = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, characterId },
  });
  if (!invItem) throw new AppError(404, 'Item not found in inventory');

  const item = toItemData(invItem.itemData);
  const sellPrice = Math.floor((item.sellPrice || 0) * SELL_PRICE_MULTIPLIER);

  if (sellPrice <= 0) {
    throw new AppError(400, 'This item cannot be sold');
  }

  const sellQty = Math.min(quantity, invItem.quantity);
  const goldReceived = sellPrice * sellQty;

  await prisma.$transaction(async (tx) => {
    // Remove item or reduce quantity
    if (sellQty >= invItem.quantity) {
      await tx.inventoryItem.delete({ where: { id: invItem.id } });
    } else {
      await tx.inventoryItem.update({
        where: { id: invItem.id },
        data: { quantity: invItem.quantity - sellQty },
      });
    }

    // Add gold to character
    await tx.character.update({
      where: { id: characterId },
      data: { gold: { increment: goldReceived } },
    });

    await trackAchievement(userId, 'items_sold', 1, tx);
  });

  const character = await loadFullCharacter(characterId);

  return { goldReceived, character };
}

// ==================== INTERNAL HELPERS ====================

export async function recalculateStats(characterId: string, tx?: Prisma.TransactionClient): Promise<void> {
  const client = tx ?? prisma;
  const char = await client.character.findUniqueOrThrow({ where: { id: characterId } });
  const equippedItems = await getEquippedItemsArray(characterId, tx);
  const primaryStats = toStatBlock(char.primaryStats);
  const derivedStats = calculateDerivedStats(primaryStats, char.class, char.level, equippedItems);

  await client.character.update({
    where: { id: characterId },
    data: {
      derivedStats: toJsonInput(derivedStats),
      maxHp: derivedStats.maxHp,
      maxMana: derivedStats.maxMana,
    },
  });
}
