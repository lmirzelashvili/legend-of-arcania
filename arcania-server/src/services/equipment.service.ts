import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { findEmptySlot, EQUIPMENT_SLOT_MAP } from '../utils/inventory-helpers.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import type { ItemData, CharacterData } from '../types/index.js';
import { calculateBagCapacity } from '../types/index.js';
import { recalculateStats } from './character.service.js';
import { toItemData, toJsonInput } from '../utils/prisma-json-helpers.js';
import { publishEvent } from './event-bus.service.js';

// ==================== EQUIPMENT ====================

export async function equipItem(userId: string, characterId: string, itemId: string, slot: string): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  // Find item in inventory
  const invItem = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: itemId }, { itemId }] },
  });
  if (!invItem) throw new AppError(404, 'Item not found in inventory');

  const item = toItemData(invItem.itemData);

  if (item.requiredLevel > char.level) {
    throw new AppError(400, `Requires level ${item.requiredLevel}`);
  }
  if (item.requiredClass && item.requiredClass !== char.class) {
    throw new AppError(400, `This item is for ${item.requiredClass} only`);
  }

  const normalizedSlot = EQUIPMENT_SLOT_MAP[slot.toLowerCase()] || EQUIPMENT_SLOT_MAP[slot] || slot;

  // Check if something is already equipped in that slot
  const existingEquip = await prisma.equipmentSlotRow.findUnique({
    where: { characterId_slot: { characterId, slot: normalizedSlot } },
  });

  // Wrap the entire equip/swap in a transaction for atomicity
  await prisma.$transaction(async (tx) => {
    if (existingEquip) {
      // Move existing item to inventory
      const allInvItems = await tx.inventoryItem.findMany({ where: { characterId } });
      const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);
      const emptySlot = findEmptySlot(allInvItems, bagCapacity);
      if (!emptySlot) throw new AppError(400, 'Inventory is full — cannot swap equipment');

      await tx.inventoryItem.create({
        data: {
          characterId,
          itemId: existingEquip.itemId,
          itemData: toJsonInput(existingEquip.itemData),
          quantity: 1,
          gridX: emptySlot.x,
          gridY: emptySlot.y,
        },
      });

      await tx.equipmentSlotRow.delete({ where: { id: existingEquip.id } });
    }

    // Equip new item
    await tx.equipmentSlotRow.create({
      data: { characterId, slot: normalizedSlot, itemId: item.id, itemData: toJsonInput(item) },
    });

    // Remove from inventory
    await tx.inventoryItem.delete({ where: { id: invItem.id } });

    // Recalculate stats inside the transaction so a failure rolls everything back
    await recalculateStats(characterId, tx);
  });

  publishEvent('equipment.changed', { characterId }).catch(err =>
    console.warn('Event publish failed:', err)
  );

  return loadFullCharacter(characterId);
}

export async function unequipItem(userId: string, characterId: string, slot: string): Promise<CharacterData> {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const normalizedSlot = EQUIPMENT_SLOT_MAP[slot.toLowerCase()] || EQUIPMENT_SLOT_MAP[slot] || slot;

  const equippedRow = await prisma.equipmentSlotRow.findUnique({
    where: { characterId_slot: { characterId, slot: normalizedSlot } },
  });
  if (!equippedRow) throw new AppError(400, 'No item equipped in that slot');

  const allInvItems = await prisma.inventoryItem.findMany({ where: { characterId } });
  const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);
  const emptySlot = findEmptySlot(allInvItems, bagCapacity);
  if (!emptySlot) {
    throw new AppError(400, 'Inventory is full');
  }

  await prisma.$transaction(async (tx) => {
    // Re-verify inventory space inside the transaction (authoritative guard against races)
    const currentInvItems = await tx.inventoryItem.findMany({ where: { characterId } });
    const currentBagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);
    const currentEmptySlot = findEmptySlot(currentInvItems, currentBagCapacity);
    if (!currentEmptySlot) throw new AppError(400, 'Inventory is full');

    await tx.inventoryItem.create({
      data: {
        characterId,
        itemId: equippedRow.itemId,
        itemData: toJsonInput(equippedRow.itemData),
        quantity: 1,
        gridX: currentEmptySlot.x,
        gridY: currentEmptySlot.y,
      },
    });

    await tx.equipmentSlotRow.delete({ where: { id: equippedRow.id } });

    // Recalculate stats inside the transaction so a failure rolls everything back
    await recalculateStats(characterId, tx);
  });

  publishEvent('equipment.changed', { characterId }).catch(err =>
    console.warn('Event publish failed:', err)
  );

  return loadFullCharacter(characterId);
}
