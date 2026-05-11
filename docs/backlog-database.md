# Backlog: Database (Prisma Schema & Migrations)

- [ ] Add solanaPublicKey field to User model + migration

## Phase 1 — Data Integrity Fixes

These prevent data corruption and orphaned records. No code changes needed beyond schema + migration.

- [x] **Add cascade deletes to Trade model** — Trade.initiatorId and Trade.receiverId need `onDelete: Cascade` to prevent orphaned trades when users are deleted
- [x] **Add unique constraint on Character.name** — `@@unique([name])` added to Character model; case-insensitive check remains at application level
- [x] **Add unique constraint on PlayerQuest claim** — `@@unique([userId, questId])` already exists; double-claim race is a service-level fix (added to backlog-server.md Phase 2)

## Phase 2 — Schema Completeness

Depends on Phase 1 (integrity fixes should be in the same migration batch).

- [x] **Resolve schema migration drift** — all 4 migrations now tracked and applied; migration history fully synced
- [x] **Add @updatedAt to all models** — added to 14 models with DEFAULT CURRENT_TIMESTAMP for existing rows
- [x] **Add index on PlayerQuest.questId** — added for join queries
- [x] **Add composite index on MarketplaceListing** — added (source, requiredLevel, price) index

## Phase 3 — Data Model Improvements

Depends on Phase 2 (schema must be fully migrated first).

- [x] **Normalize Referral.referredUsers** — replaced JSON array with ReferralUse relation table; service updated with atomic increments
- [x] **Add Prisma enums for Race and CharacterClass** — Prisma enums added; types/index.ts re-exports from @prisma/client
- [x] **Add Gender enum to schema** — Gender enum added; data migrated (male→MALE); schema uses Gender @default(MALE)
- [x] **Evaluate soft deletes** — assessed: recommend soft deletes for User, MarketplaceListing, Trade, Character, PvPStats. Implementation deferred to future phase (2-3 day effort, ~50-80 service layer changes)
