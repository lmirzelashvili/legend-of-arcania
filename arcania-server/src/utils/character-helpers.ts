import prisma from '../config/db.js';
import type { Prisma } from '@prisma/client';
import type { CharacterData, ItemData, InventoryItemData, EquipmentData, CharacterAbilityData } from '../types/index.js';
import { calculateBagCapacity } from '../types/index.js';
import { SLOT_TO_EQUIPMENT_KEY } from './inventory-helpers.js';
import { toItemData, toAbilityData, toRace, toCharacterClass, toGender, toStatBlock, toDerivedStats, toPosition } from './prisma-json-helpers.js';

/**
 * Load a full character from DB and assemble the frontend-compatible shape.
 * This is the canonical "Character" response format matching the mock API.
 */
export async function loadFullCharacter(characterId: string): Promise<CharacterData> {
  const char = await prisma.character.findUniqueOrThrow({
    where: { id: characterId },
    include: {
      equipmentSlots: true,
      inventoryItems: true,
      abilities: true,
    },
  });

  // Build equipment object
  const equipment: EquipmentData = { id: characterId, characterId };
  for (const slot of char.equipmentSlots) {
    const key = SLOT_TO_EQUIPMENT_KEY[slot.slot];
    if (key) {
      (equipment as unknown as Record<string, unknown>)[key] = toItemData(slot.itemData);
    }
  }

  // Build inventory items
  const inventoryItems: InventoryItemData[] = char.inventoryItems.map(inv => ({
    id: inv.id,
    item: toItemData(inv.itemData),
    quantity: inv.quantity,
    gridX: inv.gridX,
    gridY: inv.gridY,
  }));

  // Build abilities
  const abilities: CharacterAbilityData[] = char.abilities.map(a => ({
    id: a.id,
    ability: toAbilityData(a.abilityData),
    level: a.level,
  }));

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
      id: characterId,
      characterId,
      items: inventoryItems,
      maxSlots: calculateBagCapacity(char.level, char.hasBattlePass),
    },
    equipment,
    abilities,
    unspentStatPoints: char.unspentStatPoints,
    abilityPoints: char.abilityPoints,
    hasBattlePass: char.hasBattlePass,
    createdAt: char.createdAt.toISOString(),
    lastLoginAt: char.lastLoginAt.toISOString(),
  };
}

/** Get equipped items as an array for stat calculation */
export async function getEquippedItemsArray(characterId: string, tx?: Prisma.TransactionClient): Promise<(ItemData | null)[]> {
  const client = tx ?? prisma;
  const slots = await client.equipmentSlotRow.findMany({ where: { characterId } });
  return slots.map(s => toItemData(s.itemData));
}
