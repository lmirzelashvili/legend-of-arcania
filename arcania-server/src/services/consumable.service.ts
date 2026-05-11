import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import type { ItemData } from '../types/index.js';
import { ItemType } from '../types/index.js';
import { toItemData, toJsonInput } from '../utils/prisma-json-helpers.js';
import { getTemplatesByType } from '../data/item-templates.js';

// ==================== CONSUMABLE ====================

export async function useConsumable(userId: string, characterId: string, inventoryItemId: string) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const invItem = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: inventoryItemId }, { itemId: inventoryItemId }] },
  });
  if (!invItem) throw new AppError(404, 'Item not found in inventory');

  const item = toItemData(invItem.itemData);
  if (item.type !== ItemType.CONSUMABLE) {
    throw new AppError(400, 'Item is not consumable');
  }

  // Look up the template to get consumeEffect (item.maxHp/maxMana are always 0 for consumables)
  const consumableTemplates = getTemplatesByType('CONSUMABLE');
  const template = consumableTemplates.find(t => t.name === item.name);
  const hpAmount = template?.consumeEffect?.hpRestore || item.maxHp || 0;
  const manaAmount = template?.consumeEffect?.manaRestore || item.maxMana || 0;

  const hpRestored = Math.min(hpAmount, char.maxHp - char.currentHp);
  const manaRestored = Math.min(manaAmount, char.maxMana - char.currentMana);

  const newHp = Math.min(char.maxHp, char.currentHp + hpAmount);
  const newMana = Math.min(char.maxMana, char.currentMana + manaAmount);

  await prisma.$transaction(async (tx) => {
    await tx.character.update({
      where: { id: characterId },
      data: {
        currentHp: newHp,
        currentMana: newMana,
      },
    });

    if (invItem.quantity > 1) {
      await tx.inventoryItem.update({
        where: { id: invItem.id },
        data: { quantity: invItem.quantity - 1 },
      });
    } else {
      await tx.inventoryItem.delete({ where: { id: invItem.id } });
    }
  });

  const updatedChar = await loadFullCharacter(characterId);
  return {
    character: updatedChar,
    effect: {
      itemName: item.name,
      hpRestored,
      manaRestored,
      newHp,
      newMana,
    },
  };
}

// ==================== SCROLL USAGE ====================

export async function useScroll(userId: string, characterId: string, inventoryItemId: string) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const invItem = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: inventoryItemId }, { itemId: inventoryItemId }] },
  });
  if (!invItem) throw new AppError(404, 'Scroll not found in inventory');

  const item = toItemData(invItem.itemData);
  if (item.type !== ItemType.CONSUMABLE) {
    throw new AppError(400, 'Item is not a consumable');
  }

  const itemName = (item.name || '').toLowerCase();
  let effectMessage = '';
  let positionUpdate: Record<string, unknown> | null = null;
  const charUpdateData: Record<string, unknown> = {};

  if (itemName.includes('teleportation')) {
    // Scroll of Teleportation — move to safe zone
    positionUpdate = { x: 0, y: 0, zoneType: 'SAFE' };
    effectMessage = 'Teleported to safe zone.';
  } else if (itemName.includes('resurrection')) {
    // Scroll of Resurrection — flag for death handler
    charUpdateData.hasResurrectionScroll = true;
    effectMessage = 'Resurrection scroll active. You will revive at your current location on next death.';
  } else if (itemName.includes('protection')) {
    // Scroll of Protection — prevent item destruction on enhancement failure (+11-15)
    charUpdateData.hasProtectionScroll = true;
    effectMessage = 'Protection scroll active. Your next enhancement failure (+11 to +15) will not destroy the item.';
  } else if (itemName.includes('empowerment')) {
    // Scroll of Empowerment — +10% enhancement success rate
    charUpdateData.enhancementBonus = 10;
    effectMessage = 'Empowerment scroll active. +10% success rate on your next enhancement attempt.';
  } else {
    throw new AppError(400, 'Unknown scroll type');
  }

  await prisma.$transaction(async (tx) => {
    // Update character (position and/or resource flags)
    if (positionUpdate) {
      charUpdateData.position = toJsonInput(positionUpdate);
    }
    await tx.character.update({
      where: { id: characterId },
      data: charUpdateData,
    });

    // Consume the scroll
    if (invItem.quantity > 1) {
      await tx.inventoryItem.update({
        where: { id: invItem.id },
        data: { quantity: invItem.quantity - 1 },
      });
    } else {
      await tx.inventoryItem.delete({ where: { id: invItem.id } });
    }
  });

  const updatedChar = await loadFullCharacter(characterId);
  return {
    success: true,
    message: effectMessage,
    character: updatedChar,
  };
}
