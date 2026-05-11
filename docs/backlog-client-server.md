# Backlog: arcania-client + arcania-server (Cross-Cutting)

Tasks that require coordinated changes on both client and server.

## Phase 1 — Shared Type System

This is the foundation — almost every other cross-cutting task benefits from shared types.

- [x] **Create shared types package** — `arcania-shared/` created with enums, types, constants; both client and server import from it via `@shared/*` path alias
- [x] **Unify Class enum naming** — shared uses `CharacterClass`; client re-exports as `Class` for backward compat
- [x] **Align Character interface optionality** — shared defines `CharacterSummary` (minimal) and `CharacterFull` (all required)
- [x] **Unify response type naming** — shared uses canonical names (`ItemData`, `CharacterFull`); server re-exports `CharacterFull as CharacterData` for backward compat
- [x] **Move duplicated constants to shared** — all game constants in `arcania-shared/src/constants.ts`
- [x] **Fix DerivedStatKey phantom fields** — added `blockChance` and `prestigeDamage` to `DerivedStats`; added `dodgeChance` to `DerivedStatKey`; stat-calculator returns 0 for both new fields (set-bonus-only stats)

## Discovered During Phase 4

- [x] **Update client for new response envelope** — API modules unwrap `{ data, meta }` at the module level; zero consumer changes needed

## Phase 2 — Auth Flow Hardening

- [x] **Implement token refresh** — `POST /auth/refresh` with 1-hour grace window; client interceptor retries 401s with refreshed token, deduplicates concurrent refreshes
- [x] **Add token revocation** — Redis token blacklist via `token-blacklist.service.ts`; auth middleware checks blacklist (graceful degradation if Redis down); `/auth/revoke` + `/auth/logout` blacklist tokens
- [x] **Migrate token to httpOnly cookie** — server sets httpOnly SameSite cookie on login/register/refresh; client uses `credentials: 'include'`; Bearer header kept as fallback

## Phase 3 — API Contract Alignment

- [x] **Define API response envelope** — `ApiResponse<T>` and `PaginatedResponse<T>` types in arcania-shared; server `utils/response.ts` helpers
- [x] **Add server-side Gender validation** — already done in Server Phase 3
- [x] **Type all API calls on client** — already done in Client Phase 3

## Phase 4 — Real-Time Communication

- [x] **Evaluate real-time strategy** — SSE chosen: zero deps, native EventSource, replaces 10s trade + 30s badge polling
- [x] **Wire event bus subscribers** — `sse.service.ts` subscribes to 8 Redis events, broadcasts via `broadcastToUser()` to connected SSE clients
- [x] **Add client event handling** — `sse.client.ts` connects on auth, marks stores stale on events, disconnects on logout; 30s badge polling removed
