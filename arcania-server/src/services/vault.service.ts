import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import { findEmptySlot } from '../utils/inventory-helpers.js';
import { VaultTier, VAULT_TIER_CONFIG, ZoneType, calculateBagCapacity } from '../types/index.js';
import type { ItemData, VaultData, VaultItemData } from '../types/index.js';
import { toItemData, toVaultTier, toPosition, toJsonInput } from '../utils/prisma-json-helpers.js';

// ==================== HELPERS ====================

async function loadVault(userId: string): Promise<VaultData> {
  let vault = await prisma.vault.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!vault) {
    vault = await prisma.vault.create({
      data: { userId },
      include: { items: true },
    });
  }

  return {
    id: vault.id,
    userId: vault.userId,
    tier: toVaultTier(vault.tier),
    items: vault.items.map(vi => ({
      id: vi.id,
      item: toItemData(vi.itemData),
      quantity: vi.quantity,
      depositedAt: vi.depositedAt.toISOString(),
      depositedBy: vi.depositedBy,
    })),
    maxSlots: vault.maxSlots,
    gold: vault.gold,
    arcanite: vault.arcanite,
    purchasedExpandedAt: vault.purchasedExpandedAt?.toISOString(),
    purchasedPremiumAt: vault.purchasedPremiumAt?.toISOString(),
  };
}

// ==================== API ====================

export async function getVault(userId: string): Promise<VaultData> {
  return loadVault(userId);
}

export async function depositItem(
  userId: string,
  characterId: string,
  inventoryItemId: string,
  quantity: number
) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  // Zone check
  const position = toPosition(char.position);
  const zoneType = position?.zoneType || ZoneType.SAFE;
  if (zoneType === ZoneType.PVP) {
    throw new AppError(403, 'Cannot access vault while in a Danger Zone. Return to a Safe Zone first.');
  }

  let vault = await prisma.vault.findUnique({ where: { userId }, include: { items: true } });
  if (!vault) {
    vault = await prisma.vault.create({ data: { userId }, include: { items: true } });
  }

  const invItem = await prisma.inventoryItem.findFirst({
    where: { id: inventoryItemId, characterId },
  });
  if (!invItem) throw new AppError(404, 'Item not found in inventory');

  const item = toItemData(invItem.itemData);

  // Check vault space
  const existingVaultItem = item.stackable
    ? vault.items.find(vi => toItemData(vi.itemData).id === item.id)
    : null;

  if (!existingVaultItem && vault.items.length >= vault.maxSlots) {
    throw new AppError(400, 'Vault is full');
  }

  const transferQty = Math.min(quantity, invItem.quantity);
  if (transferQty <= 0) throw new AppError(400, 'Invalid quantity');

  // Atomic: add to vault + remove from inventory
  await prisma.$transaction(async (tx) => {
    if (existingVaultItem) {
      await tx.vaultItem.update({
        where: { id: existingVaultItem.id },
        data: { quantity: existingVaultItem.quantity + transferQty },
      });
    } else {
      // Re-verify vault space inside the transaction (authoritative guard against races)
      const currentVaultItemCount = await tx.vaultItem.count({ where: { vaultId: vault.id } });
      if (currentVaultItemCount >= vault.maxSlots) {
        throw new AppError(400, 'Vault is full');
      }

      await tx.vaultItem.create({
        data: {
          vaultId: vault.id,
          itemId: item.id,
          itemData: toJsonInput(item),
          quantity: transferQty,
          depositedBy: characterId,
        },
      });
    }

    if (invItem.quantity <= transferQty) {
      await tx.inventoryItem.delete({ where: { id: invItem.id } });
    } else {
      await tx.inventoryItem.update({
        where: { id: invItem.id },
        data: { quantity: invItem.quantity - transferQty },
      });
    }
  });

  return {
    success: true,
    message: `Deposited ${transferQty}x ${item.name} to vault`,
    updatedVault: await loadVault(userId),
    updatedCharacter: await loadFullCharacter(characterId),
  };
}

export async function withdrawItem(
  userId: string,
  characterId: string,
  vaultItemId: string,
  quantity: number
) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  // Zone check
  const position = toPosition(char.position);
  const zoneType = position?.zoneType || ZoneType.SAFE;
  if (zoneType === ZoneType.PVP) {
    throw new AppError(403, 'Cannot access vault while in a Danger Zone. Return to a Safe Zone first.');
  }

  const vault = await prisma.vault.findUnique({ where: { userId }, include: { items: true } });
  if (!vault) throw new AppError(404, 'Vault not found');

  const vaultItem = vault.items.find(vi => vi.id === vaultItemId);
  if (!vaultItem) throw new AppError(404, 'Item not found in vault');

  const item = toItemData(vaultItem.itemData);
  const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);

  const invItems = await prisma.inventoryItem.findMany({ where: { characterId } });

  // Check stacking
  const existingInvItem = item.stackable
    ? invItems.find(i => toItemData(i.itemData).id === item.id)
    : null;

  if (!existingInvItem) {
    const emptySlot = findEmptySlot(invItems, bagCapacity);
    if (!emptySlot) throw new AppError(400, 'Character bag is full');
  }

  const transferQty = Math.min(quantity, vaultItem.quantity);
  if (transferQty <= 0) throw new AppError(400, 'Invalid quantity');

  // Atomic: add to inventory + remove from vault
  await prisma.$transaction(async (tx) => {
    if (existingInvItem) {
      await tx.inventoryItem.update({
        where: { id: existingInvItem.id },
        data: { quantity: existingInvItem.quantity + transferQty },
      });
    } else {
      // Re-verify inventory space inside the transaction (authoritative guard against races)
      const currentInvItems = await tx.inventoryItem.findMany({ where: { characterId } });
      const currentEmptySlot = findEmptySlot(currentInvItems, bagCapacity);
      if (!currentEmptySlot) throw new AppError(400, 'Character bag is full');

      await tx.inventoryItem.create({
        data: {
          characterId,
          itemId: item.id,
          itemData: toJsonInput(item),
          quantity: transferQty,
          gridX: currentEmptySlot.x,
          gridY: currentEmptySlot.y,
        },
      });
    }

    if (vaultItem.quantity <= transferQty) {
      await tx.vaultItem.delete({ where: { id: vaultItem.id } });
    } else {
      await tx.vaultItem.update({
        where: { id: vaultItem.id },
        data: { quantity: vaultItem.quantity - transferQty },
      });
    }
  });

  return {
    success: true,
    message: `Withdrew ${transferQty}x ${item.name} from vault`,
    updatedVault: await loadVault(userId),
    updatedCharacter: await loadFullCharacter(characterId),
  };
}

export async function upgradeVault(userId: string, tier: string, characterId?: string) {
  let vault = await prisma.vault.findUnique({ where: { userId } });
  if (!vault) {
    vault = await prisma.vault.create({ data: { userId } });
  }

  const tierConfig = VAULT_TIER_CONFIG[tier as VaultTier];
  if (!tierConfig) throw new AppError(400, 'Invalid vault tier');

  if (tier === VaultTier.EXPANDED && characterId) {
    const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
    if (!char) throw new AppError(404, 'Character not found');

    if (char.gold < tierConfig.cost) {
      throw new AppError(400, `Not enough gold. Need ${tierConfig.cost.toLocaleString()} gold.`);
    }

    const updateData = {
      tier,
      maxSlots: tierConfig.slots,
      purchasedExpandedAt: new Date(),
    };

    // Atomic: deduct gold + upgrade vault in one transaction
    await prisma.$transaction([
      prisma.character.update({
        where: { id: characterId },
        data: { gold: { decrement: tierConfig.cost } },
      }),
      prisma.vault.update({ where: { id: vault.id }, data: updateData }),
    ]);

    return { success: true, vault: await loadVault(userId) };
  }

  const updateData: Record<string, unknown> = {
    tier,
    maxSlots: tierConfig.slots,
  };

  if (tier === VaultTier.PREMIUM) updateData.purchasedPremiumAt = new Date();

  await prisma.vault.update({ where: { id: vault.id }, data: updateData });

  return { success: true, vault: await loadVault(userId) };
}

export async function canTransfer(userId: string, characterId: string) {
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) {
    return { allowed: false, reason: 'Character not found', zoneType: ZoneType.SAFE };
  }

  const position = toPosition(char.position);
  const zoneType = position?.zoneType || ZoneType.SAFE;

  if (zoneType === ZoneType.PVP) {
    return { allowed: false, reason: 'Cannot access vault in Danger Zones. Return to a Safe Zone first.', zoneType };
  }

  return { allowed: true, zoneType };
}

export async function withdrawCurrency(
  userId: string,
  characterId: string,
  currency: 'gold' | 'arcanite',
  amount: number
) {
  if (amount <= 0) throw new AppError(400, 'Amount must be positive');

  // Zone check
  const zoneChar = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (zoneChar) {
    const position = toPosition(zoneChar.position);
    const zoneType = position?.zoneType || ZoneType.SAFE;
    if (zoneType === ZoneType.PVP) {
      throw new AppError(400, 'Cannot access vault while in a Danger Zone. Return to a Safe Zone first.');
    }
  }

  const vault = await prisma.vault.findUnique({ where: { userId } });
  if (!vault) throw new AppError(404, 'Vault not found');

  if (currency === 'gold') {
    if (vault.gold < amount) throw new AppError(400, 'Not enough gold in vault');

    const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
    if (!char) throw new AppError(404, 'Character not found');

    // Atomic: deduct vault gold + credit character in one transaction
    await prisma.$transaction([
      prisma.vault.update({
        where: { id: vault.id },
        data: { gold: vault.gold - amount },
      }),
      prisma.character.update({
        where: { id: characterId },
        data: { gold: { increment: amount } },
      }),
    ]);

    return {
      success: true,
      message: `Withdrew ${amount.toLocaleString()} gold to ${char.name}`,
      updatedVault: await loadVault(userId),
      updatedCharacter: await loadFullCharacter(characterId),
    };
  }

  // arcanite — goes to character resources
  if (vault.arcanite < amount) throw new AppError(400, 'Not enough arcanite in vault');

  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  // Atomic: deduct vault arcanite + credit character in one transaction
  await prisma.$transaction([
    prisma.vault.update({
      where: { id: vault.id },
      data: { arcanite: vault.arcanite - amount },
    }),
    prisma.character.update({
      where: { id: characterId },
      data: { arcanite: { increment: amount } },
    }),
  ]);

  return {
    success: true,
    message: `Withdrew ${amount} arcanite to ${char.name}`,
    updatedVault: await loadVault(userId),
    updatedCharacter: await loadFullCharacter(characterId),
  };
}

export async function depositCurrency(
  userId: string,
  characterId: string,
  currency: 'gold' | 'arcanite',
  amount: number
) {
  if (amount <= 0) throw new AppError(400, 'Amount must be positive');

  // Zone check
  const zoneChar = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (zoneChar) {
    const position = toPosition(zoneChar.position);
    const zoneType = position?.zoneType || ZoneType.SAFE;
    if (zoneType === ZoneType.PVP) {
      throw new AppError(400, 'Cannot access vault while in a Danger Zone. Return to a Safe Zone first.');
    }
  }

  const vault = await prisma.vault.findUnique({ where: { userId } });
  if (!vault) throw new AppError(404, 'Vault not found');

  if (currency === 'gold') {
    const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
    if (!char) throw new AppError(404, 'Character not found');

    if (char.gold < amount) throw new AppError(400, 'Not enough gold on character');

    await prisma.$transaction([
      prisma.vault.update({
        where: { id: vault.id },
        data: { gold: vault.gold + amount },
      }),
      prisma.character.update({
        where: { id: characterId },
        data: { gold: { decrement: amount } },
      }),
    ]);

    return {
      success: true,
      message: `Deposited ${amount.toLocaleString()} gold from ${char.name}`,
      updatedVault: await loadVault(userId),
      updatedCharacter: await loadFullCharacter(characterId),
    };
  }

  // arcanite — comes from character resources
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  if (char.arcanite < amount) throw new AppError(400, 'Not enough arcanite on character');

  await prisma.$transaction([
    prisma.vault.update({
      where: { id: vault.id },
      data: { arcanite: vault.arcanite + amount },
    }),
    prisma.character.update({
      where: { id: characterId },
      data: { arcanite: { decrement: amount } },
    }),
  ]);

  return {
    success: true,
    message: `Deposited ${amount} arcanite from ${char.name}`,
    updatedVault: await loadVault(userId),
    updatedCharacter: await loadFullCharacter(characterId),
  };
}

export async function transferAllToVault(userId: string, characterId: string): Promise<void> {
  const char = await prisma.character.findFirst({
    where: { id: characterId, userId },
    include: { equipmentSlots: true, inventoryItems: true },
  });
  if (!char) return;

  let vault = await prisma.vault.findUnique({ where: { userId }, include: { items: true } });
  if (!vault) {
    vault = await prisma.vault.create({ data: { userId }, include: { items: true } });
  }

  // Build a list of incoming items from equipment + inventory
  const incomingItems: { itemId: string; itemData: ItemData; quantity: number; stackable: boolean }[] = [];

  for (const slot of char.equipmentSlots) {
    const item = toItemData(slot.itemData);
    incomingItems.push({
      itemId: slot.itemId,
      itemData: item,
      quantity: 1,
      stackable: !!item.stackable,
    });
  }

  for (const inv of char.inventoryItems) {
    const item = toItemData(inv.itemData);
    incomingItems.push({
      itemId: inv.itemId,
      itemData: item,
      quantity: inv.quantity,
      stackable: !!item.stackable,
    });
  }

  if (incomingItems.length === 0) return;

  await prisma.$transaction(async (tx) => {
    // Build a map of existing vault items by itemId for stacking
    const existingByItemId = new Map<string, (typeof vault.items)[number]>();
    for (const vi of vault.items) {
      const viData = toItemData(vi.itemData);
      if (viData.stackable) {
        existingByItemId.set(vi.itemId, vi);
      }
    }

    let usedSlots = vault.items.length;
    let skippedCount = 0;

    for (const incoming of incomingItems) {
      // Stackable: try to consolidate into existing vault entry
      if (incoming.stackable) {
        const existingVi = existingByItemId.get(incoming.itemId);
        if (existingVi) {
          await tx.vaultItem.update({
            where: { id: existingVi.id },
            data: { quantity: existingVi.quantity + incoming.quantity },
          });
          // Update the in-memory quantity for subsequent stacks of the same item
          existingVi.quantity += incoming.quantity;
          continue;
        }
      }

      // Need a new slot — check capacity
      if (usedSlots >= vault.maxSlots) {
        skippedCount++;
        continue;
      }

      const created = await tx.vaultItem.create({
        data: {
          vaultId: vault.id,
          itemId: incoming.itemId,
          itemData: toJsonInput(incoming.itemData),
          quantity: incoming.quantity,
          depositedBy: characterId,
        },
      });
      usedSlots++;

      // Track newly created stackable items so further duplicates stack onto them
      if (incoming.stackable) {
        existingByItemId.set(incoming.itemId, created as typeof vault.items[number]);
      }
    }

    if (skippedCount > 0) {
      console.warn(
        `[transferAllToVault] Vault capacity reached for user ${userId}. ` +
        `Skipped ${skippedCount} item(s) that could not fit.`
      );
    }
  });
}
