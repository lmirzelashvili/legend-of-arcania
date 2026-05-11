# Bug Analysis Report -- Server Services & Client Components

**Date**: 2026-03-31
**Scope**: character.service.ts, marketplace.service.ts, vendor.service.ts, vault.service.ts, quest.service.ts, wallet.service.ts, CharacterSheet.tsx, InventoryPanel.tsx, Marketplace.tsx, VaultPanel.tsx
**Type**: Static code analysis (no files edited)

---

## BUG-0001: Creation token consumed before character limit check (character.service.ts)

**Severity**: S2-Major
**Category**: Gameplay / Economy
**File**: `arcania-server/src/services/character.service.ts`, lines 25-37

### Description
In `createCharacter()`, the creation token is decremented on line 31 **before** the character count limit is checked on lines 34-37. If a user already has 5 characters, the token is consumed but the character creation fails with "Maximum 5 characters allowed". The token is permanently lost.

### Trigger Scenario
1. User has 5 characters and at least 1 creation token.
2. User attempts to create a 6th character.
3. Token is consumed, then the function throws AppError(400).
4. Token is gone; no character was created.

### Recommended Fix
Move the character-count check (lines 34-37) **above** the token consumption (lines 25-32), or wrap both in a transaction that rolls back on failure.

---

## BUG-0002: Character name uniqueness check is per-user, not global (character.service.ts)

**Severity**: S3-Minor
**Category**: Gameplay
**File**: `arcania-server/src/services/character.service.ts`, lines 34-40

### Description
`nameTaken` checks only `existing` (the current user's characters). Two different users can create characters with the same name. This may or may not be intentional, but if globally unique names are desired, this is a bug.

### Recommended Fix
If global uniqueness is required, query `prisma.character.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } })`.

---

## BUG-0003: Race condition -- creation token decrement is not atomic (character.service.ts)

**Severity**: S2-Major
**Category**: Network / Race Condition
**File**: `arcania-server/src/services/character.service.ts`, lines 25-32

### Description
The wallet is read on line 25, then decremented on line 31 using `wallet.creationTokens - 1`. If two concurrent requests arrive, both can read `creationTokens = 1`, both pass the check, and both decrement to 0, effectively double-spending the token. The same pattern exists in `wallet.service.ts` `useCreationToken()` (line 148-158) and `performSpin()` (line 69-83).

### Recommended Fix
Use an atomic decrement: `{ creationTokens: { decrement: 1 } }` with Prisma, or wrap the entire operation in a serializable transaction.

---

## BUG-0004: Unequip + inventory add is not transactional (character.service.ts)

**Severity**: S3-Minor
**Category**: Gameplay / Data Integrity
**File**: `arcania-server/src/services/character.service.ts`, lines 330-364

### Description
In `unequipItem()`, `inventoryItem.create`, `equipmentSlotRow.delete`, and `recalculateStats` are three separate database calls with no transaction wrapper. If the delete succeeds but recalculateStats fails (or vice versa), the character state can become inconsistent. Contrast with `equipItem()` which correctly uses `prisma.$transaction()`.

### Recommended Fix
Wrap the unequip operation in `prisma.$transaction()`, similar to the equipItem function.

---

## BUG-0005: moveInventoryItem does not check for slot collision (character.service.ts)

**Severity**: S2-Major
**Category**: Gameplay
**File**: `arcania-server/src/services/character.service.ts`, lines 368-389

### Description
`moveInventoryItem()` moves an item to `toSlot` by setting its `gridX`/`gridY` coordinates, but never checks whether another item already occupies that slot. This silently overwrites the grid coordinates, causing two items to occupy the same visual slot. The underlying data is not lost (both DB rows exist), but the UI will only render one item per slot, making the other invisible.

### Recommended Fix
Before updating, query for any item already at the target gridX/gridY. If one exists, either swap positions or reject the move.

---

## BUG-0006: Enhancement crystal consumed before success roll -- no atomicity on failure path (character.service.ts)

**Severity**: S3-Minor
**Category**: Gameplay / Data Integrity
**File**: `arcania-server/src/services/character.service.ts`, lines 578-637

### Description
In `enhanceInventoryItem()`, the crystal is consumed (lines 579-586) before the success roll (line 589). If the server crashes between consuming the crystal and writing the enhancement result, the crystal is lost and no enhancement outcome is recorded. The entire enhance flow (consume crystal + roll + apply result) should be a single transaction.

### Recommended Fix
Wrap lines 578-637 in a `prisma.$transaction()`.

---

## BUG-0007: Vendor purchaseItem deducts currency before adding item -- partial failure possible (vendor.service.ts)

**Severity**: S2-Major
**Category**: Economy / Data Integrity
**File**: `arcania-server/src/services/vendor.service.ts`, lines 290-358

### Description
In `purchaseItem()`, currency is deducted from the character (lines 296/304) with `prisma.character.update()`, then the item is added to inventory in separate DB calls (lines 308-349). If the item-addition fails (e.g., DB error), the gold/arcanite is already gone. There is no transaction wrapping the entire operation.

Additionally, for non-stackable purchases with `quantity > 1`, the loop (lines 328-349) creates items one at a time. If it fails mid-loop, some items are added and currency is fully deducted, but not all items are delivered.

### Recommended Fix
Wrap the entire purchase flow (currency deduction + item creation) in `prisma.$transaction()`.

---

## BUG-0008: Vendor special purchase "character_slot" does nothing (vendor.service.ts)

**Severity**: S2-Major
**Category**: Gameplay
**File**: `arcania-server/src/services/vendor.service.ts`, lines 402-409

### Description
The `character_slot` special action deducts arcanite and returns a success message ("Character slot unlocked!"), but does not actually increase the user's character slot limit anywhere. The `createCharacter()` function in character.service.ts hardcodes `existing.length >= 5`. Purchasing this item has no effect.

### Recommended Fix
Either store a `maxCharacters` field on the user/wallet model and increment it here, or remove this vendor item until the feature is implemented.

---

## BUG-0009: Vault upgrade does not check if already at target tier (vault.service.ts)

**Severity**: S3-Minor
**Category**: Economy
**File**: `arcania-server/src/services/vault.service.ts`, lines 195-231

### Description
`upgradeVault()` allows upgrading to any tier, including the current tier or a lower tier. A user could pay for `VaultTier.EXPANDED` when they already have it, re-paying the gold cost and resetting `purchasedExpandedAt`. There is no check like `if (vault.tier >= requestedTier)`.

The EXPANDED tier deducts gold from character resources, but the PREMIUM tier does NOT deduct any currency at all (no payment check for premium), potentially allowing free premium upgrades if called directly.

### Recommended Fix
Add tier ordering validation and ensure PREMIUM tier requires appropriate payment.

---

## BUG-0010: Vault deposit/withdraw not transactional (vault.service.ts)

**Severity**: S3-Minor
**Category**: Data Integrity
**File**: `arcania-server/src/services/vault.service.ts`, lines 48-122, 124-193

### Description
`depositItem()` and `withdrawItem()` perform multiple separate DB operations (add to vault, remove from inventory or vice versa) without a transaction. If the server crashes between operations, items can be duplicated (added to vault but not removed from inventory) or lost (removed from inventory but not added to vault).

### Recommended Fix
Wrap each operation's DB calls in `prisma.$transaction()`.

---

## BUG-0011: Spin reward silently lost if vault does not exist (wallet.service.ts)

**Severity**: S2-Major
**Category**: Economy
**File**: `arcania-server/src/services/wallet.service.ts`, lines 104-128

### Description
In `performSpin()`, gold and arcanite rewards are deposited into the user's vault (lines 106-128). However, the code checks `if (vault)` and silently skips the deposit if no vault exists. The spin is consumed and the response reports `goldDeposited: 0` / `arcaniteDeposited: 0`, but the user has no indication why their reward was lost. A new user who has never accessed the vault screen (which auto-creates the vault) will lose all spin rewards.

### Recommended Fix
Create the vault if it doesn't exist (like `loadVault()` does in vault.service.ts), or use `upsert`.

---

## BUG-0012: Quest reward applied to first character only, ignoring active character (quest.service.ts)

**Severity**: S2-Major
**Category**: Gameplay
**File**: `arcania-server/src/services/quest.service.ts`, lines 138-143

### Description
`claimReward()` applies gold and XP rewards to `prisma.character.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } })` -- always the user's oldest character. There is no parameter for which character should receive the reward. If the user's active character is their 3rd created character, gold and XP go to the wrong one.

### Recommended Fix
Accept a `characterId` parameter and apply rewards to the specified character.

---

## BUG-0013: Referral code collision possible (quest.service.ts)

**Severity**: S3-Minor
**Category**: Data Integrity
**File**: `arcania-server/src/services/quest.service.ts`, lines 362-376, 419-423

### Description
Referral codes are generated as 8 random alphanumeric characters with no uniqueness check. With enough users, two codes could collide. `useReferralCode()` uses `findUnique({ where: { referralCode: code } })`, which would return the wrong referrer if codes collide.

### Recommended Fix
Add a unique constraint on `referralCode` in the DB schema (if not already present) and retry on collision.

---

## BUG-0014: Marketplace createListing is not transactional (marketplace.service.ts)

**Severity**: S2-Major
**Category**: Economy / Data Integrity
**File**: `arcania-server/src/services/marketplace.service.ts`, lines 132-268

### Description
In `createListing()`, the item is removed from inventory/vault (lines 170-176 / 199-205) in separate operations from the listing creation (line 236). If listing creation fails after item removal, the item is lost. Similarly, if the server crashes between these operations, the item disappears without a listing being created.

### Recommended Fix
Wrap item removal + listing creation in `prisma.$transaction()`.

---

## BUG-0015: Marketplace purchase pre-checks currency outside transaction, then modifies resources object (marketplace.service.ts)

**Severity**: S3-Minor
**Category**: Race Condition
**File**: `arcania-server/src/services/marketplace.service.ts`, lines 455-468, 471-479

### Description
In `purchaseListing()`, the `resources` object is mutated (gold/arcanite decremented) outside the transaction on lines 460/466, then passed into the transaction on line 478. If the same character makes two concurrent purchases, both read the same resources balance, both pass the check, and both deduct. The transaction does re-check the listing existence (line 473), but does NOT re-read the character's resources -- it uses the stale, pre-mutated object.

### Recommended Fix
Move the resource read + validation + mutation inside the transaction callback, re-fetching `character.resources` within the `tx` context.

---

## BUG-0016: NPC marketplace listings never deplete stock (marketplace.service.ts)

**Severity**: S3-Minor (possibly by design)
**Category**: Gameplay
**File**: `arcania-server/src/services/marketplace.service.ts`, line 533

### Description
When `freshListing.source !== 'npc'`, the listing is deleted. NPC listings are never deleted, meaning they have infinite stock. If this is intentional, the `quantity` field on NPC listings is misleading. If not intentional, NPC listings should have their quantity decremented.

---

## BUG-0017: Client InventoryPanel references nonexistent `endurance` field (InventoryPanel.tsx)

**Severity**: S3-Minor
**Category**: UI
**File**: `arcania-client/src/components/Character/InventoryPanel.tsx`, line 429

### Description
The InventoryPanel displays `selectedItem.item.endurance` (line 429), but according to the project memory, the `Item` type does NOT have an `endurance` field. This will always render as falsy (no visible bug), but it is dead code referencing a nonexistent property and could cause TypeScript errors.

### Recommended Fix
Remove the endurance stat line.

---

## BUG-0018: CharacterSheet inventory selection compares item.id instead of inventory slot id (CharacterSheet.tsx)

**Severity**: S3-Minor
**Category**: UI
**File**: `arcania-client/src/components/Character/CharacterSheet.tsx`, line 593

### Description
`isSelected={selectedItem?.item.id === item?.item.id}` compares the **item definition ID**, not the inventory row ID. If a player has two copies of the same item (e.g., two "Iron Sword" with the same item.id), selecting one visually highlights both. The inventory slot `item.id` (the DB row ID) should be used instead.

### Recommended Fix
Change to `isSelected={selectedItem?.id === item?.id}`.

---

## BUG-0019: CharacterSheet deposits entire item stack without quantity selection (CharacterSheet.tsx)

**Severity**: S3-Minor
**Category**: UI / UX
**File**: `arcania-client/src/components/Character/CharacterSheet.tsx`, line 144

### Description
`handleDepositToVault()` always deposits `item.quantity` (the full stack). Unlike the InventoryPanel which has a `depositQuantity` state with a number input, CharacterSheet has no quantity selector. If a user has 50 potions and wants to deposit 10, they must use the InventoryPanel tab instead.

### Recommended Fix
Add a quantity input similar to InventoryPanel, or at minimum deposit quantity of 1 when the user clicks "TO VAULT".

---

## BUG-0020: CharacterSheet useEffect dependency causes stale data on prop change (CharacterSheet.tsx)

**Severity**: S3-Minor
**Category**: UI / State
**File**: `arcania-client/src/components/Character/CharacterSheet.tsx`, lines 34-36

### Description
The second `useEffect` on line 34-36 runs when `propCharacter` changes, but sets character to `storeCharacter || propCharacter`. The `storeCharacter` reference is captured at render time, not at effect time, so this can result in stale data. Also, `storeCharacter` is not listed in the dependency array, which means React's exhaustive-deps rule is violated.

### Recommended Fix
Either include `storeCharacter` in the dependency array, or simply use `propCharacter` directly in this effect since it is the prop-change handler.

---

## BUG-0021: VaultPanel renders only first 50 items, hiding the rest (VaultPanel.tsx)

**Severity**: S3-Minor
**Category**: UI
**File**: `arcania-client/src/components/Vault/VaultPanel.tsx`, line 281

### Description
The vault grid renders `Math.min(50, maxSlots)` slots, and items beyond index 50 are only shown as a "+N more items..." text indicator (line 326). Users cannot interact with, select, or withdraw items beyond slot 50. Since maxSlots can be up to 200, up to 150 items could be inaccessible.

### Recommended Fix
Add pagination or a scrollable grid that renders all items.

---

## BUG-0022: VaultPanel filter hides items from grid slots but not from slot count (VaultPanel.tsx)

**Severity**: S3-Minor
**Category**: UI
**File**: `arcania-client/src/components/Vault/VaultPanel.tsx`, lines 281-322

### Description
The grid renders a fixed number of slot divs (up to 50), then maps `filteredItems[index]` into them. When a filter is active, `filteredItems` is a subset of `vault.items`, but the grid still renders the same number of empty slots. Items at the end of the filtered list may appear at different positions than their actual vault slots, which is confusing. The `usedSlots` counter on line 214 shows unfiltered count, which is also inconsistent with what is displayed.

---

## BUG-0023: Marketplace BrowseTab fires loadListings on mount AND on every filter change (Marketplace.tsx)

**Severity**: S4-Trivial
**Category**: Performance
**File**: `arcania-client/src/components/Marketplace/Marketplace.tsx`, lines 97-133

### Description
Two `useEffect` hooks both call `loadListings()`: the mount effect on line 97-99 and the filter-change effect on lines 131-133. On initial render, `loadListings()` fires twice -- once from the mount effect, and once because all filter states are initialized (triggering the deps-change effect). This results in a redundant API call on component mount.

### Recommended Fix
Remove the mount effect (lines 97-99) since the filter-change effect already fires on mount.

---

## BUG-0024: Marketplace SellTab fee calculation can produce NaN (Marketplace.tsx)

**Severity**: S4-Trivial
**Category**: UI
**File**: `arcania-client/src/components/Marketplace/Marketplace.tsx`, lines 325-327

### Description
`parseInt(price)` returns `NaN` when `price` is a non-numeric string (e.g., empty string passed to `parseInt`). The code checks `if (price)` first, but `"0"` is truthy and `parseInt("0")` is 0, so `fee = Math.ceil(0 * 0.05) = 0` and `youReceive = 0 - 0 = 0`, which is fine. However, if the user types a letter character, `parseInt("a") = NaN`, and `Math.ceil(NaN * 0.05) = NaN` will display "NaN" in the fee preview.

### Recommended Fix
Use `parseInt(price) || 0` for safer handling.

---

## BUG-0025: Marketplace cancel returns item to bag by default when characterId is passed, but to vault when not -- user has no choice in UI (Marketplace.tsx)

**Severity**: S3-Minor
**Category**: UX
**File**: `arcania-client/src/components/Marketplace/Marketplace.tsx`, line 596; `arcania-server/src/services/marketplace.service.ts`, line 272

### Description
The `handleCancel` on line 596 always passes `character.id`, meaning cancelled items always go to the character's bag. There is no option to return them to the vault. If the character's bag is full, the cancellation fails. The server supports vault return (by omitting `characterId`), but the UI never exposes this option.

### Recommended Fix
Add a UI toggle or fallback logic: try returning to bag first, and if full, fall back to vault.

---

## Summary

| ID | Severity | Component | Category |
|----|----------|-----------|----------|
| BUG-0001 | S2-Major | character.service | Token consumed before validation |
| BUG-0002 | S3-Minor | character.service | Name uniqueness scope |
| BUG-0003 | S2-Major | character.service, wallet.service | Race condition on token/spin |
| BUG-0004 | S3-Minor | character.service | Missing transaction on unequip |
| BUG-0005 | S2-Major | character.service | Inventory slot collision |
| BUG-0006 | S3-Minor | character.service | Enhancement not transactional |
| BUG-0007 | S2-Major | vendor.service | Purchase not transactional |
| BUG-0008 | S2-Major | vendor.service | Character slot purchase is no-op |
| BUG-0009 | S3-Minor | vault.service | Vault upgrade allows downgrade/re-buy |
| BUG-0010 | S3-Minor | vault.service | Deposit/withdraw not transactional |
| BUG-0011 | S2-Major | wallet.service | Spin rewards lost without vault |
| BUG-0012 | S2-Major | quest.service | Rewards go to wrong character |
| BUG-0013 | S3-Minor | quest.service | Referral code collision |
| BUG-0014 | S2-Major | marketplace.service | Listing creation not transactional |
| BUG-0015 | S3-Minor | marketplace.service | Race condition on purchase |
| BUG-0016 | S3-Minor | marketplace.service | NPC listings infinite stock |
| BUG-0017 | S3-Minor | InventoryPanel.tsx | Dead `endurance` reference |
| BUG-0018 | S3-Minor | CharacterSheet.tsx | Selection highlights duplicates |
| BUG-0019 | S3-Minor | CharacterSheet.tsx | No partial-stack vault deposit |
| BUG-0020 | S3-Minor | CharacterSheet.tsx | Stale state in useEffect |
| BUG-0021 | S3-Minor | VaultPanel.tsx | Items beyond 50 inaccessible |
| BUG-0022 | S3-Minor | VaultPanel.tsx | Filter/slot mismatch |
| BUG-0023 | S4-Trivial | Marketplace.tsx | Double API call on mount |
| BUG-0024 | S4-Trivial | Marketplace.tsx | NaN in fee preview |
| BUG-0025 | S3-Minor | Marketplace.tsx | No vault return on cancel |

**S2-Major bugs (highest priority)**: BUG-0001, BUG-0003, BUG-0005, BUG-0007, BUG-0008, BUG-0011, BUG-0012, BUG-0014
