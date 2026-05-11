# Launch Checklist: Legend of Arcania (Arcania Nexus)
Target Launch: DRY RUN
Generated: 2026-03-31
Platform: PC (Web) -- Browser-based 2D MMORPG

---

## 1. Code Readiness

### Build Health
- [x] Client builds successfully (`tsc && vite build` -- dist/ exists, 85MB with assets)
- [ ] Server builds successfully (`tsc` -- verify `dist/` is current and complete)
- [ ] Zero TypeScript compiler warnings (CharacterSheet.tsx has known pre-existing TS errors per MEMORY.md)
- [ ] All unit tests passing -- **BLOCKER: No test files exist in the project. Zero test coverage.**
- [ ] All integration tests passing -- **BLOCKER: No integration tests exist.**
- [ ] Performance benchmarks within targets (no benchmarks defined)
- [ ] No memory leaks (verify via extended soak test -- no tooling in place)
- [ ] Build size verified: client dist is 85MB (mostly sprite assets -- verify acceptable)
- [ ] Build version correctly set and tagged in source control (both packages at v1.0.0)
- [ ] Source maps enabled for production debugging (vite.config.ts has `sourcemap: true`)

### Code Quality
- [x] TODO count: 0 (clean)
- [x] FIXME count: 0 (clean)
- [x] HACK count: 0 (clean)
- [x] No `console.log` in client production code (0 occurrences in arcania-client/src)
- [ ] Server `console.log` calls: 8 occurrences across 2 files (`index.ts` startup logs + `seed.ts` seed output) -- **Acceptable for startup; consider structured logger for production**
- [x] No debug flags or DEBUG references in production code
- [x] Dev-only routes gated behind `import.meta.env.DEV` (/equipment, /test-equipment)
- [x] Error handling: global ErrorBoundary wraps entire React app
- [x] Error reporting: client error-logger captures errors, unhandled rejections, console.error, React errors, and network errors -- batched to server
- [ ] Server error handler only catches `AppError` and generic 500 -- **no structured logging, no external crash reporting service**
- [ ] No Zod validation schemas found on server route handlers (0 occurrences) -- **input validation relies entirely on manual checks in services**

### Security
- [ ] **BLOCKER: JWT_SECRET has a hardcoded dev fallback** (`dev-only-jwt-secret-do-not-use-in-prod`) -- production env.ts does throw if missing, but the fallback string is committed to source
- [ ] **BLOCKER: DATABASE_URL has hardcoded dev credentials** (`arcania:arcania_secret@localhost`) in env.ts fallback
- [ ] **RISK: .env file with credentials is committed** to `arcania-server/.env` -- contains `JWT_SECRET=arcania-nexus-jwt-secret-change-in-production` and DB password
- [x] .env is in .gitignore at both root and server level
- [x] JWT tokens properly verified in auth middleware with expiry (7d)
- [x] Passwords hashed with bcrypt (10 rounds)
- [x] Account enumeration prevented (generic error on registration conflict)
- [x] Rate limiting active: 100 req/min general, 15 req/15min for auth endpoints
- [x] Helmet security headers enabled (CSP disabled for game client -- document why)
- [x] CORS restricted to configured origin
- [x] Request body size limited (100kb)
- [ ] **CSP is disabled** (`contentSecurityPolicy: false`) -- evaluate enabling with game-appropriate policy
- [ ] JWT tokens stored in localStorage -- **vulnerable to XSS. Consider httpOnly cookies for production**
- [ ] No CSRF protection implemented
- [ ] No HTTPS enforcement in server code -- relies on reverse proxy/hosting
- [ ] Error log POST endpoint is unauthenticated -- could be abused for log flooding (rate limit exists but is global, not specific)
- [ ] Password policy exists but no account lockout after failed attempts (rate limiter helps but resets per window)
- [ ] No input sanitization library (no Zod on routes, no XSS sanitization)
- [ ] Save/game data stored as JSON blobs in PostgreSQL -- verify no injection via JSON fields

---

## 2. Content Readiness

### Assets
- [x] Equipment icon SVGs present (31 SVG files across equipment-placeholders, items/armor, items/weapons, items/shields)
- [ ] **Icons are SVG placeholders** per MEMORY.md -- confirm if final art or placeholder
- [ ] All LPC sprite layers verified for all 4 races x 5 classes x 2 genders = 40 combinations
- [ ] Equipment sprites verified for all tiers (T1-T5) across all equipment slots
- [ ] No missing or broken asset references at runtime (needs manual verification)
- [ ] Unused sprite directories properly excluded via .gitignore (confirmed: prosthesis, tail, wheelchair, wings, wound, unused races, etc.)

### Text and Localization
- [ ] All player-facing text proofread
- [ ] No hardcoded strings (text is inline in React components -- not externalized)
- [ ] Localization system not implemented -- **single language (English) only; document as known limitation**
- [ ] Credits/attributions for LPC (Liberated Pixel Cup) assets -- **required by LPC license**

### Game Content
- [ ] All 5 classes playable: Paladin, Fighter, Ranger, Cleric, Mage
- [ ] All 4 races functional: Human, Luminar, Lilin, Darkan (README says "Mochis" -- **race naming inconsistency between README and actual enum**)
- [ ] Character creation flow complete and tested
- [ ] Equipment system (equip/unequip/enhance/socket) tested end-to-end
- [ ] Marketplace/auction house tested end-to-end
- [ ] Vault system tested end-to-end
- [ ] Quest system (social, achievement, daily, weekly, referral) tested
- [ ] Login streak and rewards verified
- [ ] Lucky spin (wallet) system tested
- [ ] Vendor purchasing tested
- [ ] Item generation and stat rolling verified for all tiers
- [ ] Set bonus system verified
- [ ] Enhancement system (+0 to +15) failure/destruction rates balanced
- [ ] Tutorial/onboarding flow exists and tested

---

## 3. Quality Assurance

### Testing
- [ ] **BLOCKER: No automated test suite exists** -- zero test files in client or server
- [ ] Full manual regression test plan created and executed
- [ ] Zero S1 (Critical) bugs open
- [ ] Zero S2 (Major) bugs open (CharacterSheet.tsx TS errors are known -- document exceptions)
- [ ] Soak test passed (extended play session without memory leaks or crashes)
- [ ] All critical user paths tested: register -> create character -> equip -> marketplace -> vault -> quests
- [ ] Edge cases tested: full inventory, no gold, max enhancement, simultaneous marketplace transactions

### Platform Certification (Web)
- [ ] Tested on Chrome, Firefox, Safari, Edge (latest versions)
- [ ] Responsive design verified for common resolutions
- [ ] Accessibility: keyboard navigation, screen reader compatibility, color contrast
- [ ] Performance on low-end hardware verified

### Performance
- [ ] Client initial load time measured and acceptable
- [ ] Client bundle size breakdown reviewed (85MB dist includes sprite assets)
- [ ] Code splitting verified (React.lazy routes, manual vendor chunks in vite.config)
- [ ] API response times under load measured
- [ ] Database query performance profiled (no indexes on some frequently queried fields)
- [ ] Sprite rendering performance tested with many characters on screen

---

## 4. Store and Distribution

### Deployment
- [ ] **BLOCKER: No Dockerfile or docker-compose exists** -- containerization needed for deployment
- [ ] Production hosting platform selected and configured (Vercel/Netlify for client, Railway/Fly.io/AWS for server)
- [ ] Client build deployed to CDN-backed hosting
- [ ] Server deployed with process manager (PM2, systemd, or container orchestration)
- [ ] Domain name configured with SSL/TLS certificate
- [ ] Environment variables set in production (VITE_API_URL for client, all server env vars)

### Legal
- [ ] EULA/Terms of Service drafted
- [ ] Privacy policy published (data collection: email, username, game data)
- [ ] LPC asset license attributions included (required -- GPL/CC-BY-SA)
- [ ] Third-party library licenses reviewed (MIT/Apache/BSD -- generally permissive)
- [ ] GDPR/CCPA compliance: account deletion capability, data export, consent mechanisms
- [ ] Cookie/localStorage consent notice (JWT stored in localStorage)

---

## 5. Infrastructure

### Server and Database
- [ ] **BLOCKER: No production PostgreSQL provisioned**
- [ ] Database connection pooling configured (Prisma default -- verify pool size for production load)
- [ ] **BLOCKER: No database backup strategy documented or configured**
- [ ] Database migrations tested in staging: 3 migrations exist (init, add_gender, move_arcanite)
- [ ] Migration rollback plan documented for each migration
- [ ] Seed data strategy for production (quest definitions required; item catalog from seed.ts)
- [ ] **Redis mentioned in .env.example but NOT used in server code** -- remove from requirements or implement caching
- [ ] Database indexes verified: indexes exist on userId, characterId, itemId, questId -- review for missing indexes on query patterns
- [ ] Prisma `onDelete: Cascade` used throughout -- verify cascade behavior is intentional for all relations
- [ ] Connection string uses SSL in production (`?sslmode=require`)

### Scalability
- [ ] Server is stateless (no in-memory sessions) -- can scale horizontally
- [ ] No WebSocket/Socket.io in current server despite README mentioning "Real-time: Socket.io" -- **architecture mismatch**
- [ ] Rate limiting is per-instance (express-rate-limit with in-memory store) -- **will not work correctly behind load balancer without Redis store**
- [ ] Client error log writes to local filesystem (`client-errors.log`) -- **will not work in containerized/multi-instance deployment**
- [ ] Auto-scaling not configured (no container orchestration)
- [ ] CDN configured for static asset delivery (sprites are large)

### Monitoring and Alerting
- [ ] **BLOCKER: No server monitoring or APM tool integrated** (no Datadog, New Relic, Sentry, etc.)
- [ ] **BLOCKER: No structured server-side logging** (only console.log/console.error)
- [ ] Client error logging exists (error-logger.ts -> POST /api/error-log) -- writes to local file, not a monitoring service
- [ ] Health check endpoint exists (`GET /api/health`) -- good for load balancer probes
- [ ] Database health monitoring not implemented
- [ ] Uptime monitoring not configured
- [ ] Key metrics not tracked: DAU, session length, retention, revenue, error rates
- [ ] No alerting configured for critical thresholds (error spikes, high latency, disk full)

---

## 6. Environment Configuration

### Client Environment
- [ ] `VITE_API_URL` must be set for production (currently falls back to `http://localhost:3001/api`)
- [ ] Verify all `import.meta.env.DEV` guards work correctly in production build
- [ ] Source maps: enabled in vite.config -- decide if production source maps should be public or uploaded to error tracking service only

### Server Environment
- [ ] `DATABASE_URL` -- must point to production PostgreSQL with SSL
- [ ] `JWT_SECRET` -- must be a strong, unique random string (minimum 256 bits)
- [ ] `PORT` -- configure for production (default 3001)
- [ ] `NODE_ENV` -- must be set to `production`
- [ ] `CORS_ORIGIN` -- must be set to production domain (currently defaults to `http://localhost:5173`)
- [ ] `.env.example` is outdated (references PORT=3000, REDIS_URL, MAX_PLAYERS_PER_SERVER, TICK_RATE that are not used in current server code)

### Environment Parity
- [ ] Staging environment exists and mirrors production
- [ ] Environment-specific config documented
- [ ] Secrets management solution in place (not plain .env files on server)

---

## 7. Backup and Rollback Strategy

### Database Backups
- [ ] **BLOCKER: No automated backup schedule configured**
- [ ] Point-in-time recovery (PITR) enabled on PostgreSQL
- [ ] Backup retention policy defined (e.g., 7 daily, 4 weekly, 3 monthly)
- [ ] Backup restoration tested and documented
- [ ] Database snapshot before each migration

### Application Rollback
- [ ] **BLOCKER: No rollback procedure documented**
- [ ] Previous client build artifacts retained (at least N-2 versions)
- [ ] Previous server build artifacts retained
- [ ] Prisma migration rollback tested (`prisma migrate resolve`)
- [ ] Blue/green or canary deployment strategy considered
- [ ] Feature flags system for gradual rollout (not implemented)

### Data Recovery
- [ ] User data export capability exists (GDPR requirement)
- [ ] Account deletion cascade verified (onDelete: Cascade on all child relations)
- [ ] Orphaned data cleanup procedures documented

---

## 8. Operations

### Team Readiness
- [ ] On-call schedule set for first 72 hours post-launch
- [ ] Incident response playbook written
- [ ] Rollback plan documented and tested
- [ ] Hotfix pipeline tested (can ship emergency fix within 4 hours)
- [ ] Communication plan for launch issues (who posts, where, how fast)

### Day-One Plan
- [ ] Day-one seed data prepared (quest definitions, item templates)
- [ ] Server go-live procedure documented
- [ ] Launch monitoring plan (what to watch, who watches)
- [ ] War room/channel established for launch day
- [ ] Known issues document prepared for support team

---

## Go / No-Go Decision

**Overall Status**: NOT READY

### Blocking Items (Must Resolve Before Launch)
1. **No automated test suite** -- zero unit/integration/e2e tests across entire project
2. **No containerization** -- no Dockerfile or docker-compose for deployment
3. **No production infrastructure** -- no provisioned database, no hosting configured
4. **No monitoring/APM** -- no structured logging, no error tracking service, no metrics
5. **No database backup strategy** -- no automated backups, no PITR, no restore testing
6. **No rollback procedure** -- no documented process for rolling back deployments
7. **Hardcoded dev secrets in source** -- JWT_SECRET and DATABASE_URL fallbacks in env.ts
8. **No input validation on API routes** -- Zod is a dependency but not used for request validation

### Conditional Items (Documented Workarounds or Accepted Risk)
1. **CSP disabled** -- acceptable for game client with XSS mitigations
2. **JWT in localStorage** -- common for SPAs; accepted risk with error-logger XSS surface
3. **No localization** -- English-only launch is acceptable if documented
4. **CharacterSheet.tsx TS errors** -- pre-existing, non-blocking per MEMORY.md
5. **Console.log in server startup** -- acceptable for server boot diagnostics
6. **85MB client build** -- mostly sprite assets; acceptable with CDN
7. **No Redis despite .env.example** -- not needed for current architecture, but rate limiter needs Redis store for multi-instance
8. **No Socket.io despite README** -- real-time features not yet implemented; README needs update
9. **Race naming mismatch** -- README says "Mochis" but code uses "Lilin"
10. **Equipment icons are SVG placeholders** -- functional but may not be final art

### Sign-Offs Required
- [ ] Creative Director -- Content and experience quality
- [ ] Technical Director -- Technical health and stability
- [ ] QA Lead -- Quality and test coverage
- [ ] Producer -- Schedule and overall readiness
- [ ] Release Manager -- Build and deployment readiness
