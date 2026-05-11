# Backlog: arcania-client

- [x] Frontend: Update Token.tsx with devnet live section + honest roadmap
- [ ] Frontend: Solana wallet adapter stack (Phantom connect + balance display)

## Phase 1 — Critical Auth & Error Handling

These must come first because every other feature depends on auth working correctly and errors being visible.

- [x] **Add 401 handling in API client** — detect expired/invalid tokens in `api.service.ts`, auto-clear auth store, redirect to `/login`
- [x] **Complete logout cleanup** — `useAuthStore.logout()` must also reset useCharacterStore, useWalletStore, useVaultStore, useNotificationStore, useUIStore and clear related localStorage keys
- [x] **Fix port mismatch** — align `.env.example` (currently says 3000) and `vite.config.ts` proxy target with server default (3001)

## Phase 2 — Store Reliability

Stores are the backbone of client state. These fixes make data flow predictable before touching UI or features.

- [x] **Add error states to all stores** — added `error: string | null` + `setError` to all 4 stores; async methods clear/set error
- [x] **Add loading states to all stores** — added `isLoading` to useWalletStore, useCharacterStore, useNotificationStore
- [x] **Fix stale data on navigation** — RouteChangeHandler in App.tsx resets all 5 stores on nav to /login or /character-select
- [x] **Remove prop drilling for character** — child components now use useCharacterStore directly; removed character prop from 4 components

## Phase 3 — API Layer Refactor

Depends on Phase 2 (stores must have error/loading states before API layer can populate them).

- [x] **Split api.service.ts into domain modules** — 16 API modules extracted to `services/api/*.api.ts` with shared client in `services/api/client.ts`; old file is re-export shim
- [x] **Type all API responses** — all API modules have explicit return types; generic default fixed
- [x] **Sanitize server errors before display** — `utils/error-messages.ts` created with `getUserFriendlyError()` + ERROR_MESSAGE_MAP
- [x] **Add request deduplication** — in-flight GET request map prevents duplicate concurrent calls

## Phase 4 — Data Freshness & Caching

Depends on Phase 3 (API layer must be split and typed before adding caching on top).

- [x] **Add cache invalidation strategy** — added `lastFetched` timestamps to stores + `isStale()` utility in `utils/cache.ts`
- [x] **Add notification badge refresh** — 30-second interval in CharacterManagement with useEffect cleanup
- [x] **Centralize data loading** — created `useCharacterData()` hook in `hooks/useDataLoader.ts`

## Phase 5 — Code Quality & Type Safety

- [x] **Eliminate `catch (error: any)` blocks** — replaced with `catch (error: unknown)` + type narrowing
- [x] **Fix useEffect dependency arrays** — fixed or suppressed with eslint-disable comments where intentional
- [x] **Remove defensive `(character as any)` patterns** — removed fallback patterns, using proper optional chaining
