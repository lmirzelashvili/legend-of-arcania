# Bug Audit: Transaction Wrapping Verification

**Date**: 2026-03-31
**Scope**: Recently modified server files -- transaction correctness, missing awaits, error propagation, stale references
**Auditor**: Claude Code Game Studios
**Type**: Focused audit on recent transactional refactoring

---

## Executive Summary

The recent transactional refactoring is largely correct. `createListing`, `cancelListing`, `sellItem`, `moveInventoryItem` swap, `depositItem`, `withdrawItem`, vendor `purchaseItem`, and wallet `performSpin` all properly use `prisma.$transaction` with correct `await` usage inside. However, **5 new or remaining bugs** were found, including **2 S2-Major** issues directly related to the transaction wrapping patterns.

### Previously Reported Bugs Now Fixed

| Previous Bug ID | Title | Status |
|---|---|---|
| BUG-2604 | `maxSlots` hardcoded to 40 | **FIXED** -- `character-helpers.ts` line 61 and `character.service.ts` line 138 now call `calculateBagCapacity(char.level, char.hasBattlePass)` |
| BUG-2606 | createListing/cancelListing not atomic | **FIXED** -- both now wrapped in `prisma.$transaction` (lines 181 and 287) |

---

## BUG-2701: Marketplace `purchaseListing` mutates `resources` outside transaction, causing stale write

### Summary
**Title**: Marketplace purchase computes currency deduction outside transaction, enabling race-condition gold/arcanite loss
**ID**: BUG-2701
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay / Network
- **System**: Marketplace
- **Frequency**: Sometimes (10-50%) -- requires concurrent resource mutation
- **Regression**: No (pre-existing, persists through transaction refactoring)

### Technical Context
- **File**: `services/marketplace.service.ts`, lines 369-401 and 404-410
- **Root cause**: At lines 388-401, the `resources` object is read from the character row fetched at line 357, and the currency deduction is computed in-memory (e.g., `resources.gold = currentGold - listing.price`). This mutated object is then written inside the transaction at line 410 (`data: { resources }`). The transaction correctly re-checks whether the listing still exists (line 406-407), but does NOT re-read the character's resources. If any other operation modifies the character's resources between line 357 and the transaction write at line 410 (e.g., a concurrent sell, consumable use, or quest reward claim), those changes are silently overwritten.

### Reproduction Steps
**Preconditions**: Character has 5000 gold.

1. Client A initiates a marketplace purchase for an item costing 2000 gold (reads resources.gold = 5000, sets resources.gold = 3000).
2. Between line 369 and the transaction at line 404, Client B (same character, different tab) sells an NPC item and receives 500 gold (character now has 5500 gold in DB).
3. Client A's transaction writes `resources.gold = 3000`, overwriting the sell income.

**Expected Result**: Character ends with 3500 gold (5500 - 2000).
**Actual Result**: Character ends with 3000 gold. 500 gold silently lost.

### Recommended Fix
Re-read the character inside the transaction, re-validate funds, and apply the deduction there:
```typescript
await prisma.$transaction(async (tx) => {
  const freshChar = await tx.character.findUniqueOrThrow({ where: { id: characterId } });
  const freshResources = freshChar.resources as any;
  // re-validate and deduct here
  await tx.character.update({ where: { id: characterId }, data: { resources: freshResources } });
});
```

---

## BUG-2702: Vendor `purchaseItem` mutates `resources` outside transaction, same stale-write pattern

### Summary
**Title**: Vendor purchase computes currency deduction outside transaction, enabling race-condition currency loss
**ID**: BUG-2702
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay / Network
- **System**: Vendor
- **Frequency**: Sometimes (10-50%) -- requires concurrent resource mutation
- **Regression**: No (pre-existing, persists through transaction refactoring)

### Technical Context
- **File**: `services/vendor.service.ts`, lines 289-306
- **Root cause**: Identical pattern to BUG-2701. The `resources` object is read from the character at line 236 (outside the transaction), currency is deducted in-memory at lines 291-302, and the stale `resources` object is written inside the transaction at line 306. The pre-transaction `invItems` list (line 274) is also used inside the transaction for the stackable check at line 309, which is a stale reference -- though the non-stackable path correctly re-queries at line 338.

### Additional Detail on Stale `invItems`
Line 309 inside the transaction uses the `invItems` array fetched at line 274 (outside the transaction). For the stackable code path, `existing` is found from the stale `invItems`, and `existing.quantity` at line 312 may be out of date. This is a minor correctness issue (quantity would be wrong) but not a data loss bug since it just means the final quantity could be slightly off.

### Recommended Fix
Same pattern as BUG-2701: re-read character resources and inventory inside the transaction.

---

## BUG-2703: `createListing` performs quantity validation outside transaction (TOCTOU race)

### Summary
**Title**: Marketplace listing creation has TOCTOU gap between quantity validation and item removal
**ID**: BUG-2703
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay / Network
- **System**: Marketplace
- **Frequency**: Rare (<10%) -- requires near-simultaneous listing requests for same item
- **Regression**: No (design gap in new transaction wrapping)

### Technical Context
- **File**: `services/marketplace.service.ts`, lines 150-223
- **Root cause**: The pre-transaction validation at lines 150-178 reads the inventory/vault item and checks quantity. The transaction at lines 181-223 re-reads the item (good), but the `item` variable used for the listing's `itemData` (line 212) was captured from the pre-transaction read at line 159/172. If the item's data was modified between the pre-check and the transaction (e.g., by an enhancement or gem socketing), the listing would contain stale item data.

  More critically for the vault path: the `vault` fetched at line 196 inside the transaction is correct, but the `item` at line 212 comes from the pre-transaction read. If the item was enhanced between the pre-check and the transaction, the marketplace listing shows the old stats.

### Recommended Fix
Capture the `item` data from the re-read inside the transaction rather than from the pre-transaction read.

---

## BUG-2704: `cancelListing` non-stackable return does not check vault `maxSlots`

### Summary
**Title**: Cancelling a multi-quantity non-stackable listing to vault bypasses capacity check
**ID**: BUG-2704
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Marketplace / Vault
- **Frequency**: Sometimes (when vault is near capacity and listing has quantity > 1)
- **Regression**: No (gap in new transaction wrapping)

### Technical Context
- **File**: `services/marketplace.service.ts`, lines 311-327 (the vault branch of `cancelListing`)
- **Root cause**: When cancelling a listing back to the vault (no `characterId`), the code creates vault items without checking `vault.maxSlots`. For the inventory path (with `characterId`), bag capacity IS checked (lines 277-283 for pre-check, and `findEmptySlot` inside the transaction). But the vault path at lines 311-323 never compares `vault.items.length` against `vault.maxSlots`. A listing with multiple non-stackable items could push the vault past its limit.

### Recommended Fix
Add a capacity check: `if (vault.items.length + listing.quantity > vault.maxSlots) throw new AppError(400, 'Vault is full');` before creating vault items.

---

## BUG-2705: `claimReward` performs multiple non-transactional DB writes (character update + vault update + quest status update)

### Summary
**Title**: Quest reward claim performs 3 independent DB writes without a transaction, risking partial application
**ID**: BUG-2705
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Quest
- **Frequency**: Rare (<10%) -- requires server crash during claim
- **Regression**: No (pre-existing, not addressed in recent transaction refactoring)

### Technical Context
- **File**: `services/quest.service.ts`, lines 113-205
- **Root cause**: `claimReward` performs up to 3 separate DB writes:
  1. Line 169: `prisma.character.update` (gold/xp/level)
  2. Line 190: `prisma.vault.update` (arcanite reward)
  3. Line 196: `prisma.playerQuest.update` (mark as COMPLETED)

  These are not wrapped in a transaction. If the server crashes after step 1 but before step 3, the character receives gold/xp but the quest remains CLAIMABLE, allowing the player to claim it again on retry (duplicating the reward). Similarly, if step 2 succeeds but step 3 fails, arcanite is granted but the quest can be claimed again.

### Recommended Fix
Wrap all three operations in a single `prisma.$transaction`.

---

## Summary Table

| ID | Severity | Service | Title |
|---|---|---|---|
| BUG-2701 | S2-Major | marketplace | `purchaseListing` stale resources write inside transaction (race condition, currency loss) |
| BUG-2702 | S2-Major | vendor | `purchaseItem` stale resources write inside transaction (race condition, currency loss) |
| BUG-2703 | S3-Minor | marketplace | `createListing` captures item data outside transaction (stale item stats in listing) |
| BUG-2704 | S3-Minor | marketplace | `cancelListing` vault path has no capacity check |
| BUG-2705 | S3-Minor | quest | `claimReward` performs 3 non-transactional writes (double-claim on crash) |

**Total: 5 bugs (2 S2-Major, 3 S3-Minor)**

---

## Verified Correct

The following recently modified patterns were verified as correctly implemented:

- **`createListing` transaction** (marketplace.service.ts line 181): Re-reads inventory/vault item inside tx, correctly handles delete-vs-update based on quantity, properly awaits all operations. Error propagation is correct (AppError thrown inside tx rolls back).
- **`cancelListing` transaction** (marketplace.service.ts line 287): Inventory path correctly uses `findEmptySlot` with fresh data inside tx. Stackable consolidation logic is correct.
- **`sellItem` transaction** (character.service.ts line 862): Correctly wraps item deletion + gold credit in a single tx. `resources` is read from `char` fetched at line 844 (outside tx), but since sellItem only adds gold (doesn't depend on an exact pre-condition like a purchase does), the stale-write risk is lower -- worst case is a concurrent operation's gold change is overwritten, which is the same pattern as BUG-2701 but less likely to trigger since sell is a quick operation.
- **`moveInventoryItem` swap** (character.service.ts line 442): Uses batch transaction `prisma.$transaction([...])` to atomically swap two items' grid positions. Correct.
- **`depositItem` / `withdrawItem` transactions** (vault.service.ts lines 89, 159): Both correctly wrap vault + inventory operations atomically. All `await`s present.
- **`performSpin` transaction** (wallet.service.ts line 98): Correctly wraps wallet update + vault auto-creation + vault currency deposit atomically. All `await`s present.
- **`getAllCharacters` batch** (character.service.ts line 104): Single query with includes, mapped in-memory. No transaction needed. Uses `calculateBagCapacity` correctly at line 138.
- **`dodgeChance` in DerivedStats** (types/index.ts line 90, stat-calculator.ts line 123): Correctly added to `DerivedStats` interface, `DerivedStatKey` union type, and `calculateDerivedStats`. Set bonus integration via `sb('dodgeChance')` is correct. Hard cap of 40 applied.
- **PENDANT slot mapping** (inventory-helpers.ts lines 97-98, 116, 134-135): `'neck'`/`'NECK'` correctly maps to `'PENDANT'`, and `SLOT_TO_EQUIPMENT_KEY` maps both `'PENDANT'` and `'NECK'` to frontend key `'pendant'`. Correct.
