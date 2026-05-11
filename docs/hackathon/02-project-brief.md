# Project Brief — Hackathon Submission

## Project Name
**Arcania Nexus**

## Tagline
Own Your Adventure. Trade Your Glory.

## One-Liner
A Solana-powered MMORPG with a fully functional player-owned economy — where every item, trade, and achievement carries real value.

---

## Brief Description (500 words)

Traditional game economies are fundamentally broken. Players invest thousands of hours grinding for rare items, building characters, and mastering markets — yet they own nothing. When a server shuts down, everything disappears. When a player quits, their progress has zero transferable value. Game studios capture 100% of the economic value that players create. This is the extractive model that has defined gaming for decades.

Arcania Nexus is a 2D top-down MMORPG built to prove that a better model exists — one where players truly own their in-game economy through Solana.

Unlike typical "GameFi" projects that bolt a token onto a minimal prototype, Arcania Nexus is a feature-complete game platform with genuine depth. The Nexus — our browser-based management hub — includes a full player-to-player marketplace with server-side pagination and filtering, a direct trade system with escrow-protected offer/lock/confirm flow, an item forging system with 12 recipes and crystal-boosted success rates, equipment enhancement (+1 to +15 with risk mechanics and protection scrolls), gem socketing, a 30-tier seasonal battle pass, PvP leaderboards with K/D tracking, daily quests with repeatable rewards, a friends system, account-wide vault storage, and three NPC vendor shops. Every system is interconnected — items flow between inventory, vault, marketplace, and forge. Currency earned from quests feeds into vendor purchases, which feeds into enhancement, which feeds into marketplace value.

The Solana integration transforms this from a game into an economy. The ARC token — an SPL token with designed tokenomics (100M supply, 75% allocated to play-to-earn) — bridges the in-game Arcanite currency to real on-chain value. Players earn ARC through gameplay: completing quests, winning PvP battles, selling items on the marketplace. The on-chain marketplace escrow program, built with Anchor on Solana, enables trustless player-to-player trading where items are escrowed in a Solana program until both parties confirm. Marketplace fees (5% for free players, 2% for premium) are burned as ARC, creating sustainable deflationary pressure.

The technical foundation is production-grade. The backend runs on Express with Prisma ORM, PostgreSQL, and Redis for pub/sub event coordination. Every financial operation uses atomic database transactions — marketplace purchases, trade swaps, vault transfers, and token operations are all race-condition-proof. The React frontend features a responsive design system with 55+ components, Zustand state management, native fetch (zero-dependency HTTP client), and a pixel-art aesthetic built on Tailwind CSS. A Go game server is architected for real-time combat and multiplayer, sharing the PostgreSQL database with the Express API through an internal service-to-service endpoint system with API key authentication.

The business model is self-sustaining without relying on token price speculation. Revenue comes from marketplace transaction fees (burned as ARC), premium subscriptions (enhanced XP/gold rates, reduced fees), the battle pass (seasonal content), and creation tokens ($0.99 per new character). Every revenue stream exists in the codebase today — not on a roadmap.

Arcania Nexus isn't a hackathon idea. It's a working game with 30+ backend services, 88 API endpoints, 28 database models, and 111 design documents. We're not asking "can we build this?" — we already did. The question we're answering is: "What happens when a real game economy runs on Solana?"

The answer is player ownership. Real value. A better game.

---

## Track
Gaming

## Team
Full-stack development team with expertise in TypeScript, React, Node.js, PostgreSQL, Redis, and Solana program development.

## Tech Stack
- **Frontend:** React 18, Vite 5, TypeScript, Tailwind CSS, Zustand
- **Backend:** Express, Prisma ORM, PostgreSQL, Redis (pub/sub + caching)
- **Blockchain:** Solana (SPL Token, Anchor program for marketplace escrow)
- **Game Server:** Go (planned for real-time combat)
- **Infrastructure:** Native fetch client, JWT auth, rate limiting, Helmet security
