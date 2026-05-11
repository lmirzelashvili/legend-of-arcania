import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import { findEmptySlot } from '../utils/inventory-helpers.js';
import { calculateBagCapacity } from '../types/index.js';
import type { ItemData } from '../types/index.js';
import type { InventoryItem } from '@prisma/client';
import { toJsonInput } from '../utils/prisma-json-helpers.js';
import { publishEvent } from './event-bus.service.js';

// ==================== TYPES ====================

interface TradeOfferItem {
  inventoryItemId: string;
  quantity: number;
}

// ==================== HELPERS ====================

async function guardTradeExpiry(trade: { id: string; expiresAt: Date }): Promise<void> {
  if (trade.expiresAt <= new Date()) {
    await prisma.trade.update({ where: { id: trade.id }, data: { status: 'EXPIRED' } });
    throw new AppError(400, 'Trade has expired');
  }
}

// ==================== CREATE TRADE ====================

export async function createTrade(userId: string, receiverUsername: string, characterId: string) {
  // Find receiver by username (case-insensitive)
  const receiver = await prisma.user.findFirst({
    where: { username: { equals: receiverUsername, mode: 'insensitive' } },
    select: { id: true, username: true },
  });
  if (!receiver) throw new AppError(404, 'User not found');

  // Prevent self-trade
  if (receiver.id === userId) {
    throw new AppError(400, 'Cannot trade with yourself');
  }

  // Verify character belongs to initiator
  const character = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!character) throw new AppError(404, 'Character not found');

  // Check for existing active trade between these users
  const existingTrade = await prisma.trade.findFirst({
    where: {
      OR: [
        { initiatorId: userId, receiverId: receiver.id },
        { initiatorId: receiver.id, receiverId: userId },
      ],
      status: { in: ['PENDING', 'ACTIVE', 'LOCKED'] },
    },
  });
  if (existingTrade) {
    throw new AppError(400, 'An active trade already exists between you and this user');
  }

  // Create trade with 10-minute expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const trade = await prisma.trade.create({
    data: {
      initiatorId: userId,
      receiverId: receiver.id,
      status: 'PENDING',
      expiresAt,
      offers: {
        create: [
          { userId: userId, items: [], goldAmount: 0 },
          { userId: receiver.id, items: [], goldAmount: 0 },
        ],
      },
    },
    include: {
      offers: true,
      initiator: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
  });

  return trade;
}

// ==================== GET ACTIVE TRADES ====================

export async function getActiveTrades(userId: string) {
  const trades = await prisma.trade.findMany({
    where: {
      OR: [{ initiatorId: userId }, { receiverId: userId }],
      status: { in: ['PENDING', 'ACTIVE', 'LOCKED'] },
    },
    include: {
      offers: true,
      initiator: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Filter out expired trades
  const now = new Date();
  const activeTrades = trades.filter(t => t.expiresAt > now);

  // Mark expired trades as cancelled in background
  const expiredIds = trades.filter(t => t.expiresAt <= now).map(t => t.id);
  if (expiredIds.length > 0) {
    prisma.trade.updateMany({
      where: { id: { in: expiredIds } },
      data: { status: 'EXPIRED' },
    }).catch(() => {}); // fire-and-forget
  }

  return activeTrades;
}

// ==================== GET TRADE ====================

export async function getTrade(userId: string, tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      offers: true,
      initiator: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
  });
  if (!trade) throw new AppError(404, 'Trade not found');

  // Verify user is a participant
  if (trade.initiatorId !== userId && trade.receiverId !== userId) {
    throw new AppError(403, 'You are not a participant in this trade');
  }

  return trade;
}

// ==================== ACCEPT TRADE ====================

export async function acceptTrade(userId: string, tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: { offers: true },
  });
  if (!trade) throw new AppError(404, 'Trade not found');

  // Only receiver can accept
  if (trade.receiverId !== userId) {
    throw new AppError(403, 'Only the trade receiver can accept');
  }

  if (trade.status !== 'PENDING') {
    throw new AppError(400, `Trade cannot be accepted (current status: ${trade.status})`);
  }

  // Check expiry
  await guardTradeExpiry(trade);

  const updated = await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'ACTIVE' },
    include: {
      offers: true,
      initiator: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
  });

  return updated;
}

// ==================== UPDATE OFFER ====================

export async function updateOffer(
  userId: string,
  tradeId: string,
  characterId: string,
  items: TradeOfferItem[],
  goldAmount: number
) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: { offers: true },
  });
  if (!trade) throw new AppError(404, 'Trade not found');

  // Verify participant
  if (trade.initiatorId !== userId && trade.receiverId !== userId) {
    throw new AppError(403, 'You are not a participant in this trade');
  }

  if (trade.status !== 'ACTIVE') {
    throw new AppError(400, `Trade is not active (current status: ${trade.status})`);
  }

  // Check expiry
  await guardTradeExpiry(trade);

  // Max 12 items per offer
  if (items.length > 12) {
    throw new AppError(400, 'Maximum 12 items per trade offer');
  }

  // Validate gold amount
  if (goldAmount < 0) {
    throw new AppError(400, 'Gold amount cannot be negative');
  }

  // Verify character belongs to user
  const character = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!character) throw new AppError(404, 'Character not found');

  // Validate gold available
  if (goldAmount > 0 && character.gold < goldAmount) {
    throw new AppError(400, `Not enough gold. Have ${character.gold}, need ${goldAmount}`);
  }

  // Validate items exist in character inventory
  for (const offerItem of items) {
    const invItem = await prisma.inventoryItem.findFirst({
      where: { id: offerItem.inventoryItemId, characterId },
    });
    if (!invItem) {
      throw new AppError(404, `Inventory item ${offerItem.inventoryItemId} not found`);
    }
    if (invItem.quantity < offerItem.quantity) {
      throw new AppError(400, `Not enough quantity for item. Have ${invItem.quantity}, need ${offerItem.quantity}`);
    }
  }

  // Find user's offer
  const offer = trade.offers.find(o => o.userId === userId);
  if (!offer) throw new AppError(404, 'Trade offer not found');

  // Update offer — any change unlocks both offers and resets trade to ACTIVE
  const otherOffer = trade.offers.find(o => o.userId !== userId);

  await prisma.$transaction(async (tx) => {
    // Update this user's offer
    await tx.tradeOffer.update({
      where: { id: offer.id },
      data: {
        items: toJsonInput(items),
        goldAmount,
        isLocked: false,
      },
    });

    // If other offer was locked, unlock it too (any change resets locks)
    if (otherOffer && otherOffer.isLocked) {
      await tx.tradeOffer.update({
        where: { id: otherOffer.id },
        data: { isLocked: false },
      });
    }

    // If trade was LOCKED, reset to ACTIVE
    if (trade.status === 'LOCKED') {
      await tx.trade.update({
        where: { id: tradeId },
        data: { status: 'ACTIVE' },
      });
    }
  });

  // Return updated trade
  return getTrade(userId, tradeId);
}

// ==================== LOCK OFFER ====================

export async function lockOffer(userId: string, tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: { offers: true },
  });
  if (!trade) throw new AppError(404, 'Trade not found');

  if (trade.initiatorId !== userId && trade.receiverId !== userId) {
    throw new AppError(403, 'You are not a participant in this trade');
  }

  if (trade.status !== 'ACTIVE') {
    throw new AppError(400, `Trade is not active (current status: ${trade.status})`);
  }

  await guardTradeExpiry(trade);

  const offer = trade.offers.find(o => o.userId === userId);
  if (!offer) throw new AppError(404, 'Trade offer not found');

  if (offer.isLocked) {
    throw new AppError(400, 'Your offer is already locked');
  }

  // Lock user's offer and check if both are locked — atomic transaction
  const otherOffer = trade.offers.find(o => o.userId !== userId);

  await prisma.$transaction(async (tx) => {
    await tx.tradeOffer.update({
      where: { id: offer.id },
      data: { isLocked: true },
    });

    if (otherOffer && otherOffer.isLocked) {
      // Both locked — move trade to LOCKED
      await tx.trade.update({
        where: { id: tradeId },
        data: { status: 'LOCKED' },
      });
    }
  });

  return getTrade(userId, tradeId);
}

// ==================== CONFIRM TRADE ====================

export async function confirmTrade(userId: string, tradeId: string, characterId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      offers: true,
      initiator: { select: { id: true, username: true } },
      receiver: { select: { id: true, username: true } },
    },
  });
  if (!trade) throw new AppError(404, 'Trade not found');

  if (trade.initiatorId !== userId && trade.receiverId !== userId) {
    throw new AppError(403, 'You are not a participant in this trade');
  }

  if (trade.status !== 'LOCKED') {
    throw new AppError(400, 'Trade must be locked by both parties before confirming');
  }

  await guardTradeExpiry(trade);

  // Verify character belongs to confirming user
  const character = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!character) throw new AppError(404, 'Character not found');

  const myOffer = trade.offers.find(o => o.userId === userId);
  const theirOffer = trade.offers.find(o => o.userId !== userId);
  if (!myOffer || !theirOffer) throw new AppError(500, 'Trade offers incomplete');

  const myItems = myOffer.items as unknown as TradeOfferItem[];
  const theirItems = theirOffer.items as unknown as TradeOfferItem[];

  // Determine the other user's character
  const otherUserId = trade.initiatorId === userId ? trade.receiverId : trade.initiatorId;

  // Find the other user's most recently used character (or any character)
  const otherCharacter = await prisma.character.findFirst({
    where: { userId: otherUserId },
    orderBy: { lastLoginAt: 'desc' },
  });
  if (!otherCharacter) throw new AppError(400, 'The other user has no character to receive items');

  const myCharId = characterId;
  const theirCharId = otherCharacter.id;

  // Execute atomic swap
  await prisma.$transaction(async (tx) => {
    // Re-read both characters inside transaction
    const freshMyChar = await tx.character.findFirst({ where: { id: myCharId, userId } });
    if (!freshMyChar) throw new AppError(404, 'Your character not found');
    const freshTheirChar = await tx.character.findFirst({ where: { id: theirCharId, userId: otherUserId } });
    if (!freshTheirChar) throw new AppError(404, 'Other character not found');

    const myBagCapacity = calculateBagCapacity(freshMyChar.level, freshMyChar.hasBattlePass);
    const theirBagCapacity = calculateBagCapacity(freshTheirChar.level, freshTheirChar.hasBattlePass);

    // Re-validate gold amounts
    if (myOffer.goldAmount > 0 && freshMyChar.gold < myOffer.goldAmount) {
      throw new AppError(400, 'You no longer have enough gold for this trade');
    }
    if (theirOffer.goldAmount > 0 && freshTheirChar.gold < theirOffer.goldAmount) {
      throw new AppError(400, 'The other player no longer has enough gold for this trade');
    }

    // Re-validate all my items still exist
    const myItemDetails: { invItem: InventoryItem; quantity: number; itemData: ItemData }[] = [];
    for (const offerItem of myItems) {
      const invItem = await tx.inventoryItem.findFirst({
        where: { id: offerItem.inventoryItemId, characterId: myCharId },
      });
      if (!invItem) throw new AppError(400, 'One of your offered items no longer exists');
      if (invItem.quantity < offerItem.quantity) {
        throw new AppError(400, 'You no longer have enough quantity of an offered item');
      }
      myItemDetails.push({
        invItem,
        quantity: offerItem.quantity,
        itemData: invItem.itemData as unknown as ItemData,
      });
    }

    // Re-validate all their items still exist
    const theirItemDetails: { invItem: InventoryItem; quantity: number; itemData: ItemData }[] = [];
    for (const offerItem of theirItems) {
      const invItem = await tx.inventoryItem.findFirst({
        where: { id: offerItem.inventoryItemId, characterId: theirCharId },
      });
      if (!invItem) throw new AppError(400, 'One of the other player\'s offered items no longer exists');
      if (invItem.quantity < offerItem.quantity) {
        throw new AppError(400, 'The other player no longer has enough quantity of an offered item');
      }
      theirItemDetails.push({
        invItem,
        quantity: offerItem.quantity,
        itemData: invItem.itemData as unknown as ItemData,
      });
    }

    // 1. Remove my offered items from my inventory
    for (const detail of myItemDetails) {
      if (detail.invItem.quantity === detail.quantity) {
        await tx.inventoryItem.delete({ where: { id: detail.invItem.id } });
      } else {
        await tx.inventoryItem.update({
          where: { id: detail.invItem.id },
          data: { quantity: detail.invItem.quantity - detail.quantity },
        });
      }
    }

    // 2. Remove their offered items from their inventory
    for (const detail of theirItemDetails) {
      if (detail.invItem.quantity === detail.quantity) {
        await tx.inventoryItem.delete({ where: { id: detail.invItem.id } });
      } else {
        await tx.inventoryItem.update({
          where: { id: detail.invItem.id },
          data: { quantity: detail.invItem.quantity - detail.quantity },
        });
      }
    }

    // 3. Add their items to my inventory
    for (const detail of theirItemDetails) {
      if (detail.itemData.stackable) {
        const existing = await tx.inventoryItem.findFirst({
          where: { characterId: myCharId, itemId: detail.itemData.id },
        });
        if (existing) {
          await tx.inventoryItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + detail.quantity },
          });
          continue;
        }
      }
      const refreshed = await tx.inventoryItem.findMany({ where: { characterId: myCharId } });
      const slot = findEmptySlot(refreshed, myBagCapacity);
      if (!slot) throw new AppError(400, 'Your inventory is full — cannot complete trade');
      await tx.inventoryItem.create({
        data: {
          characterId: myCharId,
          itemId: detail.itemData.id,
          itemData: toJsonInput(detail.itemData),
          quantity: detail.quantity,
          gridX: slot.x,
          gridY: slot.y,
        },
      });
    }

    // 4. Add my items to their inventory
    for (const detail of myItemDetails) {
      if (detail.itemData.stackable) {
        const existing = await tx.inventoryItem.findFirst({
          where: { characterId: theirCharId, itemId: detail.itemData.id },
        });
        if (existing) {
          await tx.inventoryItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + detail.quantity },
          });
          continue;
        }
      }
      const refreshed = await tx.inventoryItem.findMany({ where: { characterId: theirCharId } });
      const slot = findEmptySlot(refreshed, theirBagCapacity);
      if (!slot) throw new AppError(400, 'The other player\'s inventory is full — cannot complete trade');
      await tx.inventoryItem.create({
        data: {
          characterId: theirCharId,
          itemId: detail.itemData.id,
          itemData: toJsonInput(detail.itemData),
          quantity: detail.quantity,
          gridX: slot.x,
          gridY: slot.y,
        },
      });
    }

    // 5. Transfer gold between characters
    if (myOffer.goldAmount > 0 || theirOffer.goldAmount > 0) {
      const myGoldDelta = theirOffer.goldAmount - myOffer.goldAmount;
      const theirGoldDelta = myOffer.goldAmount - theirOffer.goldAmount;

      await tx.character.update({
        where: { id: myCharId },
        data: { gold: { increment: myGoldDelta } },
      });
      await tx.character.update({
        where: { id: theirCharId },
        data: { gold: { increment: theirGoldDelta } },
      });
    }

    // 6. Mark trade COMPLETED
    await tx.trade.update({
      where: { id: tradeId },
      data: { status: 'COMPLETED' },
    });
  });

  const updatedCharacter = await loadFullCharacter(myCharId);

  publishEvent('trade.completed', {
    initiatorId: trade.initiatorId,
    receiverId: trade.receiverId,
  }).catch(err => console.warn('Event publish failed:', err));

  return {
    success: true,
    message: 'Trade completed successfully',
    updatedCharacter,
  };
}

// ==================== CANCEL TRADE ====================

export async function cancelTrade(userId: string, tradeId: string) {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
  });
  if (!trade) throw new AppError(404, 'Trade not found');

  if (trade.initiatorId !== userId && trade.receiverId !== userId) {
    throw new AppError(403, 'You are not a participant in this trade');
  }

  if (trade.status === 'COMPLETED') {
    throw new AppError(400, 'Cannot cancel a completed trade');
  }

  if (trade.status === 'CANCELLED' || trade.status === 'EXPIRED') {
    throw new AppError(400, `Trade is already ${trade.status.toLowerCase()}`);
  }

  await prisma.trade.update({
    where: { id: tradeId },
    data: { status: 'CANCELLED' },
  });

  return { success: true, message: 'Trade cancelled' };
}
