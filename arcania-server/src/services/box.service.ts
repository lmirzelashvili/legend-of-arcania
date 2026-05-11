// Box Opening Service — Magic box system for random reward drops

import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import { findEmptySlot } from '../utils/inventory-helpers.js';
import { itemInstanceToItemData } from '../utils/item-adapter.js';
import { addItemToInventory } from '../utils/inventory-utils.js';
import { calculateBagCapacity, ItemRarity, ItemType } from '../types/index.js';
import type { ItemData, ItemInstance } from '../types/index.js';
import { toItemData } from '../utils/prisma-json-helpers.js';
import {
  getTemplatesByType,
  CRYSTAL_TEMPLATES,
  GEM_TEMPLATES,
} from '../data/item-templates.js';
import { rollFromTemplate } from './item-generator.service.js';
import { rollGem } from './gem.service.js';
import { randomUUID } from 'crypto';
import { BOX_TIERS, type BoxTierConfig } from '../config/balance/boxes.js';

// ==================== HELPERS ====================

function getBoxTier(itemName: string): BoxTierConfig | null {
  for (const key of Object.keys(BOX_TIERS)) {
    if (itemName.startsWith(key)) return BOX_TIERS[key];
  }
  return null;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Roll a single reward item based on box tier config. */
function rollRewardItem(config: BoxTierConfig): ItemData {
  const tier = randInt(config.itemTierMin, config.itemTierMax);

  // Chance to drop a crystal (Box of Ember)
  if (config.includeCrystals && Math.random() < 0.3) {
    const crystal = pickRandom(CRYSTAL_TEMPLATES);
    const instance = rollFromTemplate(crystal);
    return itemInstanceToItemData(instance);
  }

  // Chance to drop a gem (Box of Inferno)
  if (config.includeGems && Math.random() < 0.3 && GEM_TEMPLATES.length > 0) {
    const gemTemplate = pickRandom(GEM_TEMPLATES);
    const { stat, value, gemTemplate: gt } = rollGem(gemTemplate.id);
    const gemItem: ItemData = {
      id: randomUUID(),
      name: gt.name,
      description: `Provides +${value} ${stat} when socketed.`,
      type: ItemType.GEM,
      rarity: ItemRarity.REGULAR,
      requiredLevel: 0,
      stackable: false,
      maxStack: 1,
      sellPrice: gt.sellPrice,
      icon: gt.icon,
    };
    return gemItem;
  }

  // Chance to drop a consumable (Box of Ash)
  if (config.includeConsumables && Math.random() < 0.3) {
    const consumables = getTemplatesByType('CONSUMABLE');
    if (consumables.length > 0) {
      const template = pickRandom(consumables);
      const instance = rollFromTemplate(template);
      return itemInstanceToItemData(instance);
    }
  }

  // Roll equipment (armor, weapon, shield, or accessory) at the target tier
  const equipTemplates = Array.from(
    new Map(
      [
        ...getTemplatesByType('ARMOR'),
        ...getTemplatesByType('WEAPON'),
        ...getTemplatesByType('SHIELD'),
        ...getTemplatesByType('ACCESSORY'),
      ].map(t => [t.id, t])
    ).values()
  ).filter(t => t.tier === tier);

  if (equipTemplates.length === 0) {
    // Fallback: if no templates at this tier, use any equipment template with overridden tier
    const allEquip = [
      ...getTemplatesByType('ARMOR'),
      ...getTemplatesByType('WEAPON'),
      ...getTemplatesByType('SHIELD'),
    ];
    if (allEquip.length > 0) {
      const template = pickRandom(allEquip);
      const instance = rollFromTemplate(template, {
        tier,
        forcePrestige: config.prestigeChanceBonus > 0 && Math.random() < config.prestigeChanceBonus,
      });
      return itemInstanceToItemData(instance);
    }
    // Safety: no equipment templates exist at all — return a crystal as last resort
    const crystal = pickRandom(CRYSTAL_TEMPLATES);
    const instance = rollFromTemplate(crystal);
    return itemInstanceToItemData(instance);
  }

  const template = pickRandom(equipTemplates);
  const instance = rollFromTemplate(template, {
    forcePrestige: config.prestigeChanceBonus > 0 && Math.random() < config.prestigeChanceBonus,
  });
  return itemInstanceToItemData(instance);
}

// ==================== PUBLIC API ====================

export async function openBox(userId: string, characterId: string, inventoryItemId: string) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const invItem = await prisma.inventoryItem.findFirst({
    where: { characterId, OR: [{ id: inventoryItemId }, { itemId: inventoryItemId }] },
  });
  if (!invItem) throw new AppError(404, 'Item not found in inventory');

  const itemData = toItemData(invItem.itemData);
  const boxConfig = getBoxTier(itemData.name);
  if (!boxConfig) {
    throw new AppError(400, 'This item is not a magic box');
  }

  // Determine how many rewards to roll
  const rewardCount = randInt(boxConfig.minRewards, boxConfig.maxRewards);

  // Check bag capacity
  const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);
  const currentItems = await prisma.inventoryItem.findMany({ where: { characterId } });

  // Worst case: each reward needs its own slot (non-stackable equipment).
  // We subtract 1 because the box item itself will be consumed.
  const boxSlotFreed = invItem.quantity <= 1 ? 1 : 0;
  const availableSlots = bagCapacity - currentItems.length + boxSlotFreed;
  if (availableSlots < rewardCount) {
    throw new AppError(400, `Not enough inventory space. Need ${rewardCount} free slots, have ${availableSlots}.`);
  }

  // Roll all rewards
  const rewards: ItemData[] = [];
  for (let i = 0; i < rewardCount; i++) {
    rewards.push(rollRewardItem(boxConfig));
  }

  // Wrap everything in a transaction
  await prisma.$transaction(async (tx) => {
    // Consume the box
    if (invItem.quantity > 1) {
      await tx.inventoryItem.update({
        where: { id: invItem.id },
        data: { quantity: invItem.quantity - 1 },
      });
    } else {
      await tx.inventoryItem.delete({ where: { id: invItem.id } });
    }

    // Add reward items to inventory
    for (const reward of rewards) {
      const currentInv = await tx.inventoryItem.findMany({ where: { characterId } });

      // Check for stackable items that already exist
      if (reward.stackable) {
        const existing = currentInv.find(i => toItemData(i.itemData).name === reward.name);
        if (existing) {
          await tx.inventoryItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + 1 },
          });
          continue;
        }
      }

      await addItemToInventory(tx, characterId, reward, 1, bagCapacity);
    }
  });

  const updatedCharacter = await loadFullCharacter(characterId);

  return {
    success: true,
    boxName: boxConfig.name,
    rewards: rewards.map(r => ({ name: r.name, type: r.type, rarity: r.rarity })),
    rewardCount: rewards.length,
    updatedCharacter,
  };
}
