import prisma from '../config/db.js';
import { logger } from '../config/logger.js';
import { toJsonInput } from '../utils/prisma-json-helpers.js';
import type { ItemData } from '../types/index.js';

/**
 * Finds all player listings that have passed their expiry date,
 * returns each item to the seller's vault, and deletes the listing.
 * Safe to call repeatedly — each listing is handled in its own transaction.
 */
export async function expireOldListings(): Promise<void> {
  const expired = await prisma.marketplaceListing.findMany({
    where: {
      expiresAt: { lt: new Date() },
      source: 'player',
    },
  });

  if (expired.length === 0) return;

  logger.info({ count: expired.length }, 'Expiring marketplace listings');

  for (const listing of expired) {
    try {
      await prisma.$transaction(async (tx) => {
        // Re-check the listing still exists inside the transaction
        const fresh = await tx.marketplaceListing.findUnique({ where: { id: listing.id } });
        if (!fresh) return; // Already removed (e.g. buyer purchased it just now)

        const item = listing.itemData as unknown as ItemData;

        // Ensure the seller has a vault; create one if missing
        let vault = await tx.vault.findUnique({ where: { userId: listing.sellerId } });
        if (!vault) {
          vault = await tx.vault.create({ data: { userId: listing.sellerId } });
        }

        // Return item to seller vault — stack on existing entry if stackable
        if (item.stackable) {
          const existing = await tx.vaultItem.findFirst({
            where: { vaultId: vault.id, itemId: listing.itemId },
          });
          if (existing) {
            await tx.vaultItem.update({
              where: { id: existing.id },
              data: { quantity: existing.quantity + listing.quantity },
            });
          } else {
            await tx.vaultItem.create({
              data: {
                vaultId: vault.id,
                itemId: listing.itemId,
                itemData: toJsonInput(item),
                quantity: listing.quantity,
                depositedBy: 'listing_expiry',
              },
            });
          }
        } else {
          await tx.vaultItem.create({
            data: {
              vaultId: vault.id,
              itemId: listing.itemId,
              itemData: toJsonInput(item),
              quantity: listing.quantity,
              depositedBy: 'listing_expiry',
            },
          });
        }

        await tx.marketplaceListing.delete({ where: { id: listing.id } });
      });
    } catch (err) {
      // Log and continue — a single listing failure should not block others
      logger.error({ err, listingId: listing.id }, 'Failed to expire listing');
    }
  }

  logger.info({ count: expired.length }, 'Listing expiry complete');
}
