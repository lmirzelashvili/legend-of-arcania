import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import type { ItemData } from '../types/index.js';
import { toItemData, toJsonInput } from '../utils/prisma-json-helpers.js';
import {
  ENHANCEMENT_SUCCESS_RATES,
  getEnhanceFailureResult,
  getRequiredCrystal,
  getEnhancementBonusPercent,
} from '../data/item-templates.js';

// ==================== ENHANCEMENT ====================

const ENHANCEABLE_TYPES = ['WEAPON', 'ARMOR', 'SHIELD', 'ACCESSORY'];
const ENHANCEMENT_STAT_KEYS = [
  'physicalAttack', 'magicAttack', 'physicalDefense', 'magicResistance',
  'maxHp', 'maxMana', 'criticalChance', 'criticalDamage',
  'attackSpeed', 'armorPenetration', 'magicPenetration',
  'hpRegen', 'manaRegen', 'movementSpeed',
];

export function applyEnhancementToItemData(itemData: ItemData, newLevel: number): ItemData {
  const currentLevel = itemData.enhancementLevel || 0;
  const oldMultiplier = 1 + getEnhancementBonusPercent(currentLevel) / 100;
  const newMultiplier = 1 + getEnhancementBonusPercent(newLevel) / 100;
  const ratio = newMultiplier / oldMultiplier;

  const updated = { ...itemData } as Record<string, unknown>;
  for (const key of ENHANCEMENT_STAT_KEYS) {
    const val = (itemData as unknown as Record<string, unknown>)[key];
    if (val && typeof val === 'number') {
      updated[key] = Math.round(val * ratio * 10) / 10;
    }
  }

  updated.enhancementLevel = newLevel;
  const baseName = (itemData.name || '').replace(/\s*\+\d+$/, '');
  updated.name = newLevel > 0 ? `${baseName} +${newLevel}` : baseName;

  return updated as unknown as ItemData;
}

export async function enhanceInventoryItem(
  userId: string,
  characterId: string,
  targetItemId: string,
  crystalItemId: string
) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const targetInv = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: targetItemId }, { itemId: targetItemId }] },
  });
  if (!targetInv) throw new AppError(404, 'Target item not found in inventory');

  const crystalInv = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: crystalItemId }, { itemId: crystalItemId }] },
  });
  if (!crystalInv) throw new AppError(404, 'Crystal not found in inventory');

  if (targetInv.id === crystalInv.id) throw new AppError(400, 'Cannot use the same item as both target and crystal');

  const targetItemData = toItemData(targetInv.itemData);
  const crystalItemData = toItemData(crystalInv.itemData);

  if (!ENHANCEABLE_TYPES.includes(targetItemData.type as string)) {
    throw new AppError(400, 'This item cannot be enhanced');
  }

  // Prevent enhancement of items that have an active marketplace listing
  const activeListing = await prisma.marketplaceListing.findFirst({
    where: { sellerId: userId, source: 'player', itemId: targetInv.itemId },
    select: { id: true },
  });
  if (activeListing) {
    throw new AppError(400, 'Cannot enhance an item that is listed on the marketplace');
  }

  const currentLevel = targetItemData.enhancementLevel || 0;
  const targetLevel = currentLevel + 1;
  if (targetLevel > 15) throw new AppError(400, 'Item is already at maximum enhancement (+15)');

  const requiredCrystal = getRequiredCrystal(targetLevel);
  const crystalId = crystalItemData.id || '';
  const crystalName = crystalItemData.name || '';
  const isSpiritCrystal = crystalId.includes('spirit') || crystalName.includes('Spirit');
  const actualCrystalType = isSpiritCrystal ? 'spirit' : 'dominion';

  if (actualCrystalType !== requiredCrystal) {
    const needed = requiredCrystal === 'spirit' ? 'Crystal of Spirit' : 'Crystal of Dominion';
    throw new AppError(400, `Enhancement to +${targetLevel} requires ${needed}`);
  }

  // Check for Scroll of Empowerment bonus
  let successRate = ENHANCEMENT_SUCCESS_RATES[targetLevel] ?? 0;
  let usedEmpowerment = false;
  if (char.enhancementBonus && char.enhancementBonus > 0) {
    successRate = Math.min(1, successRate + char.enhancementBonus / 100);
    usedEmpowerment = true;
  }

  // Check for Scroll of Protection
  const hasProtection = char.hasProtectionScroll;

  const roll = Math.random();

  if (roll < successRate) {
    const updatedItemData = applyEnhancementToItemData(targetItemData, targetLevel);
    await prisma.$transaction(async (tx) => {
      // Consume crystal
      if (crystalInv.quantity > 1) {
        await tx.inventoryItem.update({
          where: { id: crystalInv.id },
          data: { quantity: crystalInv.quantity - 1 },
        });
      } else {
        await tx.inventoryItem.delete({ where: { id: crystalInv.id } });
      }
      // Clear scroll flags
      if (usedEmpowerment || hasProtection) {
        await tx.character.update({
          where: { id: characterId },
          data: {
            ...(usedEmpowerment ? { enhancementBonus: 0 } : {}),
            ...(hasProtection ? { hasProtectionScroll: false } : {}),
          },
        });
      }
      // Upgrade item
      await tx.inventoryItem.update({
        where: { id: targetInv.id },
        data: { itemData: toJsonInput(updatedItemData), itemId: updatedItemData.id },
      });
    });
    const updatedCharacter = await loadFullCharacter(characterId);
    return {
      success: true, newLevel: targetLevel, failureResult: null,
      itemDestroyed: false, updatedCharacter,
      message: `Enhancement succeeded! Item is now +${targetLevel}`,
    };
  }

  const failure = getEnhanceFailureResult(targetLevel);

  if (failure.result === 'crystal_consumed') {
    await prisma.$transaction(async (tx) => {
      // Consume crystal
      if (crystalInv.quantity > 1) {
        await tx.inventoryItem.update({
          where: { id: crystalInv.id },
          data: { quantity: crystalInv.quantity - 1 },
        });
      } else {
        await tx.inventoryItem.delete({ where: { id: crystalInv.id } });
      }
      // Clear scroll flags
      if (usedEmpowerment || hasProtection) {
        await tx.character.update({
          where: { id: characterId },
          data: {
            ...(usedEmpowerment ? { enhancementBonus: 0 } : {}),
            ...(hasProtection ? { hasProtectionScroll: false } : {}),
          },
        });
      }
    });
    const updatedCharacter = await loadFullCharacter(characterId);
    return {
      success: false, newLevel: currentLevel, failureResult: 'crystal_consumed',
      itemDestroyed: false, updatedCharacter,
      message: 'Enhancement failed. Crystal was consumed.',
    };
  }

  if (failure.result === 'level_drop') {
    const updatedItemData = applyEnhancementToItemData(targetItemData, failure.dropTo!);
    await prisma.$transaction(async (tx) => {
      // Consume crystal
      if (crystalInv.quantity > 1) {
        await tx.inventoryItem.update({
          where: { id: crystalInv.id },
          data: { quantity: crystalInv.quantity - 1 },
        });
      } else {
        await tx.inventoryItem.delete({ where: { id: crystalInv.id } });
      }
      // Clear scroll flags
      if (usedEmpowerment || hasProtection) {
        await tx.character.update({
          where: { id: characterId },
          data: {
            ...(usedEmpowerment ? { enhancementBonus: 0 } : {}),
            ...(hasProtection ? { hasProtectionScroll: false } : {}),
          },
        });
      }
      // Drop item level
      await tx.inventoryItem.update({
        where: { id: targetInv.id },
        data: { itemData: toJsonInput(updatedItemData), itemId: updatedItemData.id },
      });
    });
    const updatedCharacter = await loadFullCharacter(characterId);
    return {
      success: false, newLevel: failure.dropTo!, failureResult: 'level_drop',
      itemDestroyed: false, updatedCharacter,
      message: `Enhancement failed! Item dropped to +${failure.dropTo}`,
    };
  }

  // Destroyed — but Protection scroll prevents destruction at +11 to +15
  if (hasProtection && targetLevel >= 11 && targetLevel <= 15) {
    // Protection scroll saves the item — drop level instead of destroying
    const dropTo = 5; // Same as level_drop fallback
    const updatedItemData = applyEnhancementToItemData(targetItemData, dropTo);
    await prisma.$transaction(async (tx) => {
      // Consume crystal
      if (crystalInv.quantity > 1) {
        await tx.inventoryItem.update({
          where: { id: crystalInv.id },
          data: { quantity: crystalInv.quantity - 1 },
        });
      } else {
        await tx.inventoryItem.delete({ where: { id: crystalInv.id } });
      }
      // Clear scroll flags
      await tx.character.update({
        where: { id: characterId },
        data: {
          ...(usedEmpowerment ? { enhancementBonus: 0 } : {}),
          hasProtectionScroll: false,
        },
      });
      // Drop item level
      await tx.inventoryItem.update({
        where: { id: targetInv.id },
        data: { itemData: toJsonInput(updatedItemData), itemId: updatedItemData.id },
      });
    });
    const updatedCharacter = await loadFullCharacter(characterId);
    return {
      success: false, newLevel: dropTo, failureResult: 'level_drop',
      itemDestroyed: false, updatedCharacter,
      message: `Enhancement failed! Protection scroll saved your item. Item dropped to +${dropTo}.`,
    };
  }

  await prisma.$transaction(async (tx) => {
    // Consume crystal
    if (crystalInv.quantity > 1) {
      await tx.inventoryItem.update({
        where: { id: crystalInv.id },
        data: { quantity: crystalInv.quantity - 1 },
      });
    } else {
      await tx.inventoryItem.delete({ where: { id: crystalInv.id } });
    }
    // Clear scroll flags
    if (usedEmpowerment || hasProtection) {
      await tx.character.update({
        where: { id: characterId },
        data: {
          ...(usedEmpowerment ? { enhancementBonus: 0 } : {}),
          ...(hasProtection ? { hasProtectionScroll: false } : {}),
        },
      });
    }
    // Destroy item
    await tx.inventoryItem.delete({ where: { id: targetInv.id } });
  });
  const updatedCharacter = await loadFullCharacter(characterId);
  return {
    success: false, newLevel: 0, failureResult: 'destroyed',
    itemDestroyed: true, updatedCharacter,
    message: 'Enhancement failed! Item was destroyed.',
  };
}
