# Bug Report -- New Server Services Analysis

**Date**: 2026-03-31
**Scope**: box.service.ts, forging.service.ts, character.service.ts (useScroll + enhancement), quest.service.ts (resetRepeatableQuests)
**Type**: Static analysis (research only -- no edits)

---

## BUG-0001: Enhancement consumes crystal BEFORE rolling, with no transaction boundary

**File**: `character.service.ts` lines 723-819
**Severity**: S1-Critical
**Category**: Data Integrity / Race Condition

### Description
The `enhanceInventoryItem` function consumes the crystal (lines 723-731), clears scroll flags (lines 746-753), and then rolls for success (line 755) -- all as **separate, non-transactional database calls**. If the server crashes or the database connection drops between consuming the crystal and writing the enhancement result, the player permanently loses the crystal (and scroll flags) with no outcome applied.

### Reproduction Scenario
1. Player initiates enhancement with a Crystal of Dominion and active Protection scroll.
2. Crystal is deleted from inventory (line 730).
3. Scroll flags are cleared from resources (line 752).
4. Server crashes before the success/failure branch writes results.
5. Player reloads: crystal is gone, scroll flags are gone, item is unchanged.

### Recommended Fix
Wrap the entire `enhanceInventoryItem` function body (from crystal consumption through result application) in a single `prisma.$transaction()`.

---

## BUG-0002: Scroll flags persist indefinitely if no enhancement is ever attempted

**File**: `character.service.ts` lines 546-561
**Severity**: S2-Major
**Category**: Data Integrity

### Description
`useScroll` sets `resources.hasProtectionScroll = true` or `resources.enhancementBonus = 10` on the character's resources JSON. These flags are only cleared inside `enhanceInventoryItem` (lines 746-753). If the player uses a scroll and then never enhances (or logs out, switches characters, etc.), the flags remain in the resources JSON forever.

Consequences:
- **Stacking**: A player could use multiple Empowerment scrolls. Each call sets `enhancementBonus = 10`, so this specific value does not stack. However, because the flag is never cleared except during enhancement, it effectively gives an unlimited-duration buff.
- **Cross-session persistence**: The flag survives server restarts, logouts, and character switches since it is stored in the DB JSON column.
- **Resurrection scroll**: `hasResurrectionScroll` (line 542) is set but there is no visible code in this file that ever clears it, meaning it may persist indefinitely as well.

### Recommended Fix
Add expiration timestamps to scroll effects (e.g., `protectionScrollExpiresAt: Date.now() + 3600000`), or clear all scroll flags on login/character-load, or implement a separate scroll-effect table with TTL.

---

## BUG-0003: Race condition -- double scroll usage

**File**: `character.service.ts` lines 512-582
**Severity**: S2-Major
**Category**: Race Condition

### Description
`useScroll` reads `invItem.quantity`, then later decrements it (lines 567-574), with a character update in between (lines 533-561). There is no transaction wrapping these operations. If two concurrent requests hit `useScroll` for the same scroll stack:

1. Request A reads `quantity = 1`.
2. Request B reads `quantity = 1`.
3. Both set the flag on resources.
4. Request A deletes the inventory item.
5. Request B tries to delete the same item -- either crashes or silently fails.

Net result: one scroll consumed, but the flag was set twice (or one request errors out after the flag is already set).

### Recommended Fix
Wrap the entire `useScroll` function in a transaction, or use optimistic concurrency (version field) on the inventory item.

---

## BUG-0004: Box opening -- crash after `pickRandom` on empty array

**File**: `box.service.ts` lines 103-105, 213-218
**Severity**: S2-Major
**Category**: Crash / Unhandled Edge Case

### Description
`pickRandom` does `arr[Math.floor(Math.random() * arr.length)]`. If `arr.length === 0`, this returns `arr[NaN]` which is `undefined`. This feeds into `rollFromTemplate(undefined)` which will throw a confusing runtime error.

The fallback path on line 197 checks `if (equipTemplates.length === 0)` and tries a broader search, but if that broader search also returns empty (e.g., no templates loaded/seeded), it falls through to line 214 where `pickRandom(equipTemplates)` is called on an empty array -- the fallback does NOT return early, it falls through.

### Reproduction Scenario
1. No item templates are seeded at the target tier.
2. Fallback `allEquip` also ends up empty (or template seeding is partially incomplete).
3. `pickRandom([])` returns `undefined`, crashing `rollFromTemplate`.

### Recommended Fix
After the fallback block (lines 197-212), add a guard: `if (equipTemplates.length === 0) throw new AppError(500, 'No templates available for reward generation');` -- or make the fallback block `return` the result instead of falling through.

---

## BUG-0005: Forging -- inventory snapshots go stale inside transaction

**File**: `forging.service.ts` lines 276-288, 328-346
**Severity**: S2-Major
**Category**: Data Integrity

### Description
The `inventoryByTemplate` map is built OUTSIDE the transaction (line 279), using a snapshot of inventory items. Inside the transaction (line 328), this stale snapshot is used to locate and consume materials. If another concurrent request modifies the inventory between the snapshot read and the transaction execution, the transaction may:

- Delete an inventory item that was already deleted (Prisma throws `RecordNotFound`).
- Update a quantity using a stale value, potentially going negative.
- Consume more materials than the player actually has.

### Recommended Fix
Move the inventory load and `inventoryByTemplate` construction inside the transaction callback, using `tx.inventoryItem.findMany` instead of the pre-transaction `prisma.inventoryItem.findMany`.

---

## BUG-0006: Forging -- success rate can exceed 100% due to crystal bonus math

**File**: `forging.service.ts` lines 302-304
**Severity**: S3-Minor
**Category**: Gameplay Logic

### Description
The crystal bonus is calculated as:
```
crystalBonus = spiritExtra * 0.5 + dominionExtra * 1.0
successRate = Math.min(recipe.baseSuccessRate + crystalBonus / 100, 1.0)
```
With `spiritExtra = 30` and `dominionExtra = 20`, `crystalBonus = 35`. So `crystalBonus / 100 = 0.35`. Added to a base rate of 0.60 (Tier 1) = 0.95, which is fine. But this means a Tier 1 recipe with max crystals gets 95% success, while Tier 5 (base 0.05) with max crystals gets 40% -- this may be intended.

However, the `Math.min(..., 1.0)` clamp works correctly. This is technically not a bug but worth noting that the design allows players to push success rates significantly with crystals. No code fix needed unless this exceeds design intent.

**Actual concern**: The clamping to `maxQty` on line 259-260 uses client-provided values. A malicious client could send `spiritCount: 999999` and it gets clamped to 30 -- this is correct. But there is no server-side verification that the player actually *has* 30 spirit crystals until line 291-298, which is also correct. No bug here, but worth documenting the trust boundary.

---

## BUG-0007: Quest reset -- `claimedAt` and `completedAt` not cleared on reset

**File**: `quest.service.ts` lines 346-351
**Severity**: S2-Major
**Category**: Data Integrity

### Description
When `resetRepeatableQuests` resets quests, it uses `updateMany` to set `status: 'AVAILABLE', progress: 0` but does NOT clear `claimedAt` or `completedAt`. On the next cycle:

1. The quest is reset to AVAILABLE with `progress: 0`.
2. Player completes it again, and `claimedAt` gets a new timestamp.
3. But old `completedAt` may linger if the quest uses `completedAt` for any display/logic.

More critically, the reset logic on line 335 checks `if (!pq.claimedAt) continue;` -- meaning any repeatable quest that was completed but not yet claimed will NEVER be reset (it will be stuck in COMPLETED status with null `claimedAt`). This could happen if a player completes a daily quest right before reset but does not claim it.

### Recommended Fix
```typescript
data: { status: 'AVAILABLE', progress: 0, claimedAt: null, completedAt: null }
```
Also consider handling quests with status COMPLETED but null `claimedAt` (treat them as claimable still, or reset them anyway).

---

## BUG-0008: Quest reset -- timezone sensitivity in `todayString()`

**File**: `quest.service.ts` lines 45-47
**Severity**: S3-Minor
**Category**: Date Boundary

### Description
`todayString()` uses `new Date().toISOString().slice(0, 10)` which always returns the date in **UTC**. The login streak comparison on line 235 uses `streak.lastLoginDate === today`, where `lastLoginDate` is stored as the output of `todayString()` (UTC).

This means daily resets occur at UTC midnight, not the player's local midnight. A player in UTC+12 (e.g., New Zealand) would see their daily quests reset at noon local time, while a player in UTC-12 would see resets at midnight-24h.

This is consistent (all in UTC) and not strictly a bug, but could be confusing for players. The weekly reset calculation (lines 326-329) also uses UTC, which is consistent.

**Not a bug**, but worth documenting as a design decision.

---

## BUG-0009: Box opening -- `availableSlots` calculation can be wrong for stackable rewards

**File**: `box.service.ts` lines 246-251
**Severity**: S3-Minor
**Category**: Edge Case

### Description
The capacity check assumes every reward needs its own slot (`availableSlots < rewardCount`). However, rewards can be stackable (consumables, crystals, gems). If a reward is stackable AND the player already has a stack of that item, it does not consume a new slot. The actual insertion loop (lines 276-285) correctly handles stacking, but the pre-check (line 249) is overly conservative.

Impact: The player may be told "not enough inventory space" even though they have room because some rewards would stack onto existing items. This is a false negative -- the player is blocked from opening a box they could actually open.

### Recommended Fix
Either accept the conservative check (it is safe, just overly strict), or do a more accurate pre-check that accounts for potential stacking.

---

## BUG-0010: Enhancement -- race condition on concurrent enhancement attempts

**File**: `character.service.ts` lines 680-820
**Severity**: S1-Critical
**Category**: Race Condition

### Description
Two concurrent enhancement requests on the same item can both read the item at the same enhancement level, both consume a crystal, and both attempt to write results. Since there is no locking or transaction:

1. Request A reads item at +5, crystal quantity = 2.
2. Request B reads item at +5, crystal quantity = 2.
3. Request A consumes 1 crystal (qty -> 1), succeeds, writes item as +6.
4. Request B consumes 1 crystal (qty -> 0), succeeds, writes item as +6 (overwriting A's result).

Net result: 2 crystals consumed, but only 1 enhancement level gained. Or worse, both could read the same crystal at quantity 1, and the second delete would fail.

Additionally, both requests read `resources.enhancementBonus` and `hasProtectionScroll`, so both could "use" the same scroll effect.

### Recommended Fix
Wrap the entire enhancement flow in a transaction with row-level locking (e.g., `SELECT ... FOR UPDATE` via raw query, or use Prisma's interactive transaction with serializable isolation).

---

## BUG-0011: `useConsumable` -- not wrapped in a transaction

**File**: `character.service.ts` lines 462-508
**Severity**: S3-Minor
**Category**: Data Integrity

### Description
`useConsumable` updates the character's resources (line 483-486) and then separately updates/deletes the inventory item (lines 488-494). If the server crashes between these two operations, the character gets the HP/mana restoration but keeps the consumable.

### Recommended Fix
Wrap both operations in a single `prisma.$transaction()`.

---

## BUG-0012: Forging -- returned materials may fail silently if no empty slot

**File**: `forging.service.ts` lines 370-371
**Severity**: S3-Minor
**Category**: Silent Data Loss

### Description
On forge failure, when returning primary materials, if there is no existing stack to add to AND `findEmptySlot` returns null (line 370), the code silently skips returning materials -- the player loses them with no notification. The `materialsReturned` array would not include this entry, so the response message would not mention the lost materials either.

Wait -- actually, looking more carefully: on line 371 `if (slot)` is checked, and if false, the material return is simply skipped. The `materialsReturned.push` on line 397 is OUTSIDE the if-block, so it would still record the return even though it was not actually performed. This means the response message claims materials were returned when they were not.

### Reproduction Scenario
1. Player has a full inventory (no empty slots).
2. Player forges using materials that fill the last slots.
3. Forge fails; all material stacks were fully consumed (deleted).
4. Return rate says 50 materials should be returned.
5. No existing stack to add to, no empty slot.
6. Materials are silently lost, but the response says they were returned.

### Recommended Fix
Move `materialsReturned.push(...)` inside the success branches (both the existing-stack and new-slot paths), and throw an error or add a warning if materials could not be returned.

---

## BUG-0013: Box opening -- `equipTemplates` fallback path does not return

**File**: `box.service.ts` lines 197-218
**Severity**: S2-Major
**Category**: Crash

### Description
When `equipTemplates.length === 0` at line 197, the fallback block (lines 199-212) runs. If `allEquip.length > 0`, it rolls an item and calls `return itemInstanceToItemData(instance)` -- this correctly returns.

BUT if `allEquip.length === 0` (fallback also empty), execution falls through to line 214 where `pickRandom(equipTemplates)` is called on the ORIGINAL empty array. Since `equipTemplates` is still empty, `pickRandom([])` returns `undefined`, and `rollFromTemplate(undefined, ...)` will throw.

More subtly: even if the fallback block's `allEquip.length > 0` check passes and returns, the code path where `equipTemplates` is NOT empty (line 214) runs unconditionally for the non-fallback case, which is correct. The issue is only when `equipTemplates` IS empty AND `allEquip` is also empty.

### Recommended Fix
Add an early return or throw after the fallback block to prevent falling through to the `pickRandom(equipTemplates)` call on an empty array.

---

## Summary Table

| ID | Severity | File | Issue |
|---|---|---|---|
| BUG-0001 | S1-Critical | character.service.ts | Enhancement lacks transaction -- crystal consumed without atomicity |
| BUG-0002 | S2-Major | character.service.ts | Scroll flags persist indefinitely without enhancement attempt |
| BUG-0003 | S2-Major | character.service.ts | Race condition on concurrent scroll usage |
| BUG-0004 | S2-Major | box.service.ts | `pickRandom` crashes on empty template array |
| BUG-0005 | S2-Major | forging.service.ts | Stale inventory snapshot used inside transaction |
| BUG-0006 | S3-Minor | forging.service.ts | Crystal bonus math (by design, documented) |
| BUG-0007 | S2-Major | quest.service.ts | Repeatable quest reset skips unclaimed quests, does not clear timestamps |
| BUG-0008 | S3-Minor | quest.service.ts | UTC-based resets (by design, documented) |
| BUG-0009 | S3-Minor | box.service.ts | Overly conservative capacity check for stackable rewards |
| BUG-0010 | S1-Critical | character.service.ts | Concurrent enhancement attempts -- double crystal consumption |
| BUG-0011 | S3-Minor | character.service.ts | `useConsumable` not transactional |
| BUG-0012 | S3-Minor | forging.service.ts | Returned materials may be lost silently, response lies about it |
| BUG-0013 | S2-Major | box.service.ts | Fallback path does not early-return, crashes on empty templates |
