# Bug Audit Re-Audit Report

**Date**: 2026-03-31
**Scope**: character.service.ts, marketplace.service.ts, vendor.service.ts, vault.service.ts, quest.service.ts, wallet.service.ts, stat-calculator.ts
**Auditor**: Claude Code Game Studios
**Type**: RE-AUDIT (follow-up to 25 previously reported bugs, 8 S2-Major)

---

## Executive Summary

The prior audit's critical fixes (creation token order, vault transactions, vendor transactions, slot collision, quest reward routing, optimistic token, spin vault creation) are **confirmed resolved**. However, **11 bugs remain or are newly introduced**, including **4 S2-Major** issues.

---

## BUG-2601: Marketplace purchase uses stale `resources` object inside transaction

### Summary
**Title**: Marketplace purchaseListing writes stale resources inside atomic transaction
**ID**: BUG-2601
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay / Network
- **System**: Marketplace
- **Frequency**: Sometimes (10-50%) -- requires concurrent resource mutation
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/marketplace.service.ts`, lines 455-479
- **Root cause**: The `resources` object is read and mutated at line 456-468 (outside the transaction), then written to the DB inside `prisma.$transaction` at line 478. If another request modifies the character's resources between the read (line 424) and the transaction write, those changes are silently overwritten.

### Reproduction Steps
**Preconditions**: Character has 1000 gold.

1. Client A initiates a marketplace purchase for 500 gold.
2. Between pre-check and transaction start, Client B (same user, different tab) sells an item receiving 200 gold (character now has 1200 gold).
3. Client A's transaction writes `resources.gold = 1000 - 500 = 500`, overwriting Client B's 200 gold deposit.

**Expected Result**: Character ends with 700 gold (1200 - 500).
**Actual Result**: Character ends with 500 gold. 200 gold lost.

### Recommended Fix
Re-read `character.resources` inside the transaction and re-apply the deduction there, or use Prisma's `increment`/`decrement` operations inside the transaction.

---

## BUG-2602: Vendor `handleSpecialPurchase` deducts arcanite before checking eligibility (vault_upgrade)

### Summary
**Title**: Vault expansion purchase eats arcanite when vault is already at max capacity
**ID**: BUG-2602
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Vendor / Arcanist
- **Frequency**: Always (when vault is maxed)
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/vendor.service.ts`, lines 363-399
- **Root cause**: `handleSpecialPurchase` mutates `resources.arcanite` at line 371, then the `vault_upgrade` case checks `vault.maxSlots >= maxSlots` at line 382 and returns `{ success: false }` -- but the arcanite deduction at line 386 has already been written to the `resources` object. Although the `prisma.character.update` at line 386 only fires on the success path, the caller `purchaseItem` has already returned at this point. **However**, looking more carefully: the `handleSpecialPurchase` function is called and its return value is returned directly. The `resources` object is mutated at line 371 but the DB update only happens at line 386 (inside the `vault_upgrade` case, after the max check). The early return at line 383 means the DB update at line 386 never fires, so arcanite is NOT deducted from DB. **Revised: This is NOT a bug.** The mutation is in-memory only and the early return prevents persistence.

**Status**: False positive -- CLOSED.

---

## BUG-2603: Vault `withdrawItem` has no PVP zone check

### Summary
**Title**: Players can withdraw items from vault while in PVP/Danger Zone
**ID**: BUG-2603
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Vault
- **Frequency**: Always (whenever in PVP zone)
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/vault.service.ts`, lines 125-195
- **Root cause**: `depositItem` (line 57-60) checks `zoneType === ZoneType.PVP` and blocks the operation. `withdrawItem` has no such check, allowing players in PVP zones to withdraw items. `withdrawCurrency` and `depositCurrency` also lack zone checks.

### Recommended Fix
Add the same PVP zone check at the start of `withdrawItem`, `withdrawCurrency`, and `depositCurrency`.

---

## BUG-2604: `loadFullCharacter` hardcodes `maxSlots: 40` instead of using `calculateBagCapacity`

### Summary
**Title**: Inventory maxSlots always reported as 40 regardless of level or battle pass
**ID**: BUG-2604
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: UI / Gameplay
- **System**: Character / Inventory
- **Frequency**: Always (for characters level 30+ or with battle pass)
- **Regression**: No (pre-existing)

### Technical Context
- **Files**:
  - `arcania-server/src/utils/character-helpers.ts`, line 60: `maxSlots: 40`
  - `arcania-server/src/services/character.service.ts`, line 138: `maxSlots: 40`
- **Root cause**: The `calculateBagCapacity` function is correctly used server-side for validation (equip, purchase, move), but the response sent to the client always says `maxSlots: 40`. A level 60 battle-pass character actually has 100 slots (40+20+20+20), but the client thinks 40.
- **Impact**: Frontend renders only 40 bag slots. Items in slots 41-100 are invisible to the player but exist server-side.

### Recommended Fix
Call `calculateBagCapacity(char.level, char.hasBattlePass)` in both `loadFullCharacter` and `getAllCharacters` to set `maxSlots`.

---

## BUG-2605: Double-counting primary stat contributions in `stat-calculator.ts`

### Summary
**Title**: Equipment primary stats (str/agi/int/vit/spr) are counted twice in derived stats
**ID**: BUG-2605
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Stat Calculator
- **Frequency**: Always (on any equipped item with primary stats)
- **Regression**: No (pre-existing, but only triggers if items have primary stat fields)

### Technical Context
- **File**: `arcania-server/src/utils/stat-calculator.ts`, lines 29-66 and 90-128
- **Root cause**: `getEquipmentBonuses()` (lines 48-62) converts primary stats on items into derived stat bonuses (e.g., `item.strength * 2` added to `physicalAttack`). Then `calculateDerivedStats()` (lines 108-127) adds `equipBonuses.physicalAttack` on top of `primaryStats.strength * 2`. The character's own primary stats are correctly counted once, but any equipment that carries primary stats (strength, agility, intelligence, vitality, spirit fields) gets those converted to derived stats **inside getEquipmentBonuses**, and then the bonuses are added to the derived stats that ALREADY include the character's base primary contribution. This is correct IF items only have derived stat fields (physicalAttack, etc.) but would double-count if an item has both `strength` AND `physicalAttack` set. Since `itemInstanceToItemData` in vendor.service.ts maps `effectiveStats.physicalAttack` (which already includes primary stat scaling from the item generator), items should NOT also have primary stat fields. **However**, `getEquipmentBonuses` reads `item.strength`, `item.agility`, etc., and the `ItemData` type supports these fields. If any item has both (e.g., from a gem adding a primary stat), the contribution would be double-counted.

### Evidence
Looking at `socketGem` (character.service.ts line 758): `targetItemData[statKey] = (targetItemData[statKey] || 0) + gemItemData.gemValue`. If `gemStat` is a primary stat like `strength`, this adds `strength` to the item's JSON. When equipped, `getEquipmentBonuses` converts that to `physicalAttack += strength * 2` AND `armorPenetration += strength * 0.05`. The gem's intent was likely to add flat strength, not strength + its derived derivatives.

### Recommended Fix
Either remove the primary stat -> derived stat conversion from `getEquipmentBonuses` (items should only have derived stats), OR ensure gems and item generation never set primary stat fields on ItemData.

---

## BUG-2606: `createListing` and `cancelListing` are not atomic (marketplace)

### Summary
**Title**: Non-atomic item removal + listing creation allows item duplication on failure
**ID**: BUG-2606
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Marketplace
- **Frequency**: Rare (<10%) -- requires crash at specific timing
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/marketplace.service.ts`, lines 150-247 (createListing)
- **Root cause**: `createListing` deletes/updates the inventory item (lines 171-177) and then creates the marketplace listing (lines 236-247) as separate operations, not wrapped in a `$transaction`. If the server crashes after deleting the item but before creating the listing, the item is lost. Conversely, `cancelListing` returns the item to inventory/vault (lines 288-407) then deletes the listing (line 411) -- a crash between these two steps duplicates the item.

### Recommended Fix
Wrap the item removal + listing creation (and vice versa for cancel) in `prisma.$transaction`.

---

## BUG-2607: `transferAllToVault` does not respect vault `maxSlots` limit

### Summary
**Title**: Transferring all items to vault on character deletion ignores vault capacity
**ID**: BUG-2607
**Severity**: S3-Minor
**Priority**: P3-Backlog
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Vault
- **Frequency**: Sometimes (when vault is near capacity and character has many items)
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/vault.service.ts`, lines 392-429
- **Root cause**: `transferAllToVault` iterates all equipment slots and inventory items and bulk-inserts them into the vault with `createMany`, never checking `vault.maxSlots`. This can push the vault far beyond its capacity limit.
- Also used in `deleteCharacter` (character.service.ts line 181).

### Recommended Fix
Check vault capacity before transfer. If insufficient space, either warn the user or silently skip excess items (with logging).

---

## BUG-2608: `transferAllToVault` does not consolidate stackable items

### Summary
**Title**: Bulk vault transfer creates duplicate vault entries for stackable items
**ID**: BUG-2608
**Severity**: S3-Minor
**Priority**: P3-Backlog
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Vault
- **Frequency**: Often (whenever character has stackable items that also exist in vault)
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/vault.service.ts`, lines 404-428
- **Root cause**: Unlike `depositItem` which checks for existing vault items with the same `itemId` and increases quantity, `transferAllToVault` uses `createMany` which always creates new vault item rows. This creates multiple vault entries for the same stackable item (e.g., 3 separate stacks of "Elixir of Life" rather than one combined stack).

---

## BUG-2609: Character name uniqueness only checked per-user, not globally

### Summary
**Title**: Multiple users can create characters with the same name
**ID**: BUG-2609
**Severity**: S3-Minor
**Priority**: P3-Backlog
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Character Creation
- **Frequency**: Always (when different users pick the same name)
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/character.service.ts`, lines 25-33
- **Root cause**: The name uniqueness check queries `prisma.character.findMany({ where: { userId } })` and then checks `.some(c => c.name === name)`. This only prevents the SAME user from having duplicate names. If global uniqueness is intended (as is typical for MMO-style games), this needs a cross-user check.

### Recommended Fix
If global uniqueness is desired, query all characters for the name (case-insensitive) or add a unique index on the `name` column in Prisma schema.

---

## BUG-2610: Referral code generation can produce collisions

### Summary
**Title**: Random 8-character referral codes have no collision check
**ID**: BUG-2610
**Severity**: S3-Minor
**Priority**: P3-Backlog
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Network
- **System**: Quest / Referral
- **Frequency**: Rare (<10%) -- probability increases with user count
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/quest.service.ts`, lines 354-375 and 418-425
- **Root cause**: `generateReferralCode` and the code generation in `useReferralCode` generate random 8-character codes without checking if the code already exists. The `referralCode` column has a `@unique` constraint in Prisma schema, so a collision would throw an unhandled Prisma unique constraint error (P2002), returning a 500 to the client.

### Recommended Fix
Add a retry loop: generate code, attempt insert, catch unique constraint error, regenerate.

---

## BUG-2611: `useConsumable` does not use a transaction

### Summary
**Title**: Consumable use can desync resources and item quantity on concurrent requests
**ID**: BUG-2611
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Character / Inventory
- **Frequency**: Rare (<10%) -- requires rapid concurrent consumable use
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/character.service.ts`, lines 462-508
- **Root cause**: `useConsumable` performs three separate DB operations: (1) update character resources (line 483), (2) update/delete inventory item (lines 488-494), and (3) loadFullCharacter. If the server crashes or two requests race, resources can be applied without consuming the item, or vice versa.

### Recommended Fix
Wrap the resource update and item consumption in a `prisma.$transaction`.

---

## BUG-2612: `enhanceInventoryItem` consumes crystal outside transaction

### Summary
**Title**: Enhancement crystal consumed even if subsequent operations fail
**ID**: BUG-2612
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Character / Enhancement
- **Frequency**: Rare (<10%) -- requires server error during enhancement
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/character.service.ts`, lines 649-709
- **Root cause**: The crystal is consumed at lines 650-657 (outside any transaction). The success/failure roll and subsequent item update (lines 659-708) are separate operations. If the server crashes after consuming the crystal but before applying the enhancement result, the crystal is lost with no effect.

### Recommended Fix
Wrap the entire enhancement flow (crystal consumption + roll + item update/delete) in a single `prisma.$transaction`.

---

## Previously Fixed Bugs -- Confirmed Resolved

| Previous Bug | Status |
|---|---|
| Creation token consumed before validation | FIXED -- validation now precedes token consumption (lines 25-33 before 36-39) |
| Vault deposit/withdraw not atomic | FIXED -- both use `prisma.$transaction` |
| Vendor purchase not atomic | FIXED -- uses `prisma.$transaction` (line 305) |
| Inventory slot collision on move | FIXED -- swap logic correctly handles occupier (lines 438-451) |
| Quest reward routing (gold to char, arcanite to vault) | FIXED -- gold/xp to character (line 169), arcanite to vault (line 188) |
| Optimistic token deduction | FIXED -- token consumed after validation (line 36-39) |
| Spin vault creation (create if missing) | FIXED -- vault created in transaction if missing (lines 106-109) |
| Vendor inventory pre-check before currency deduction | FIXED -- space checked before currency (lines 273-286) |

---

## Summary Table

| ID | Severity | Service | Title |
|---|---|---|---|
| BUG-2601 | S2-Major | marketplace | Stale resources written inside transaction (race condition) |
| BUG-2604 | S2-Major | character-helpers | `maxSlots` hardcoded to 40, ignoring level/battle pass |
| BUG-2605 | S2-Major | stat-calculator | Equipment primary stats double-counted in derived stats via gem socketing |
| BUG-2606 | S3-Minor | marketplace | createListing/cancelListing not atomic (item duplication on crash) |
| BUG-2603 | S3-Minor | vault | withdrawItem missing PVP zone check |
| BUG-2607 | S3-Minor | vault | transferAllToVault ignores vault maxSlots |
| BUG-2608 | S3-Minor | vault | transferAllToVault does not consolidate stackable items |
| BUG-2609 | S3-Minor | character | Character name uniqueness only per-user, not global |
| BUG-2610 | S3-Minor | quest | Referral code generation has no collision handling |
| BUG-2611 | S3-Minor | character | useConsumable not transactional |
| BUG-2612 | S3-Minor | character | enhanceInventoryItem consumes crystal outside transaction |

**Total: 11 bugs (3 S2-Major, 8 S3-Minor)**
