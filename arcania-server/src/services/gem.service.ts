// Gem Service — server-side gem rolling and socket management

import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import type { ItemInstance, DerivedStatKey, SocketSlot, ItemData } from '../types/index.js';
import { toItemData, toMutableItemData, toJsonInput } from '../utils/prisma-json-helpers.js';
import { GEM_TEMPLATES, GemTemplateData } from '../data/item-templates.js';
import { computeEffectiveStats } from './item-generator.service.js';

function roundStat(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function rollGem(gemTemplateId: string): { stat: DerivedStatKey; value: number; gemTemplate: GemTemplateData } {
  const template = GEM_TEMPLATES.find(g => g.id === gemTemplateId);
  if (!template) throw new Error(`Unknown gem template: ${gemTemplateId}`);

  const stats = Object.keys(template.statRanges) as DerivedStatKey[];
  const stat = stats[Math.floor(Math.random() * stats.length)];
  const range = template.statRanges[stat]!;
  const value = roundStat(range.min + Math.random() * (range.max - range.min));

  return { stat, value, gemTemplate: template };
}

export function insertGem(
  item: ItemInstance,
  socketIndex: number,
  gemInstanceId: string,
  gemName: string,
  gemStat: DerivedStatKey,
  gemValue: number
): ItemInstance {
  if (socketIndex < 0 || socketIndex >= item.sockets.length) {
    throw new Error(`Invalid socket index ${socketIndex}`);
  }
  if (item.sockets[socketIndex].gemId !== null) {
    throw new Error('Socket is not empty');
  }

  const newSockets: SocketSlot[] = item.sockets.map((s, i) => {
    if (i === socketIndex) {
      return { gemId: gemInstanceId, gemName, gemStat, gemValue };
    }
    return { ...s };
  });

  const updated: ItemInstance = { ...item, sockets: newSockets, effectiveStats: {} };
  updated.effectiveStats = computeEffectiveStats(updated);
  return updated;
}

export function removeGem(item: ItemInstance, socketIndex: number): ItemInstance {
  if (socketIndex < 0 || socketIndex >= item.sockets.length) {
    throw new Error(`Invalid socket index ${socketIndex}`);
  }
  if (item.sockets[socketIndex].gemId === null) {
    throw new Error('Socket is already empty');
  }

  const newSockets: SocketSlot[] = item.sockets.map((s, i) => {
    if (i === socketIndex) return { gemId: null };
    return { ...s };
  });

  const updated: ItemInstance = { ...item, sockets: newSockets, effectiveStats: {} };
  updated.effectiveStats = computeEffectiveStats(updated);
  return updated;
}

// ==================== GEM SOCKETING (character inventory) ====================

export async function socketGem(
  userId: string,
  characterId: string,
  targetItemId: string,
  gemItemId: string,
  socketIndex: number
) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const targetInv = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: targetItemId }, { itemId: targetItemId }] },
  });
  if (!targetInv) throw new AppError(404, 'Target item not found in inventory');

  const gemInv = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: gemItemId }, { itemId: gemItemId }] },
  });
  if (!gemInv) throw new AppError(404, 'Gem not found in inventory');

  const targetItemData = toMutableItemData(targetInv.itemData);
  const gemItemData = toItemData(gemInv.itemData);

  if (gemItemData.type !== 'GEM') throw new AppError(400, 'Selected item is not a gem');
  if (!gemItemData.gemStat || !gemItemData.gemValue) throw new AppError(400, 'Invalid gem data');

  // Check sockets exist on the target
  // ItemData doesn't have sockets, but we can store them in the JSON
  const sockets = (targetItemData.sockets || []) as { gemId: string | null; gemName?: string; gemStat?: string; gemValue?: number }[];
  if (socketIndex < 0 || socketIndex >= sockets.length) {
    throw new AppError(400, `Invalid socket index. Item has ${sockets.length} socket(s).`);
  }
  if (sockets[socketIndex]?.gemId) {
    throw new AppError(400, 'Socket is already occupied');
  }

  // Insert gem into socket
  sockets[socketIndex] = {
    gemId: gemItemData.id,
    gemName: gemItemData.name,
    gemStat: gemItemData.gemStat,
    gemValue: gemItemData.gemValue,
  };

  // Add gem stat to item's stats
  const statKey = gemItemData.gemStat;
  targetItemData[statKey] = ((targetItemData[statKey] as number) || 0) + gemItemData.gemValue;
  targetItemData.sockets = sockets;

  await prisma.$transaction(async (tx) => {
    await tx.inventoryItem.update({
      where: { id: targetInv.id },
      data: { itemData: toJsonInput(targetItemData) },
    });

    // Remove gem from inventory
    if (gemInv.quantity > 1) {
      await tx.inventoryItem.update({
        where: { id: gemInv.id },
        data: { quantity: gemInv.quantity - 1 },
      });
    } else {
      await tx.inventoryItem.delete({ where: { id: gemInv.id } });
    }
  });

  const updatedCharacter = await loadFullCharacter(characterId);
  return {
    success: true,
    message: `Socketed ${gemItemData.name} into ${targetItemData.name}`,
    updatedCharacter,
  };
}

export async function unsocketGem(
  userId: string,
  characterId: string,
  targetItemId: string,
  socketIndex: number
) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const targetInv = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: targetItemId }, { itemId: targetItemId }] },
  });
  if (!targetInv) throw new AppError(404, 'Target item not found in inventory');

  const targetItemData = toMutableItemData(targetInv.itemData);
  const sockets = (targetItemData.sockets || []) as { gemId: string | null; gemStat?: string; gemValue?: number }[];

  if (socketIndex < 0 || socketIndex >= sockets.length) {
    throw new AppError(400, 'Invalid socket index');
  }
  if (!sockets[socketIndex]?.gemId) {
    throw new AppError(400, 'Socket is already empty');
  }

  // Require Hand of Blacksmith material
  const materialInv = await prisma.inventoryItem.findFirst({
    where: {
      characterId,
      itemData: { path: ['name'], equals: 'Hand of Blacksmith' },
    },
  });
  if (!materialInv) {
    throw new AppError(400, 'Requires Hand of Blacksmith material to unsocket gems');
  }

  // Remove gem stat from item
  const gemStat = sockets[socketIndex].gemStat;
  const gemValue = sockets[socketIndex].gemValue;
  if (gemStat && gemValue) {
    targetItemData[gemStat] = Math.max(0, ((targetItemData[gemStat] as number) || 0) - gemValue);
    if (targetItemData[gemStat] === 0) delete targetItemData[gemStat];
  }

  // Clear socket (gem is destroyed)
  sockets[socketIndex] = { gemId: null };
  targetItemData.sockets = sockets;

  await prisma.$transaction(async (tx) => {
    // Consume 1x Hand of Blacksmith
    if (materialInv.quantity > 1) {
      await tx.inventoryItem.update({
        where: { id: materialInv.id },
        data: { quantity: materialInv.quantity - 1 },
      });
    } else {
      await tx.inventoryItem.delete({ where: { id: materialInv.id } });
    }

    // Update the target item socket
    await tx.inventoryItem.update({
      where: { id: targetInv.id },
      data: { itemData: toJsonInput(targetItemData) },
    });
  });

  const updatedCharacter = await loadFullCharacter(characterId);
  return {
    success: true,
    message: 'Gem removed and destroyed.',
    updatedCharacter,
  };
}
