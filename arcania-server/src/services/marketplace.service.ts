import prisma from '../config/db.js';
import type { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import { findEmptySlot } from '../utils/inventory-helpers.js';
import { calculateBagCapacity } from '../types/index.js';
import type { ItemData, ListingFilters, ListingSortOption, CreateListingRequest, CharacterData, VaultData } from '../types/index.js';
import { toItemData, toJsonInput, toVaultTier } from '../utils/prisma-json-helpers.js';
import { trackAchievement } from './quest.service.js';

// ==================== QUERY ====================

export async function getListings(
  filters?: ListingFilters,
  sort: ListingSortOption = 'relevant',
  page: number = 1,
  pageSize: number = 20,
) {
  // Clamp pageSize
  pageSize = Math.min(Math.max(1, pageSize), 50);
  page = Math.max(1, page);

  // Build WHERE using denormalized columns (no JSON filtering)
  const where: Prisma.MarketplaceListingWhereInput = {};

  if (filters) {
    if (filters.type) where.itemType = filters.type;
    if (filters.rarity) where.itemRarity = filters.rarity;
    if (filters.class) {
      // Items with no requiredClass are usable by all, so include them too
      where.OR = [
        { requiredClass: filters.class },
        { requiredClass: null },
      ];
    }
    if (filters.currency) where.currency = filters.currency;
    if (filters.source) where.source = filters.source;

    if (filters.minLevel !== undefined || filters.maxLevel !== undefined) {
      where.requiredLevel = {};
      if (filters.minLevel !== undefined) where.requiredLevel.gte = filters.minLevel;
      if (filters.maxLevel !== undefined) where.requiredLevel.lte = filters.maxLevel;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }
    if (filters.minEnhancement !== undefined || filters.maxEnhancement !== undefined) {
      where.enhancementLevel = {};
      if (filters.minEnhancement !== undefined) where.enhancementLevel.gte = filters.minEnhancement;
      if (filters.maxEnhancement !== undefined) where.enhancementLevel.lte = filters.maxEnhancement;
    }
    if (filters.search) {
      // Search in the JSON itemData name field and sellerName
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        ...(where.OR || []),
        { sellerName: { contains: searchLower, mode: 'insensitive' } },
        { itemData: { path: ['name'], string_contains: searchLower } },
      ];
    }
  }

  // Build orderBy
  let orderBy: Prisma.MarketplaceListingOrderByWithRelationInput | Prisma.MarketplaceListingOrderByWithRelationInput[];
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' };
      break;
    case 'price_desc':
      orderBy = { price: 'desc' };
      break;
    case 'recent':
      orderBy = { listedAt: 'desc' };
      break;
    case 'relevant':
    default:
      // Sort by source (player first), then level, then price
      orderBy = [
        { source: 'asc' },     // 'mock_player' < 'npc' < 'player' — we reverse in mapping if needed
        { requiredLevel: 'asc' },
        { price: 'asc' },
      ];
      break;
  }

  // Execute count + paginated query in parallel
  const [total, rows] = await Promise.all([
    prisma.marketplaceListing.count({ where }),
    prisma.marketplaceListing.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const listings = rows.map(row => ({
    id: row.id,
    item: row.itemData as unknown as ItemData,
    quantity: row.quantity,
    price: row.price,
    currency: row.currency as 'gold' | 'arcanite',
    sellerId: row.sellerId,
    sellerName: row.sellerName,
    listedAt: row.listedAt.toISOString(),
    source: row.source as 'npc' | 'player' | 'mock_player',
  }));

  return {
    listings,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getMyListings(userId: string) {
  const rows = await prisma.marketplaceListing.findMany({
    where: { sellerId: userId, source: 'player' },
    orderBy: { listedAt: 'desc' },
  });

  return rows.map(row => ({
    id: row.id,
    item: row.itemData as unknown as ItemData,
    quantity: row.quantity,
    price: row.price,
    currency: row.currency as 'gold' | 'arcanite',
    sellerId: row.sellerId,
    sellerName: row.sellerName,
    listedAt: row.listedAt.toISOString(),
    source: row.source as 'npc' | 'player' | 'mock_player',
  }));
}

// ==================== CREATE LISTING ====================

export async function createListing(userId: string, request: CreateListingRequest) {
  if (!request.price || request.price <= 0) {
    throw new AppError(400, 'Price must be greater than 0');
  }
  if (!request.quantity || request.quantity <= 0) {
    throw new AppError(400, 'Quantity must be greater than 0');
  }
  if (!request.currency || !['gold', 'arcanite'].includes(request.currency)) {
    throw new AppError(400, 'Currency must be gold or arcanite');
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, isPremium: true } });
  if (!user) throw new AppError(404, 'User not found');

  // Enforce listing limits
  const activeListingCount = await prisma.marketplaceListing.count({
    where: { sellerId: userId, source: 'player' },
  });
  const maxListings = user.isPremium ? 50 : 20;
  if (activeListingCount >= maxListings) {
    throw new AppError(400, `Maximum ${maxListings} active listings reached`);
  }

  let item: ItemData;
  let updatedCharacter: CharacterData | undefined = undefined;
  let updatedVault: VaultData | undefined = undefined;

  // Validate source and resolve item BEFORE transaction
  if (request.itemSource === 'bag') {
    if (!request.characterId) throw new AppError(400, 'characterId is required when selling from bag');
    if (!request.inventoryItemId) throw new AppError(400, 'inventoryItemId is required when selling from bag');
    const character = await prisma.character.findFirst({ where: { id: request.characterId, userId } });
    if (!character) throw new AppError(404, 'Character not found');
    const invItem = await prisma.inventoryItem.findFirst({
      where: { id: request.inventoryItemId, characterId: request.characterId },
    });
    if (!invItem) throw new AppError(404, 'Item not found in bag');
    item = invItem.itemData as unknown as ItemData;
    if (invItem.quantity < request.quantity) {
      throw new AppError(400, `Not enough quantity. Have ${invItem.quantity}, need ${request.quantity}`);
    }
  } else if (request.itemSource === 'vault') {
    if (!request.vaultItemId) throw new AppError(400, 'vaultItemId is required when selling from vault');
    const vault = await prisma.vault.findUnique({ where: { userId } });
    if (!vault) throw new AppError(404, 'Vault not found');
    const vaultItem = await prisma.vaultItem.findFirst({
      where: { id: request.vaultItemId, vaultId: vault.id },
    });
    if (!vaultItem) throw new AppError(404, 'Item not found in vault');
    item = vaultItem.itemData as unknown as ItemData;
    if (vaultItem.quantity < request.quantity) {
      throw new AppError(400, `Not enough quantity. Have ${vaultItem.quantity}, need ${request.quantity}`);
    }
  } else {
    throw new AppError(400, 'itemSource must be "bag" or "vault"');
  }

  // Atomic: remove item + create listing
  const listing = await prisma.$transaction(async (tx) => {
    if (request.itemSource === 'bag') {
      const invItem = await tx.inventoryItem.findFirst({
        where: { id: request.inventoryItemId!, characterId: request.characterId! },
      });
      if (!invItem) throw new AppError(404, 'Item not found in bag');
      if (invItem.quantity === request.quantity) {
        await tx.inventoryItem.delete({ where: { id: invItem.id } });
      } else {
        await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: { quantity: invItem.quantity - request.quantity },
        });
      }
    } else {
      const vault = await tx.vault.findUnique({ where: { userId } });
      const vaultItem = await tx.vaultItem.findFirst({
        where: { id: request.vaultItemId!, vaultId: vault!.id },
      });
      if (!vaultItem) throw new AppError(404, 'Item not found in vault');
      if (vaultItem.quantity === request.quantity) {
        await tx.vaultItem.delete({ where: { id: vaultItem.id } });
      } else {
        await tx.vaultItem.update({
          where: { id: vaultItem.id },
          data: { quantity: vaultItem.quantity - request.quantity },
        });
      }
    }

    const listingExpiresAt = new Date();
    listingExpiresAt.setDate(listingExpiresAt.getDate() + 7);

    const newListing = await tx.marketplaceListing.create({
      data: {
        itemId: item.id,
        itemData: toJsonInput(item),
        quantity: request.quantity,
        price: request.price,
        currency: request.currency,
        sellerId: userId,
        sellerName: user.username,
        source: 'player',
        expiresAt: listingExpiresAt,
        itemType: item.type,
        itemRarity: item.rarity,
        requiredLevel: item.requiredLevel || null,
        requiredClass: item.requiredClass || null,
        enhancementLevel: item.enhancementLevel || 0,
      },
    });

    await trackAchievement(userId, 'items_listed', 1, tx);

    return newListing;
  });

  if (request.itemSource === 'bag') {
    updatedCharacter = await loadFullCharacter(request.characterId!);
  } else {
    const refreshedVault = await prisma.vault.findUnique({ where: { userId }, include: { items: true } });
    if (refreshedVault) {
      updatedVault = {
        id: refreshedVault.id, userId: refreshedVault.userId, tier: toVaultTier(refreshedVault.tier),
        items: refreshedVault.items.map(vi => ({
          id: vi.id, item: vi.itemData as unknown as ItemData, quantity: vi.quantity,
          depositedAt: vi.depositedAt.toISOString(), depositedBy: vi.depositedBy,
        })),
        maxSlots: refreshedVault.maxSlots, gold: refreshedVault.gold, arcanite: refreshedVault.arcanite,
      };
    }
  }

  const listingResponse = {
    id: listing.id,
    item,
    quantity: listing.quantity,
    price: listing.price,
    currency: listing.currency as 'gold' | 'arcanite',
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    listedAt: listing.listedAt.toISOString(),
    source: listing.source as 'npc' | 'player' | 'mock_player',
  };

  return {
    success: true,
    message: 'Item listed successfully',
    listing: listingResponse,
    updatedCharacter,
    updatedVault,
  };
}

// ==================== CANCEL LISTING ====================

export async function cancelListing(userId: string, listingId: string, characterId?: string) {
  const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found');
  if (listing.sellerId !== userId) throw new AppError(403, 'Not your listing');

  const item = listing.itemData as unknown as ItemData;
  let updatedCharacter: CharacterData | undefined = undefined;
  let updatedVault: VaultData | undefined = undefined;

  // Validate before transaction
  if (characterId) {
    const character = await prisma.character.findFirst({ where: { id: characterId, userId } });
    if (!character) throw new AppError(404, 'Character not found');
    const bagCapacity = calculateBagCapacity(character.level, character.hasBattlePass);
    if (!item.stackable) {
      const allInvItems = await prisma.inventoryItem.findMany({ where: { characterId } });
      if (allInvItems.length + listing.quantity > bagCapacity) {
        throw new AppError(400, 'Not enough inventory space');
      }
    }
  }

  // Atomic: return item + delete listing
  await prisma.$transaction(async (tx) => {
    if (characterId) {
      const character = await tx.character.findFirst({ where: { id: characterId, userId } });
      if (!character) throw new AppError(404, 'Character not found');
      const bagCapacity = calculateBagCapacity(character.level, character.hasBattlePass);

      if (item.stackable) {
        const existingInvItem = await tx.inventoryItem.findFirst({ where: { characterId, itemId: item.id } });
        if (existingInvItem) {
          await tx.inventoryItem.update({ where: { id: existingInvItem.id }, data: { quantity: existingInvItem.quantity + listing.quantity } });
        } else {
          const allInvItems = await tx.inventoryItem.findMany({ where: { characterId } });
          const slot = findEmptySlot(allInvItems, bagCapacity);
          if (!slot) throw new AppError(400, 'Inventory is full');
          await tx.inventoryItem.create({ data: { characterId, itemId: item.id, itemData: toJsonInput(item), quantity: listing.quantity, gridX: slot.x, gridY: slot.y } });
        }
      } else {
        for (let i = 0; i < listing.quantity; i++) {
          const refreshed = await tx.inventoryItem.findMany({ where: { characterId } });
          const slot = findEmptySlot(refreshed, bagCapacity);
          if (!slot) throw new AppError(400, 'Inventory is full');
          await tx.inventoryItem.create({ data: { characterId, itemId: item.id, itemData: toJsonInput(item), quantity: 1, gridX: slot.x, gridY: slot.y } });
        }
      }
    } else {
      const vault = await tx.vault.findUnique({ where: { userId }, include: { items: true } });
      if (!vault) throw new AppError(404, 'Vault not found');

      if (item.stackable) {
        const existingVaultItem = vault.items.find(vi => (vi.itemData as unknown as ItemData).id === item.id);
        if (existingVaultItem) {
          await tx.vaultItem.update({ where: { id: existingVaultItem.id }, data: { quantity: existingVaultItem.quantity + listing.quantity } });
        } else {
          await tx.vaultItem.create({ data: { vaultId: vault.id, itemId: item.id, itemData: toJsonInput(item), quantity: listing.quantity, depositedBy: 'marketplace_return' } });
        }
      } else {
        await tx.vaultItem.create({ data: { vaultId: vault.id, itemId: item.id, itemData: toJsonInput(item), quantity: listing.quantity, depositedBy: 'marketplace_return' } });
      }
    }

    await tx.marketplaceListing.delete({ where: { id: listingId } });
  });

  if (characterId) {
    updatedCharacter = await loadFullCharacter(characterId);
  } else {
    const refreshedVault = await prisma.vault.findUnique({ where: { userId }, include: { items: true } });
    if (refreshedVault) {
      updatedVault = {
        id: refreshedVault.id, userId: refreshedVault.userId, tier: toVaultTier(refreshedVault.tier),
        items: refreshedVault.items.map(vi => ({
          id: vi.id, item: vi.itemData as unknown as ItemData, quantity: vi.quantity,
          depositedAt: vi.depositedAt.toISOString(), depositedBy: vi.depositedBy,
        })),
        maxSlots: refreshedVault.maxSlots, gold: refreshedVault.gold, arcanite: refreshedVault.arcanite,
      };
    }
  }

  return {
    success: true,
    message: 'Listing cancelled',
    updatedCharacter,
    updatedVault,
  };
}

// ==================== PURCHASE LISTING ====================

export async function purchaseListing(userId: string, characterId: string, listingId: string) {
  const character = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!character) throw new AppError(404, 'Character not found');

  const listing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
  if (!listing) throw new AppError(404, 'Listing not found or already sold');

  // Prevent buying your own listing
  if (listing.sellerId === userId) {
    throw new AppError(400, 'Cannot purchase your own listing');
  }

  const item = listing.itemData as unknown as ItemData;
  const bagCapacity = calculateBagCapacity(character.level, character.hasBattlePass);

  // ---- Pre-check: validate inventory space BEFORE entering transaction ----
  const allInvItems = await prisma.inventoryItem.findMany({ where: { characterId } });

  if (item.stackable) {
    const existingInvItem = allInvItems.find(i => toItemData(i.itemData).id === item.id);
    if (!existingInvItem) {
      const slot = findEmptySlot(allInvItems, bagCapacity);
      if (!slot) throw new AppError(400, 'Inventory is full');
    }
  } else {
    if (allInvItems.length + listing.quantity > bagCapacity) {
      throw new AppError(400, 'Not enough inventory space');
    }
  }

  // ---- Pre-check currency (non-authoritative — real deduction inside tx) ----
  if (listing.currency === 'gold') {
    if (character.gold < listing.price) {
      throw new AppError(400, `Not enough gold. Need ${listing.price}, have ${character.gold}`);
    }
  } else {
    if (character.arcanite < listing.price) {
      throw new AppError(400, `Not enough Arcanite. Need ${listing.price}, have ${character.arcanite}`);
    }
  }

  // ---- Atomic transaction: deduct, credit, transfer item, remove listing ----
  await prisma.$transaction(async (tx) => {
    // Re-check listing still exists (prevent double-buy race condition)
    const freshListing = await tx.marketplaceListing.findUnique({ where: { id: listingId } });
    if (!freshListing) throw new AppError(404, 'Listing already sold');

    // Re-read character INSIDE the transaction to avoid stale overwrites
    const freshChar = await tx.character.findFirst({ where: { id: characterId, userId } });
    if (!freshChar) throw new AppError(404, 'Character not found');

    // Deduct currency from buyer atomically
    if (freshListing.currency === 'gold') {
      if (freshChar.gold < freshListing.price) {
        throw new AppError(400, `Not enough gold. Need ${freshListing.price}, have ${freshChar.gold}`);
      }
      await tx.character.update({
        where: { id: characterId },
        data: { gold: { decrement: freshListing.price } },
      });
    } else {
      if (freshChar.arcanite < freshListing.price) {
        throw new AppError(400, `Not enough Arcanite. Need ${freshListing.price}, have ${freshChar.arcanite}`);
      }
      await tx.character.update({
        where: { id: characterId },
        data: { arcanite: { decrement: freshListing.price } },
      });
    }

    // Credit seller (player listings only)
    if (freshListing.source === 'player') {
      const sellerUser = await tx.user.findUnique({
        where: { id: freshListing.sellerId },
        select: { isPremium: true },
      });
      const isPremium = sellerUser?.isPremium || false;
      const fee = Math.ceil(freshListing.price * (isPremium ? 0.02 : 0.05));
      const sellerReceives = freshListing.price - fee;

      let sellerVault = await tx.vault.findUnique({ where: { userId: freshListing.sellerId } });
      if (!sellerVault) {
        sellerVault = await tx.vault.create({ data: { userId: freshListing.sellerId } });
      }
      if (freshListing.currency === 'gold') {
        await tx.vault.update({ where: { id: sellerVault.id }, data: { gold: sellerVault.gold + sellerReceives } });
      } else {
        await tx.vault.update({ where: { id: sellerVault.id }, data: { arcanite: sellerVault.arcanite + sellerReceives } });
      }
    }

    // Add item to buyer inventory
    if (item.stackable) {
      const existingInvItem = await tx.inventoryItem.findFirst({
        where: { characterId, itemId: item.id },
      });
      if (existingInvItem) {
        await tx.inventoryItem.update({
          where: { id: existingInvItem.id },
          data: { quantity: existingInvItem.quantity + freshListing.quantity },
        });
      } else {
        const refreshedItems = await tx.inventoryItem.findMany({ where: { characterId } });
        const slot = findEmptySlot(refreshedItems, bagCapacity);
        if (!slot) throw new AppError(400, 'Inventory is full');
        await tx.inventoryItem.create({
          data: { characterId, itemId: item.id, itemData: toJsonInput(item), quantity: freshListing.quantity, gridX: slot.x, gridY: slot.y },
        });
      }
    } else {
      for (let i = 0; i < freshListing.quantity; i++) {
        const refreshed = await tx.inventoryItem.findMany({ where: { characterId } });
        const slot = findEmptySlot(refreshed, bagCapacity);
        if (!slot) throw new AppError(400, 'Inventory is full');
        await tx.inventoryItem.create({
          data: { characterId, itemId: item.id, itemData: toJsonInput(item), quantity: 1, gridX: slot.x, gridY: slot.y },
        });
      }
    }

    // Remove listing (NPC listings stay)
    if (freshListing.source !== 'npc') {
      await tx.marketplaceListing.delete({ where: { id: listingId } });
    }

    await trackAchievement(userId, 'items_purchased', 1, tx);
  });

  const updatedCharacter = await loadFullCharacter(characterId);

  return {
    success: true,
    message: 'Purchase successful',
    updatedCharacter,
    purchasedItem: item,
  };
}
