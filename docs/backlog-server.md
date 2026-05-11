# Backlog: arcania-server

## Phase 1 — Security & Secrets

Must be done first — these are production risks.

- [x] **Remove .env from repo** — .gitignore already covers .env; manual step needed: `git rm --cached arcania-server/.env` + rotate secrets
- [x] **Add rate limiting on expensive operations** — protect `/forge`, `/characters/:id/enhance`, `/marketplace/listings/:id/purchase`, `/wallet/spin`, `/trades/:id/confirm` with per-user rate limits (not just global IP limit)
- [x] **Move rate limiter to Redis store** ��� replace in-memory `express-rate-limit` store with `rate-limit-redis` to share state across server instances and survive restarts

## Phase 2 — Data Consistency Fixes

These fix race conditions and silent failures that can corrupt game state.

- [x] **Fix quest double-claim race condition** — `quest.service.ts::claimReward()` now uses `updateMany({ where: { id, status: 'CLAIMABLE' } })` with count check inside transaction
- [x] **Fix PvP bestStreak race condition** — wrapped three upserts in `pvp.service.ts::recordKill()` into single `$transaction`
- [ ] **Fix PvP bestStreak stale-read bug** — `recordKill()` compares pre-increment killStreak against bestStreak (Prisma increment returns old value); bestStreak never updates when streak equals best
- [x] **Make stat recalculation transactional** — `recalculateStats()` now accepts optional `tx` param; called inside equip/unequip transactions
- [x] **Re-verify inventory space inside transactions** — added in-tx capacity re-checks in unequipItem, depositItem, withdrawItem
- [x] **Fix achievement tracking reliability** — `trackAchievement()` now accepts optional `tx` param; 5 call sites moved inside transactions; 2 justified fire-and-forget sites remain
- [x] **Handle premium expiry automatically** — `ensurePremiumFresh()` auto-revokes expired subscriptions; `checkPremiumExpiry` middleware created (needs wiring to routes)

## Phase 3 — Input Validation Overhaul

Depends on Phase 2 (data consistency must be solid before standardizing validation).

- [x] **Migrate to Zod validation** — 10 schema files created in `src/schemas/`; all 10 route files migrated from manual validation to `.parse()`
- [x] **Add Gender validation** — gender validated via Zod schema; service maps to Gender enum
- [x] **Validate nested JSON objects** — trade offers, forge crystals, marketplace listings validated via Zod schemas
- [x] **Add URL parameter format validation** — covered by Zod schemas where applicable

## Phase 4 — API Standardization

Depends on Phase 3 (validation overhaul establishes patterns that response shapes should follow).

- [x] **Standardize API response format** — `utils/response.ts` with `success()` + `paginated()` helpers; applied to GET /characters and marketplace endpoints
- [x] **Move error-log route logic to service** — extracted to `services/error-log.service.ts`
- [x] **Move internal route orchestration to service** — extracted to `services/internal.service.ts`

## Phase 5 — Observability & Operations

- [x] **Add request logging middleware** — pino-based `middleware/request-logger.ts` logs method, path, status, duration, userId
- [x] **Add structured logging** — `config/logger.ts` with pino; replaced console calls in index.ts, errors.ts
- [x] **Add request ID / correlation ID** — UUID per request via `req.requestId`, attached to all log entries
- [x] **Add audit logging** — `services/audit.service.ts` with `auditLog()` for structured audit entries

## Phase 6 — Balance & Config Extraction

- [x] **Extract stat multipliers to config** — `config/balance/stat-multipliers.ts` with STAT_MULTIPLIERS, BASE_DERIVED, LEVEL_SCALING
- [x] **Extract enhancement rates to config** — `config/balance/enhancement.ts`
- [x] **Extract forging rates to config** — `config/balance/forging.ts`
- [x] **Extract login streak rewards to config** — `config/balance/login-streak.ts`
- [x] **Extract box reward tiers to config** — `config/balance/boxes.ts`
- [x] **Optimize PvP leaderboard query** — DB-level ORDER BY + LIMIT for kills/deaths/streak sorts
