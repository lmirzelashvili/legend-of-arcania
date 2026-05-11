# Backlog: arcania-server + Database (Service Logic + Schema)

Tasks that require coordinated changes in server services and Prisma schema/migrations.

## Phase 1 — JSON Type Safety

These can be done immediately and make all subsequent database work safer.

- [x] **Add runtime validation to Prisma JSON helpers** — Zod schemas validate all JSON column reads (StatBlock, DerivedStats, ItemData, Position, AbilityData)
- [x] **Type JSON columns with Prisma typed JSON** — not needed; Zod runtime validation is sufficient

## Phase 2 — Transactional Integrity

Depends on Phase 1 (JSON helpers must be reliable before trusting data inside new transactions).

- [x] **Make marketplace enhancement sync atomic** — prevents enhancement of items with active marketplace listings
- [x] **Add quest claim idempotency** — done in Server Phase 2 (updateMany with status guard)
- [x] **Wrap PvP kill recording in transaction** — done in Server Phase 2 ($transaction)
- [x] **Re-verify inventory capacity in transactions** — done in Server Phase 2 (in-tx re-checks)

## Phase 3 — Background Jobs & Automation

Depends on Phase 2 (transactional integrity must be solid before automated processes modify data).

- [x] **Add background job scheduler** — node-cron based scheduler in `src/jobs/scheduler.ts`
- [x] **Implement daily quest reset job** — `src/jobs/daily-quest-reset.ts` runs at UTC midnight
- [x] **Implement weekly quest reset job** — `src/jobs/weekly-quest-reset.ts` runs Monday UTC midnight
- [x] **Implement booster expiry cleanup job** — `src/jobs/booster-cleanup.ts` runs every 5 minutes
- [x] **Implement premium subscription expiry job** — `src/jobs/premium-expiry.ts` runs every hour
- [x] **Implement trade expiry enforcement** — `src/jobs/trade-expiry.ts` runs every 2 minutes
- [x] **Implement battle pass season rotation** — `src/jobs/season-rotation.ts` runs every hour

## Phase 4 — Event-Driven Architecture

Depends on Phase 3 (job scheduler provides infrastructure; event bus needs subscribers).

- [x] **Implement event bus subscribers** — `event-handlers.service.ts` subscribes to combat events for auto achievement tracking
- [x] **Replace manual achievement tracking** — pvp_kills and monsters_killed now auto-detected via event subscribers (manual calls kept for tx-based tracking)
- [x] **Add event persistence / dead-letter** — `FailedEvent` model + `dead-letter.service.ts` persists failed events for replay

## Phase 5 — Data Model Refinements

Lower priority; depends on earlier phases being stable.

- [x] **Normalize referral tracking** — done in Database Phase 3 (ReferralUse relation table)
- [x] **Add marketplace listing expiry** — `expiresAt` field + `jobs/listing-expiry.ts` returns items to vault on expiry
- [x] **Add inventory batch operations** — `utils/inventory-helpers.ts` with `createManyInventoryItems` batch helper
- [x] **Audit and add missing indexes** — PvPStats kills index + additional indexes added
