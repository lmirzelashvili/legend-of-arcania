import { AppError } from '../middleware/errors.js';
import { findEmptySlot } from './inventory-helpers.js';
import type { ItemData } from '../types/index.js';
import { toJsonInput } from './prisma-json-helpers.js';
import type { PrismaTransactionClient } from './prisma-json-helpers.js';

/**
 * Add a non-stackable item to a character's inventory inside a transaction.
 * Finds the first empty slot and creates the inventory row.
 */
export async function addItemToInventory(
  tx: PrismaTransactionClient,
  characterId: string,
  itemData: ItemData,
  quantity: number,
  bagCapacity: number
): Promise<void> {
  const currentItems = await tx.inventoryItem.findMany({ where: { characterId } });
  const slot = findEmptySlot(currentItems, bagCapacity);
  if (!slot) throw new AppError(400, 'Inventory is full');
  await tx.inventoryItem.create({
    data: {
      characterId,
      itemId: itemData.id,
      itemData: toJsonInput(itemData),
      quantity,
      gridX: slot.x,
      gridY: slot.y,
    },
  });
}
