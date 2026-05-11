# Legend of Arcania

A 2D MMORPG built around a deep, player-driven economy on Solana.

## What's live today

A feature-complete in-game economy: character creation, paperdoll equipment system, marketplace with auctions and direct trades, item forging with success rates and material returns, battle pass, daily/weekly/social quests, dual-currency vendors (Gold + Arcanite), boosters, vault storage, friends. 88 API endpoints, 28 Prisma models, 30+ services, 60+ React components.

**Solana integration (devnet, live now):**
- ARC SPL token: [`DcYWNXRrXzQcNgYPu8e6fcn4gk4pwqEJhR8TJPzN5Tu8`](https://solscan.io/token/DcYWNXRrXzQcNgYPu8e6fcn4gk4pwqEJhR8TJPzN5Tu8?cluster=devnet) (100M total supply)
- Phantom wallet adapter, balance display, on-chain message-signing wallet linking (ed25519 verified server-side)

**Coming in the next sprint:**
- Anchor marketplace escrow program (Rust)
- Arcanite ↔ ARC bridge with time-lock conversion bonuses
- Phaser 3 world scene (LPC paperdoll already wired)

## Repo layout

```
arcania_nexus/
├── arcania-client/   # React 18 + Vite + TypeScript + Tailwind + Zustand
├── arcania-server/   # Express + TypeScript + Prisma + PostgreSQL + Redis
└── docs/             # Design docs, architecture review, tokenomics
```

## Tech stack

**Client:** React 18, Vite, TypeScript, Tailwind, Zustand, react-router. Solana: `@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-phantom`, `@solana/spl-token`.

**Server:** Express, TypeScript, Prisma 6, PostgreSQL, Redis (pub/sub + caching), JWT in httpOnly cookies, Zod request validation, pino structured logging, Helmet, per-user rate limiting, node-cron jobs, SSE for real-time. Solana: `tweetnacl` + `bs58` for ed25519 signature verification on wallet-link.

## Quick start

Requirements: Node 20+, PostgreSQL 15+, Redis 7+, optionally Solana CLI for token-side operations.

```bash
# Server
cd arcania-server
cp .env.example .env   # set DATABASE_URL, JWT_SECRET
npm install
npx prisma migrate deploy
npm run dev            # → http://localhost:3001

# Client (separate terminal)
cd arcania-client
npm install
npm run dev            # → http://localhost:5173
```

Connect Phantom (top-right of any marketing page) → switch to Devnet → see your SOL balance. Visit `/token` to see the live ARC mint and your ARC balance.

## Key documents

- [`docs/02-project-brief.md`](docs/02-project-brief.md) — 500-word project brief
- [`docs/ARCHITECTURE_REVIEW.md`](docs/ARCHITECTURE_REVIEW.md) — system architecture
- [`docs/token/arc-token/index.mdx`](docs/token/arc-token/index.mdx) — ARC tokenomics
- [`docs/token/economics/sinks.mdx`](docs/token/economics/sinks.mdx) — deflationary mechanics
- [`docs/token/exchange/conversion-rates.mdx`](docs/token/exchange/conversion-rates.mdx) — Arcanite↔ARC conversion design

## Game systems (in-code)

- 5 classes: Paladin, Fighter, Ranger, Cleric, Mage
- 4 races: Human, Luminar, Lilin, Darkan
- Equipment enhancement (+0 to +15), gem sockets
- Forge with class-specific recipes, success-rate boosters, material returns on failure
- Marketplace with auctions, fixed-price listings, direct trades
- Battle pass with free + premium tracks, seasonal rotation
- Quest system: daily, weekly, achievement, social, login streaks
- LPC (Liberated Pixel Cup) layered sprite system for live paperdoll preview

## License

All rights reserved — Legend of Arcania, 2026.
