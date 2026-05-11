# Final Bug Audit Report

**Date**: 2026-03-31
**Scope**: ALL server services (character, marketplace, vendor, vault, wallet, quest, box, forging) + helpers (stat-calculator, character-helpers, inventory-helpers)
**Auditor**: Claude Code Game Studios
**Type**: FINAL AUDIT (follow-up to BUG_AUDIT_REAUDIT_2026-03-31)

---

## Executive Summary

Of the 11 bugs reported in the prior re-audit:
- **4 have been FIXED** (BUG-2604, BUG-2606, BUG-2611, BUG-2612)
- **7 remain OPEN** (BUG-2601, BUG-2603, BUG-2605, BUG-2607, BUG-2608, BUG-2609, BUG-2610)
- **7 NEW bugs identified** in this final scan

**Total remaining: 14 bugs (4 S2-Major, 10 S3-Minor)**

---

## Previously Reported Bugs -- Status Update

| Prior ID | Severity | Status | Notes |
|---|---|---|---|
| BUG-2601 | S2-Major | STILL OPEN | Marketplace purchase stale resources (confirmed still present, line 369-413) |
| BUG-2603 | S3-Minor | STILL OPEN | Vault withdrawItem missing PVP zone check |
| BUG-2604 | S2-Major | **FIXED** | `loadFullCharacter` now calls `calculateBagCapacity(char.level, char.hasBattlePass)` at line 61 |
| BUG-2605 | S2-Major | STILL OPEN | Equipment primary stats double-counted via gem socketing |
| BUG-2606 | S3-Minor | **FIXED** | createListing (line 181) and cancelListing (line 287) now use `$transaction` |
| BUG-2607 | S3-Minor | STILL OPEN | transferAllToVault ignores vault maxSlots |
| BUG-2608 | S3-Minor | STILL OPEN | transferAllToVault does not consolidate stackable items |
| BUG-2609 | S3-Minor | STILL OPEN | Character name uniqueness only per-user |
| BUG-2610 | S3-Minor | STILL OPEN | Referral code generation no collision check |
| BUG-2611 | S3-Minor | **FIXED** | useConsumable now wrapped in `$transaction` (line 490) |
| BUG-2612 | S3-Minor | **FIXED** | enhanceInventoryItem crystal consumption now inside `$transaction` (line 749+) |

---

## NEW BUG-2701: `createCharacter` token consumption + character creation not atomic

### Summary
**Title**: Creation token consumed but character not created if DB insert fails
**ID**: BUG-2701
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Character Creation
- **Frequency**: Rare (<10%) -- requires DB error during character insert
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/character.service.ts`, lines 36-99
- **Root cause**: The creation token is decremented at line 41-44 (`prisma.accountWallet.update`), then the character is created at line 49-71 (`prisma.character.create`), then starter items at line 75-84, then abilities at line 89-96. These are four separate database operations with no transaction. If the character creation fails (e.g., unexpected constraint violation, DB timeout), the token is already consumed and lost. Worse, if the character is created but starter items fail, the character exists without any inventory.

### Reproduction Steps
**Preconditions**: User has 1 creation token remaining.

1. User submits character creation request.
2. Token is decremented from 1 to 0 (line 41-44).
3. `prisma.character.create` throws an error (e.g., transient DB failure).
4. Token is lost. Character was never created.

**Expected Result**: Token should only be consumed if the entire creation process succeeds.
**Actual Result**: Token consumed, character not created.

### Recommended Fix
Wrap lines 41-96 (token decrement + character create + starter items + abilities) in a single `prisma.$transaction`.

---

## NEW BUG-2702: `deleteCharacter` vault transfer + character deletion not atomic

### Summary
**Title**: Character deletion can orphan items or delete character without vault transfer
**ID**: BUG-2702
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Character / Vault
- **Frequency**: Rare (<10%) -- requires DB error between operations
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/character.service.ts`, lines 173-213
- **Root cause**: `deleteCharacter` first transfers items to vault via `vaultItem.createMany` (line 208), then deletes the character (line 212). These are separate operations. If the server crashes after vault transfer but before character deletion, items are duplicated (exist both in vault and on the character). If the vault transfer fails but the character deletion succeeds (due to cascade), items are lost.

### Recommended Fix
Wrap the vault transfer and character deletion in a single `prisma.$transaction`.

---

## NEW BUG-2703: `learnAbility` and `upgradeAbility` not atomic -- ability point race condition

### Summary
**Title**: Concurrent ability learn/upgrade requests can spend the same ability point twice
**ID**: BUG-2703
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Character / Abilities
- **Frequency**: Rare (<10%) -- requires concurrent requests
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/character.service.ts`
  - `learnAbility`: lines 602-628
  - `upgradeAbility`: lines 630-653
- **Root cause**: Both functions read `char.abilityPoints` outside a transaction (line 606/634), check `< 1`, then perform two separate writes: (1) create/update the ability (line 613/642), (2) decrement abilityPoints (line 622/648). Two concurrent requests both see `abilityPoints = 1`, both pass the check, both create abilities, and both decrement -- resulting in `abilityPoints = -1` and the player getting two abilities for the price of one.

### Reproduction Steps
**Preconditions**: Character has exactly 1 ability point.

1. Client sends two ability learn requests simultaneously.
2. Both read `abilityPoints = 1`, both pass validation.
3. Both create abilities and decrement. Character ends with `abilityPoints = -1`.

**Expected Result**: Second request should fail with "Not enough ability points."
**Actual Result**: Both succeed. Player gains 2 abilities for 1 point.

### Recommended Fix
Wrap the check + ability creation + point decrement in a `prisma.$transaction` with a fresh read of `abilityPoints` inside.

---

## NEW BUG-2704: `vendor.purchaseItem` writes stale resources inside transaction

### Summary
**Title**: Vendor purchase uses stale resources object, same pattern as marketplace BUG-2601
**ID**: BUG-2704
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Vendor
- **Frequency**: Sometimes (10-50%) -- requires concurrent resource mutation
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/vendor.service.ts`, lines 291-308
- **Root cause**: Identical pattern to BUG-2601. The `resources` object is read at line 291 (outside the transaction), gold/arcanite is deducted in-memory at lines 296/302, then the stale object is written to DB inside the transaction at line 308. Any concurrent operation that modifies the character's resources (vault withdraw, consumable use, quest reward, another purchase) between the read and the transaction write will have its changes silently overwritten.
- The same pattern exists in `handleSpecialPurchase` (line 366-407) -- resources are mutated at line 371, then written at line 386/407 without re-reading.

### Recommended Fix
Re-read character resources inside the transaction and apply the deduction there. Or use Prisma's JSON field update with a `$transaction` that reads fresh.

---

## NEW BUG-2705: `vault.upgradeVault` gold deduction not atomic with vault update

### Summary
**Title**: Vault upgrade can deduct gold without upgrading, or upgrade without deducting
**ID**: BUG-2705
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Vault
- **Frequency**: Rare (<10%) -- requires DB failure between operations
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/vault.service.ts`, lines 197-233
- **Root cause**: `upgradeVault` performs two separate DB writes: (1) deduct gold from character at line 218 (`prisma.character.update`), (2) upgrade vault tier at line 230 (`prisma.vault.update`). No transaction wraps these. If the server crashes after deducting gold but before upgrading the vault, the player loses gold with no upgrade. Conversely, if the character update succeeds but the vault update fails, gold is deducted with no tier change.
- Additionally, the function uses a stale `resources` object -- the same read-modify-write pattern that causes BUG-2601/BUG-2704.

### Recommended Fix
Wrap both operations in a `prisma.$transaction`.

---

## NEW BUG-2706: `quest.claimReward` multi-step reward application not atomic

### Summary
**Title**: Quest reward claim can partially apply (gold granted, arcanite lost, or vice versa)
**ID**: BUG-2706
**Severity**: S3-Minor
**Priority**: P2-Next Sprint
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Quests
- **Frequency**: Rare (<10%) -- requires DB error mid-operation
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/quest.service.ts`, lines 113-205
- **Root cause**: `claimReward` performs up to three separate DB operations without a transaction:
  1. Update character resources (gold/xp/level) at line 169.
  2. Update vault arcanite at line 190.
  3. Mark quest as COMPLETED at line 195.

  If the character update succeeds but the vault update fails, the player receives gold/xp but not arcanite. If all updates succeed but marking COMPLETED fails, the player can claim the reward again.
- The function also uses a stale `resources` object (read at line 144, written at line 169), vulnerable to the same race condition as BUG-2601.

### Recommended Fix
Wrap all three operations in a single `prisma.$transaction`.

---

## NEW BUG-2707: `useReferralCode` multi-step reward application not atomic

### Summary
**Title**: Referral code usage can partially complete, granting rewards inconsistently
**ID**: BUG-2707
**Severity**: S3-Minor
**Priority**: P3-Backlog
**Status**: Open
**Reported**: 2026-03-31

### Classification
- **Category**: Gameplay
- **System**: Quests / Referral
- **Frequency**: Rare (<10%) -- requires DB error mid-operation
- **Regression**: No (pre-existing)

### Technical Context
- **File**: `arcania-server/src/services/quest.service.ts`, lines 430-504
- **Root cause**: `useReferralCode` performs six separate DB operations with no transaction:
  1. Update referrer's totalReferrals and referredUsers (line 453).
  2. Update/create current user's referral record (line 463 or 468-477).
  3. Create/find referee's vault and add 5 arcanite (line 480-487).
  4. Create/find referrer's vault and add 10 arcanite (line 490-497).
  5. Update referrer's commissionEarned (line 500).

  A failure at any step leaves the system in an inconsistent state. For example: referrer gets credited in step 1, but arcanite rewards in steps 3-4 fail. Or the referee gets arcanite but the referrer doesn't.
- **Race condition**: Two users simultaneously using the same referral code could both pass the `referredUsers.includes(userId)` check (line 449) since the array is read before either write completes, potentially double-crediting the referrer.

### Recommended Fix
Wrap the entire referral code usage flow in a `prisma.$transaction`.

---

## Full Summary Table

### Remaining Bugs from Prior Audit (7)

| ID | Severity | Service | Title |
|---|---|---|---|
| BUG-2601 | S2-Major | marketplace | Stale resources written inside transaction (race condition) |
| BUG-2605 | S2-Major | stat-calculator | Equipment primary stats double-counted via gem socketing |
| BUG-2603 | S3-Minor | vault | withdrawItem missing PVP zone check |
| BUG-2607 | S3-Minor | vault | transferAllToVault ignores vault maxSlots |
| BUG-2608 | S3-Minor | vault | transferAllToVault does not consolidate stackable items |
| BUG-2609 | S3-Minor | character | Character name uniqueness only per-user |
| BUG-2610 | S3-Minor | quest | Referral code generation no collision check |

### New Bugs Found in Final Audit (7)

| ID | Severity | Service | Title |
|---|---|---|---|
| BUG-2701 | S2-Major | character | createCharacter token + creation not atomic (token lost on failure) |
| BUG-2704 | S2-Major | vendor | Vendor purchase writes stale resources (same pattern as BUG-2601) |
| BUG-2702 | S3-Minor | character | deleteCharacter vault transfer + deletion not atomic |
| BUG-2703 | S3-Minor | character | learnAbility/upgradeAbility race condition on ability points |
| BUG-2705 | S3-Minor | vault | upgradeVault gold deduction not atomic with tier change |
| BUG-2706 | S3-Minor | quest | claimReward multi-step reward not atomic |
| BUG-2707 | S3-Minor | quest | useReferralCode multi-step not atomic + race condition |

### Fixed Since Last Audit (4)

| Prior ID | Fix Summary |
|---|---|
| BUG-2604 | `loadFullCharacter` now uses `calculateBagCapacity()` |
| BUG-2606 | `createListing`/`cancelListing` now wrapped in `$transaction` |
| BUG-2611 | `useConsumable` now wrapped in `$transaction` |
| BUG-2612 | Enhancement crystal consumption now inside `$transaction` |

---

## Priority Recommendation

**Immediate (P1)** -- Fix these first, they cause data loss under normal gameplay:
1. **BUG-2601 + BUG-2704**: Stale resource writes in marketplace and vendor purchases. Every purchase risks overwriting concurrent resource changes. Fix pattern: re-read resources inside the transaction.
2. **BUG-2701**: Creation token lost on character creation failure. Fix: wrap in `$transaction`.
3. **BUG-2605**: Gem socketing double-counts primary stats. Fix: ensure gems only provide derived stat keys, or remove primary-stat-to-derived conversion from `getEquipmentBonuses`.

**Next Sprint (P2)** -- Race conditions and partial operations:
4. BUG-2703: Ability point race condition.
5. BUG-2705: Vault upgrade atomicity.
6. BUG-2706: Quest reward atomicity.
7. BUG-2603: Vault withdraw PVP zone check.
8. BUG-2702: Character deletion atomicity.

**Backlog (P3)** -- Low-frequency edge cases:
9. BUG-2607, BUG-2608: transferAllToVault capacity/stacking.
10. BUG-2609: Global character name uniqueness.
11. BUG-2610: Referral code collision.
12. BUG-2707: Referral code atomicity.
