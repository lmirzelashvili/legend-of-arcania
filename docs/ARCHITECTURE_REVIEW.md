# Arcania Nexus — Full Architecture Review

## Overview

Full-stack browser MMORPG: React 18 + Vite (client) / Express + Prisma + PostgreSQL + Redis (server). 63 components, 27 services, 16 route files, 24 database models.

---

## 1. DATABASE & DATA LAYER

### How it works
- 24 Prisma models, PostgreSQL, 3 migrations total (last: 2026-03-04)
- Heavy use of JSON columns (16 total): `primaryStats`, `derivedStats`, `itemData`, `position`, `abilityData`, `reward`, etc.
- JSON type safety via centralized helpers: `toItemData()`, `toStatBlock()`, `toAbilityData()` in `prisma-json-helpers.ts`
- Marketplace uses denormalized columns (itemType, itemRarity, price, etc.) for efficient filtering
- Extensive transaction usage across all mutation operations
- Seed data uses `upsert()` for safe re-runs

### What's good
- Strong transaction coverage (18 of 25 services use `$transaction`)
- Cascade deletes configured on most relationships
- Composite indexes for common query patterns
- JSON helpers centralize unsafe `unknown -> Type` conversions
- Denormalized marketplace columns avoid slow JSON path queries

### What's concerning
- **Trade model missing cascade deletes** — Trade.initiatorId/receiverId have NO `onDelete: Cascade`. Deleting a user orphans their trades
- **Schema drift** — 9+ models in schema.prisma but not in any migration file (Trade, Friendship, BattlePass*, PvP*, ActiveBooster, PremiumSubscription). Database may not have these tables
- **Character name uniqueness is query-level only** — no database unique constraint; race condition possible on concurrent creates
- **Referral.referredUsers** stored as unbounded JSON array — grows infinitely, no pagination
- **No soft deletes** on any model — hard cascading deletes with no audit trail
- **@updatedAt missing** on most models (only 5 of 24 have it)
- **Denormalization sync gap** — if item is enhanced after marketplace listing, denormalized `enhancementLevel` column becomes stale

---

## 2. SERVER ARCHITECTURE

### How it works
- Middleware chain: Helmet (CSP off) -> CORS -> JSON parser (100kb) -> Rate limiting -> Routes -> Error handler
- Auth middleware extracts JWT Bearer token, attaches `req.userId`
- Internal routes protected by separate `serviceAuthMiddleware` (API key)
- Routes are thin controllers delegating to services; services contain business logic
- Custom `AppError` class for consistent error responses: `{ error, message }`
- Custom validation helpers (`requireString`, `requirePositiveInt`, `validateEnum`) instead of Zod

### What's good
- Clean route -> service -> DB separation
- Consistent try-catch-next pattern in all routes
- Service dependency graph is shallow (max 2-3 levels), no circular dependencies
- Pre-check + re-check-in-transaction pattern prevents race conditions on marketplace purchases
- Generic auth error messages prevent account enumeration

### What's concerning
- **No request logging middleware** — no HTTP audit trail
- **No Zod despite being installed** — manual validation has gaps (unvalidated JSON objects, optional field coercion)
- **Inconsistent response shapes** — some return `{ success, message, data }`, others return raw objects, others return `{ listings, total, page }`
- **PvP bestStreak race condition** — three separate upserts not transactional
- **Quest reward double-claim risk** — no idempotency check or unique constraint on claim
- **Achievement tracking is fire-and-forget** — `trackAchievement().catch()` after transactions means lost achievements if service is down
- **Event bus has zero subscribers** — Redis pub/sub infrastructure built but unused; events published to nothing
- **No observability** — no request IDs, correlation IDs, structured logging, or metrics

---

## 3. CLIENT-SERVER COMMUNICATION

### How it works
- Native `fetch` API with custom `FetchClientError` class (no axios)
- Auth token read from `localStorage` on every request, injected as `Authorization: Bearer`
- 16 API modules in single `api.service.ts` (737 lines)
- Base URL: `VITE_API_URL` env var, fallback `http://localhost:3001/api`
- Error logger batches client errors every 2s, sends to `POST /error-log`

### What's good
- Zero-dependency HTTP client is lightweight and maintainable
- Error batching reduces noise
- Atomic character creation (token + create in one transaction)
- Graceful shutdown handlers on server

### What's concerning
- **No token refresh mechanism** — 7-day JWT with no refresh endpoint; after expiry all API calls fail silently
- **No 401 handling in API client** — expired tokens cause silent failures; no auto-logout or redirect
- **localStorage token storage** — vulnerable to XSS (no httpOnly cookie)
- **Port mismatch** — `.env.example` says 3000, server defaults to 3001, vite proxy targets 3000
- **No real-time updates** — no WebSocket, no polling (except trades); client data goes stale
- **Error messages leak to UI** — server error strings displayed directly to users
- **API service monolith** — 737 lines, 16 modules in one file

---

## 4. CLIENT STATE MANAGEMENT

### How it works
- 6 Zustand stores: useAuthStore, useCharacterStore, useWalletStore, useVaultStore, useNotificationStore, useUIStore
- Plus `useSoundSettings` (Zustand with persist middleware)
- Hybrid pattern: some stores hold state only, others call APIs internally (WalletStore, VaultStore)
- Cross-store reference: useVaultStore calls `useCharacterStore.getState()` to sync after vault operations
- Data loading happens in components via `useEffect`, not centralized

### What's good
- Clean store separation (auth, character, wallet, vault, notifications, UI)
- WalletStore loads from localStorage first, syncs to server (offline-first)
- NotificationStore uses `Promise.allSettled()` for parallel badge loading
- No Zustand middleware bloat; minimal cross-store coupling

### What's concerning
- **No error states in stores** — errors caught but only logged to console; no `isError` exposed to UI
- **Missing loading states** — only VaultStore has `isVaultLoading`; others force components to manage their own
- **No request deduplication** — multiple components mounting can fire duplicate API calls
- **Incomplete logout cleanup** — only auth store cleared; wallet/character data persists in memory and localStorage
- **Prop drilling despite stores** — CharacterManagement passes `character` prop to 8+ children instead of using store
- **No cache invalidation** — stores persist stale data across navigations; no TTL or refetch triggers
- **No optimistic updates** — all mutations wait for full round-trip

---

## 5. GAME SYSTEMS WIRING

### How it works
- 12 game systems, each following Client UI -> API -> Route -> Service -> DB pattern
- Equipment: transactional slot swap with post-transaction stat recalculation (best-effort)
- Enhancement: 15-level system with success rates, crystal consumption, item destruction risk
- Forging: recipe-based crafting with material return on failure (20-70%)
- Marketplace: denormalized listings, atomic purchase with re-checks, premium fee reduction
- Vault: zone-restricted access, atomic currency transfers, tier-based capacity
- Quests: lazy initialization, state machine (IN_PROGRESS -> COMPLETED -> CLAIMABLE -> CLAIMED)
- Battle Pass: season-based, free/premium tiers, XP progression
- PvP: kill recording, streak tracking, leaderboard
- Wallet: daily spin with weighted rewards, creation token management
- Trading: lock-based P2P with 10-minute expiry, atomic item swap

### What's good
- Consistent transactional boundaries around inventory mutations
- Marketplace pre-check + re-check-in-transaction prevents double-buys
- Forging material return system encourages reinvestment
- Trade locking mechanism prevents last-minute swaps
- Zone-based vault access ties mechanics to game world

### What's concerning
- **Manual achievement tracking** — every system must explicitly call `trackAchievement()`; missed calls = lost progress. No event-driven detection
- **Stat recalculation is best-effort** — equipment changes trigger `recalculateStats()` outside transaction with try-catch that silently ignores failures
- **Inventory space pre-checks not re-verified in transactions** — another request can fill bag between check and equip
- **PvP leaderboard loads ALL records into memory** — unoptimized; fetches all PvPStats, calculates KD in JS, sorts in JS
- **No background job scheduler** — quest resets, booster expiry cleanup, season rotation have no visible automation
- **Currency lives in 3 places** — Character (working), Vault (storage), AccountWallet (tokens/spins) with no clear pattern
- **Premium flag can go stale** — `user.isPremium` not auto-revoked when subscription expires; depends on user calling checkStatus
- **No item generation logging** — forging/enhancement success rates not tracked; balance analysis impossible

---

## 6. TYPE SYSTEM & SHARED CONTRACTS

### How it works
- Client types: `types/game.types.ts` (664 lines) — enums + interfaces
- Server types: `types/index.ts` (531 lines) — enums + interfaces
- No shared package; types maintained independently on each side
- Prisma JSON fields typed via helper functions (blind `as Type` casts, no runtime validation)
- Game constants duplicated: `game.constants.ts` (client) vs `game-constants.ts` (server)

### What's good
- Core enums (Race, ItemType, ItemRarity, EquipmentSlot, VaultTier, ZoneType) are identical
- StatBlock and DerivedStats interfaces match perfectly
- Centralized prisma-json-helpers.ts prevents `as any` from spreading
- `itemInstanceToLegacy()` adapter bridges old/new item representations

### What's concerning
- **Class enum name mismatch** — Client uses `Class`, Server uses `CharacterClass` (same values, different names)
- **Character interface optionality divergence** — Client has nearly all fields optional (`?`), Server has them required. Client code does `character.resources?.currentHp || (character as any).currentHp || 100`
- **API response typing defaults to `any`** — `api.get<T = any>()` means all untyped API calls return `any`
- **40+ `catch (error: any)` blocks** throughout client
- **Prisma JSON casts have no runtime validation** — `toStatBlock()` does blind `as StatBlock`; malformed DB data passes silently
- **Response type names diverged** — Client uses `Character`, `Item`; Server uses `CharacterData`, `ItemData`
- **Gender type exists only in client component** — Server accepts `gender: string` with no validation
- **DerivedStatKey includes `blockChance` and `prestigeDamage`** which don't exist on DerivedStats interface
- **Full constants duplication** — CLASS_BASE_STATS, STAT_CAPS, RACIAL_BONUSES, MAX_LEVEL, calculateBaseStats(), xpRequiredForLevel() all copy-pasted between client and server

---

## 7. SECURITY & CONFIGURATION

### How it works
- JWT auth with 7-day expiry, bcrypt (10 rounds), no refresh tokens
- Auth middleware on protected routes, service-auth middleware (API key) on internal routes
- Custom validation helpers (no Zod usage despite dependency)
- Rate limiting: 100/min general, 15/15min auth (in-memory store)
- Helmet enabled (CSP disabled for game client)
- CORS configured via env var

### What's good
- Bcrypt password hashing, passwords never returned in responses
- Generic auth error messages prevent account enumeration
- Prisma parameterized queries prevent SQL injection
- `requireEnv()` throws in production if secrets missing
- Marketplace listing limits tied to premium status

### What's concerning
- **CRITICAL: .env file appears committed** with actual secrets (JWT_SECRET, DATABASE_URL with credentials)
- **No token refresh** — 7-day expiry with no refresh endpoint; compromised tokens valid until expiry
- **No token revocation** — stateless JWT, no blacklist
- **CSP disabled** — no Content Security Policy protection against XSS
- **localStorage for tokens** — vulnerable to XSS; no httpOnly cookies
- **In-memory rate limiter** — not shared across server instances; resets on restart
- **Expensive operations unprotected** — enhance, forge, marketplace purchase have no rate limits
- **No RBAC** — only premium vs non-premium distinction; no admin role in user model
- **No GDPR compliance** — no data export, no account deletion endpoint, no consent tracking
- **No structured logging** — console.log/error only; no log aggregation support
- **No audit logging** — premium activations, admin actions, sensitive operations untracked

---

## CROSS-CUTTING ISSUES

| Issue | Affected Areas | Severity |
|-------|---------------|----------|
| Secrets in repo (.env committed) | Auth, DB, Redis | CRITICAL |
| No token refresh/revocation | Auth, all API calls | HIGH |
| Type duplication (client/server) | All features | HIGH |
| Manual achievement tracking | Equipment, marketplace, quests, trades | HIGH |
| No request caching/deduplication | All client data loading | HIGH |
| Event bus has no subscribers | All published events | MEDIUM |
| Stat recalculation best-effort | Equipment, leveling | MEDIUM |
| No background job scheduler | Quests, boosters, seasons, premiums | MEDIUM |
| Inconsistent response shapes | All API endpoints | MEDIUM |
| No structured logging/observability | Server operations | MEDIUM |
| PvP leaderboard in-memory sort | PvP system | LOW |
| Schema migration drift | Database | LOW (if using db push) |

---

## FILES REFERENCED

### Server - Core
- `arcania-server/src/index.ts` — Express setup, middleware, routes
- `arcania-server/src/config/env.ts` — Environment variables
- `arcania-server/src/middleware/auth.ts` — JWT auth middleware
- `arcania-server/src/middleware/errors.ts` — Error handler + AppError class
- `arcania-server/src/utils/validate.ts` — Input validation helpers
- `arcania-server/prisma/schema.prisma` — Database schema (24 models)

### Server - Services
- `arcania-server/src/services/auth.service.ts` — JWT, bcrypt, login/register
- `arcania-server/src/services/character.service.ts` — Character CRUD, stats
- `arcania-server/src/services/equipment.service.ts` — Equip/unequip
- `arcania-server/src/services/enhancement.service.ts` — Item enhancement
- `arcania-server/src/services/forging.service.ts` — Crafting
- `arcania-server/src/services/marketplace.service.ts` — Marketplace
- `arcania-server/src/services/vault.service.ts` — Vault operations
- `arcania-server/src/services/quest.service.ts` — Quests
- `arcania-server/src/services/pvp.service.ts` — PvP
- `arcania-server/src/services/wallet.service.ts` — Spin, tokens
- `arcania-server/src/services/trade.service.ts` — P2P trading
- `arcania-server/src/services/event-bus.service.ts` — Redis pub/sub (unused subscribers)
- `arcania-server/src/utils/stat-calculator.ts` — Derived stat computation
- `arcania-server/src/utils/game-constants.ts` — Duplicated game constants
- `arcania-server/src/data/item-templates.ts` — Item templates, enhancement rates

### Client - Core
- `arcania-client/src/App.tsx` — Router, protected routes
- `arcania-client/src/services/api.service.ts` — 737-line API client (16 modules)
- `arcania-client/src/services/error-logger.ts` — Client error batching
- `arcania-client/src/types/game.types.ts` — 664-line type definitions
- `arcania-client/src/constants/game.constants.ts` — Duplicated game constants

### Client - Stores
- `arcania-client/src/store/useAuthStore.ts`
- `arcania-client/src/store/useCharacterStore.ts`
- `arcania-client/src/store/useWalletStore.ts`
- `arcania-client/src/store/useVaultStore.ts`
- `arcania-client/src/store/useNotificationStore.ts`
- `arcania-client/src/store/useUIStore.ts`
