import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import { findEmptySlot } from '../utils/inventory-helpers.js';
import { itemInstanceToItemData } from '../utils/item-adapter.js';
import { addItemToInventory } from '../utils/inventory-utils.js';
import type { VendorDefinitionData, VendorItemData, ItemData, ItemInstance, DerivedStatKey } from '../types/index.js';
import { ItemType, ItemRarity, calculateBagCapacity } from '../types/index.js';
import type { Character } from '@prisma/client';
import { toItemData } from '../utils/prisma-json-helpers.js';
import { getAllItemTemplates, ItemTemplate, GEM_TEMPLATES } from '../data/item-templates.js';
import { rollFromTemplate, rollItemInstance } from './item-generator.service.js';
import { rollGem } from './gem.service.js';
import { randomUUID } from 'crypto';
import { formatStatName } from '../utils/format-helpers.js';

// ==================== GEM PURCHASE HELPER ====================

function rollGemItemData(gemTemplateId: string): ItemData {
  const { stat, value, gemTemplate } = rollGem(gemTemplateId);
  return {
    id: randomUUID(),
    name: gemTemplate.name,
    description: `Provides +${value} ${formatStatName(stat)} when socketed.`,
    type: ItemType.GEM,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 0,
    stackable: false,
    maxStack: 1,
    sellPrice: gemTemplate.sellPrice,
    gemTemplateId: gemTemplate.id,
    gemStat: stat,
    gemValue: value,
    icon: gemTemplate.icon,
  };
}

// ==================== TEMPLATE → VENDOR ITEM ====================

function templateToVendorItem(template: ItemTemplate, category: string): VendorItemData {
  const displayInstance = rollFromTemplate(template);
  const displayItem = itemInstanceToItemData(displayInstance);
  return {
    id: `vendor_${template.id}`,
    templateId: template.id,
    item: displayItem,
    name: template.name,
    description: template.description,
    category,
    price: template.sellPrice * 2,
    currency: 'gold',
    requiredLevel: template.requiredLevel,
    stock: 'unlimited',
  };
}

// ==================== BLACKSMITH ====================

function getBlacksmithVendor(): VendorDefinitionData {
  const items: VendorItemData[] = [];
  const templates = getAllItemTemplates();

  for (const template of templates.values()) {
    switch (template.type) {
      case 'WEAPON':
        items.push(templateToVendorItem(template, 'Weapons'));
        break;
      case 'ARMOR': {
        const slot = template.slot;
        if (slot === 'WINGS' || slot === 'CAPE') {
          items.push(templateToVendorItem(template, 'Accessories'));
        } else {
          items.push(templateToVendorItem(template, 'Armor'));
        }
        break;
      }
      case 'SHIELD':
        items.push(templateToVendorItem(template, 'Shields'));
        break;
      case 'ACCESSORY':
        items.push(templateToVendorItem(template, 'Accessories'));
        break;
    }
  }

  return {
    id: 'blacksmith',
    name: 'Blacksmith',
    title: 'Master Blacksmith',
    description: 'Weapons, armor, and shields for all classes. Forged with care.',
    currency: 'gold',
    categories: ['Weapons', 'Armor', 'Shields', 'Accessories'],
    items,
  };
}

// ==================== ALCHEMIST ====================

function getAlchemistVendor(): VendorDefinitionData {
  const items: VendorItemData[] = [];
  const templates = getAllItemTemplates();

  for (const template of templates.values()) {
    if (template.type !== 'CONSUMABLE') continue;

    if (template.id.startsWith('elixir_')) {
      items.push(templateToVendorItem(template, 'Elixirs'));
    } else if (template.id.startsWith('potion_')) {
      items.push(templateToVendorItem(template, 'Potions'));
    } else if (template.id.startsWith('scroll_')) {
      items.push(templateToVendorItem(template, 'Scrolls'));
    }
  }

  return {
    id: 'alchemist',
    name: 'Alchemist',
    title: 'Arcane Alchemist',
    description: 'Potions, elixirs, and magical scrolls. Essential supplies for any adventurer.',
    currency: 'gold',
    categories: ['Potions', 'Elixirs', 'Scrolls'],
    items,
  };
}

// ==================== ARCANIST ====================

function templateToArcanistItem(template: ItemTemplate, category: string): VendorItemData {
  const vi = templateToVendorItem(template, category);
  vi.currency = 'arcanite';
  vi.price = Math.ceil(template.sellPrice / 10);
  return vi;
}

function getArcanistVendor(): VendorDefinitionData {
  const items: VendorItemData[] = [
    { id: 'arcanist_gold_package', name: 'Gold Package', description: 'Receive 10,000 Gold instantly on your active character.', category: 'Bundles', price: 50, currency: 'arcanite', stock: 'unlimited', specialAction: 'gold_package', specialData: { goldAmount: 10000 } },
    { id: 'arcanist_vault_upgrade', name: 'Vault Expansion', description: 'Expand your vault by 25 slots (max 200).', category: 'Upgrades', price: 100, currency: 'arcanite', stock: 'unlimited', specialAction: 'vault_upgrade', specialData: { slotsAdded: 25, maxSlots: 200 } },
  ];

  // Crafting Materials & Crystals from templates
  const templates = getAllItemTemplates();
  for (const template of templates.values()) {
    if (template.type === 'MATERIAL') {
      items.push(templateToArcanistItem(template, 'Crafting Materials'));
    } else if (template.type === 'CRYSTAL') {
      items.push(templateToArcanistItem(template, 'Crystals'));
    }
  }

  // Gems (not in main template registry)
  for (const gem of GEM_TEMPLATES) {
    items.push({
      id: `vendor_${gem.id}`,
      gemTemplateId: gem.id,
      name: gem.name,
      description: 'Socketable gem. Provides random stats when inserted into equipment.',
      category: 'Gems',
      price: Math.ceil(gem.sellPrice / 10),
      currency: 'arcanite',
      stock: 'unlimited',
    });
  }

  return {
    id: 'arcanist',
    name: 'Arcanist',
    title: 'Arcane Merchant',
    description: 'Premium items, boosters, and account upgrades. Arcanite only.',
    currency: 'arcanite',
    categories: ['Bundles', 'Upgrades', 'Crafting Materials', 'Crystals', 'Gems'],
    items,
  };
}

// ==================== PUBLIC API (cached — display items rolled once per server start) ====================

let _cachedVendors: VendorDefinitionData[] | null = null;

export async function getVendors(): Promise<VendorDefinitionData[]> {
  if (_cachedVendors) return _cachedVendors;
  _cachedVendors = [getBlacksmithVendor(), getAlchemistVendor(), getArcanistVendor()];
  return _cachedVendors;
}

export async function getVendor(vendorId: string): Promise<VendorDefinitionData> {
  const vendors = await getVendors();
  const vendor = vendors.find(v => v.id === vendorId);
  if (!vendor) throw new AppError(404, `Vendor '${vendorId}' not found`);
  return vendor;
}

export async function purchaseItem(
  userId: string,
  characterId: string,
  vendorId: string,
  vendorItemId: string,
  quantity: number = 1
) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  const vendor = await getVendor(vendorId);
  const vendorItem = vendor.items.find(vi => vi.id === vendorItemId);
  if (!vendorItem) throw new AppError(404, 'Item not found in vendor inventory');

  if (vendorItem.isComingSoon) {
    throw new AppError(400, 'This item is not yet available');
  }

  if (vendorItem.requiredLevel && char.level < vendorItem.requiredLevel) {
    throw new AppError(400, `Requires level ${vendorItem.requiredLevel}. You are level ${char.level}.`);
  }

  const totalCost = vendorItem.price * quantity;

  // Handle special actions (Arcanist)
  if (vendorItem.specialAction) {
    return handleSpecialPurchase(userId, char, vendorItem, totalCost);
  }

  // Resolve item to add — roll fresh from template if available
  let purchasedItem: ItemData;
  if (vendorItem.templateId) {
    const instance = rollItemInstance(vendorItem.templateId);
    purchasedItem = itemInstanceToItemData(instance);
  } else if (vendorItem.gemTemplateId) {
    purchasedItem = rollGemItemData(vendorItem.gemTemplateId);
  } else if (vendorItem.item) {
    purchasedItem = { ...vendorItem.item };
  } else {
    throw new AppError(400, 'Invalid vendor item');
  }

  const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);

  // ---- Pre-check: validate inventory space BEFORE deducting currency ----
  const invItems = await prisma.inventoryItem.findMany({ where: { characterId } });

  if (purchasedItem.stackable) {
    const existing = invItems.find(i => toItemData(i.itemData).name === purchasedItem.name);
    if (!existing) {
      const slot = findEmptySlot(invItems, bagCapacity);
      if (!slot) throw new AppError(400, 'Inventory is full');
    }
  } else {
    if (invItems.length + quantity > bagCapacity) {
      throw new AppError(400, 'Not enough inventory space');
    }
  }

  // Pre-check currency (non-authoritative — real deduction inside tx)
  if (vendorItem.currency === 'gold') {
    if (char.gold < totalCost) {
      throw new AppError(400, `Not enough Gold. Need ${totalCost.toLocaleString()}, have ${char.gold.toLocaleString()}.`);
    }
  } else {
    if (char.arcanite < totalCost) {
      throw new AppError(400, `Not enough Arcanite. Need ${totalCost}, have ${char.arcanite}.`);
    }
  }

  // Atomic: deduct currency + add items
  await prisma.$transaction(async (tx) => {
    // Re-read character INSIDE the transaction to avoid stale overwrites
    const freshChar = await tx.character.findFirst({ where: { id: characterId, userId } });
    if (!freshChar) throw new AppError(404, 'Character not found');

    if (vendorItem.currency === 'gold') {
      if (freshChar.gold < totalCost) {
        throw new AppError(400, `Not enough Gold. Need ${totalCost.toLocaleString()}, have ${freshChar.gold.toLocaleString()}.`);
      }
      await tx.character.update({ where: { id: characterId }, data: { gold: { decrement: totalCost } } });
    } else {
      if (freshChar.arcanite < totalCost) {
        throw new AppError(400, `Not enough Arcanite. Need ${totalCost}, have ${freshChar.arcanite}.`);
      }
      await tx.character.update({ where: { id: characterId }, data: { arcanite: { decrement: totalCost } } });
    }

    if (purchasedItem.stackable) {
      const existing = invItems.find(i => toItemData(i.itemData).name === purchasedItem.name);
      if (existing) {
        await tx.inventoryItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        });
      } else {
        await addItemToInventory(tx, characterId, purchasedItem, quantity, bagCapacity);
      }
    } else {
      for (let i = 0; i < quantity; i++) {
        let itemToAdd: ItemData;
        if (vendorItem.templateId && i > 0) {
          const freshInstance = rollItemInstance(vendorItem.templateId);
          itemToAdd = itemInstanceToItemData(freshInstance);
        } else if (vendorItem.gemTemplateId && i > 0) {
          itemToAdd = rollGemItemData(vendorItem.gemTemplateId);
        } else {
          itemToAdd = purchasedItem;
        }
        await addItemToInventory(tx, characterId, itemToAdd, 1, bagCapacity);
      }
    }
  });

  const updatedCharacter = await loadFullCharacter(characterId);

  return {
    success: true,
    message: `Purchased ${quantity}x ${vendorItem.name}`,
    updatedCharacter,
  };
}

// ==================== HELPERS ====================

async function handleSpecialPurchase(userId: string, character: Character, vendorItem: VendorItemData, totalCost: number) {
  // Pre-check arcanite (non-authoritative — real deduction inside tx)
  if (character.arcanite < totalCost) {
    throw new AppError(400, `Not enough Arcanite. Need ${totalCost}, have ${character.arcanite}.`);
  }

  switch (vendorItem.specialAction) {
    case 'vault_upgrade': {
      const vault = await prisma.vault.findUnique({ where: { userId } });
      if (!vault) throw new AppError(404, 'Vault not found');

      const maxSlots = vendorItem.specialData?.maxSlots || 200;
      const slotsAdded = vendorItem.specialData?.slotsAdded || 25;

      if (vault.maxSlots >= maxSlots) {
        throw new AppError(400, `Vault is already at maximum capacity (${maxSlots} slots).`);
      }

      await prisma.$transaction(async (tx) => {
        // Re-read character INSIDE the transaction to avoid stale overwrites
        const freshChar = await tx.character.findFirst({ where: { id: character.id } });
        if (!freshChar) throw new AppError(400, 'Character not found');
        if (freshChar.arcanite < totalCost) {
          throw new AppError(400, `Not enough Arcanite. Need ${totalCost}, have ${freshChar.arcanite}.`);
        }

        await tx.character.update({ where: { id: character.id }, data: { arcanite: { decrement: totalCost } } });
        await tx.vault.update({
          where: { id: vault.id },
          data: { maxSlots: Math.min(vault.maxSlots + slotsAdded, maxSlots) },
        });
      });

      const updatedVault = await prisma.vault.findUnique({ where: { userId }, include: { items: true } });
      const updatedCharacter = await loadFullCharacter(character.id);
      return {
        success: true,
        message: `Vault expanded! Now ${updatedVault!.maxSlots} slots.`,
        updatedVault,
        updatedCharacter,
      };
    }

    case 'gold_package': {
      const goldAmount = vendorItem.specialData?.goldAmount || 10000;

      await prisma.$transaction(async (tx) => {
        // Re-read character INSIDE the transaction to avoid stale overwrites
        const freshChar = await tx.character.findFirst({ where: { id: character.id } });
        if (!freshChar) throw new AppError(400, 'Character not found');
        if (freshChar.arcanite < totalCost) {
          throw new AppError(400, `Not enough Arcanite. Need ${totalCost}, have ${freshChar.arcanite}.`);
        }

        await tx.character.update({
          where: { id: character.id },
          data: {
            arcanite: { decrement: totalCost },
            gold: { increment: goldAmount },
          },
        });
      });

      const updatedCharacter = await loadFullCharacter(character.id);
      return {
        success: true,
        message: `Received ${goldAmount.toLocaleString()} Gold!`,
        updatedCharacter,
      };
    }

    default:
      throw new AppError(400, 'Unknown special action');
  }
}
