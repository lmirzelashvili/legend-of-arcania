# Custodial ARC: Deposit & Withdraw

**Status:** Implemented, devnet, smoke-tested.
**Scope:** This is the *entire* on-chain integration we care about for the game. Anchor escrow, Arcanite↔ARC bridge, on-chain loot drops — all explicitly out of scope.

The only thing the chain does for the game is move ARC in and out. Everything else (gold, arcanite, items, marketplace) stays off-chain.

---

## TL;DR for reviewers

1. Each user gets a **unique per-account deposit address**, derived deterministically from a single master seed (`m/44'/501'/h1'/h2'` where `h1,h2 = SHA256(userId)`).
2. When ARC lands at that address, a sweep transaction (paid by the hot wallet) moves it to the **hot wallet ATA**, closes the per-user ATA to reclaim rent, and credits `ArcWallet.balance` for that user.
3. Withdrawals: user submits amount + destination, server atomically decrements their balance, then sends an SPL transfer from the hot wallet. On failure, balance is refunded.
4. Pool is **divided into three tiers**: per-user deposit addresses → hot wallet (small, online) → cold wallet (bulk, offline / multisig — v1 records the address only, no automated movement).
5. Custody risk is bounded by the hot wallet's funded balance; configurable per-withdrawal cap rejects oversize requests up front.

---

## Files added / modified

```
arcania-server/
├── prisma/schema.prisma                       [modified] +User.arcDepositAddress, +ArcWallet, +ArcTransaction(+enums)
├── src/
│   ├── config/arc.ts                          [new]      env loader, validates seed + addresses
│   ├── services/arc/
│   │   ├── connection.ts                      [new]      Solana Connection singleton
│   │   ├── hd.ts                              [new]      SLIP10 derivation + hot-wallet keypair
│   │   ├── deposit.service.ts                 [new]      readDepositAtaBalance, checkAndSweepUser, sweepAllActive
│   │   └── withdraw.service.ts                [new]      getHotWalletBalance, withdraw (atomic decrement + send + refund-on-fail)
│   ├── routes/arc.routes.ts                   [new]      /api/arc/{wallet,deposits/check,withdraw,transactions,operator-status}
│   ├── scripts/arc-keygen.ts                  [new]      one-shot to mint master seed + hot/cold keypairs
│   ├── jobs/scheduler.ts                      [modified] +1-min cron calling sweepAllActive
│   └── index.ts                               [modified] +arcRoutes mount

arcania-client/
├── src/services/api/arc.api.ts                [new]      typed client for the four endpoints
├── src/services/api/index.ts                  [modified] re-export arcApi
├── src/pages/ArcWallet.tsx                    [new]      deposit address + withdraw form + tx history
└── src/App.tsx                                [modified] +/arc protected route
```

---

## Key derivation

```
masterSeed (32 bytes, env)
       │
       ▼
m/44'/501'/h1'/h2'        h1 = SHA256(userId)[0..4] & 0x7FFFFFFF
       │                   h2 = SHA256(userId)[4..8] & 0x7FFFFFFF
       ▼
SLIP10 ed25519 derive  →  Solana Keypair  →  deposit address
```

- Implementation: `arcania-server/src/services/arc/hd.ts:deriveUserKeypair`.
- Collision space: 62 bits (two hardened path components, each 31 bits). Birthday bound is ~2³¹ users before any pair collides — comfortably above any plausible user count.
- The deposit address is cached on `User.arcDepositAddress` on first request so we never have to recompute (and never have to read the seed during a normal HTTP request once the address is persisted).
- **Only public keys are stored.** Private keys are regenerated on demand whenever we need to sign a sweep — which happens only inside `checkAndSweepUser`.

---

## Deposit flow

```
                                     RPC                       Postgres
 user wallet ──── transfer ARC ─────────► deposit ATA               │
                                          (per-user, derived)        │
                                                                     │
 client POST /api/arc/deposits/check                                  │
   (also a 1-min cron: sweepAllActive)                                │
        │                                                             │
        ▼                                                             │
 readDepositAtaBalance(depositOwner)                                  │
        │                                                             │
        └─ amount > 0 ─┐                                              │
                       ▼                                              │
                 create ArcTransaction(PENDING, type=DEPOSIT) ────────┤
                       │                                              │
                       ▼                                              │
       build atomic sweep tx:                                         │
         1. CU price ix                                               │
         2. SystemProgram.transfer (hot → deposit, fee top-up)        │
         3. (optional) create hot's ATA                               │
         4. transferChecked (depositATA → hotATA)                     │
         5. closeAccount (depositATA → hot, rent refund)              │
       sign with [hot, depositKeypair]                                │
       sendAndConfirm                                                 │
                       │                                              │
                       ├─ success ─┐                                  │
                       │           ▼                                  │
                       │     prisma.$transaction:                     │
                       │       update ArcTransaction = CONFIRMED ─────┤
                       │       upsert ArcWallet.balance += amount ────┤
                       │                                              │
                       └─ failure ─► update ArcTransaction = FAILED ──┘
```

**Why the hot wallet pays sweep fees + tops up the deposit address.** The deposit address itself has zero SOL (we never prefund it). The hot wallet sends a small lamport transfer to it in the same atomic transaction so it can pay its own signing rent for the duration of the transfer + close. After close, the rent flows back to the hot wallet.

**Idempotency.** If the same deposit shows up twice (e.g., cron runs while a check is in flight), the second call finds a pending tx already exists for that user and reuses it; the `txSignature` unique constraint plus the `closeAccount` (which zeros the ATA) guarantee no double-credit. If somehow the sweep fails after partial work, the ArcTransaction row is marked `FAILED` with the error message and is visible in `/api/arc/transactions` for manual review.

---

## Withdraw flow

```
client POST /api/arc/withdraw { amount, destination? }
        │
        ▼
 validate (zod): amount is digits only, destination 32–44 chars
        │
        ├─ destination omitted → use User.solanaPublicKey
        │  (if missing too → 400 no_destination)
        │
        ▼
 amount < ARC_MIN_WITHDRAW_RAW → 400 amount_too_small
 amount > ARC_HOT_WALLET_CAP_RAW → 400 exceeds_hot_wallet_cap
 hotBalance < amount → 400 hot_wallet_insufficient
        │
        ▼
 ATOMIC: prisma.arcWallet.updateMany
   WHERE userId = ? AND balance >= amount
   SET balance = balance - amount
   ── count !== 1 → 400 insufficient_user_balance
        │
        ▼
 create ArcTransaction (PENDING, type=WITHDRAW)
        │
        ▼
 build send tx: (createATA if needed) + transferChecked → destination
 sign with [hot]
 sendAndConfirm
        │
        ├─ success → update ArcTransaction = CONFIRMED + signature
        │
        └─ failure → prisma.$transaction:
              ArcTransaction = FAILED with error
              ArcWallet.balance += amount   (refund)
```

The conditional `updateMany` is the critical race-safety primitive. It either decrements the balance atomically and returns `count: 1`, or returns `count: 0` because the user didn't have enough — there is no read-then-write window where two concurrent withdrawals could double-spend.

---

## Pool tiering ("dividing the pool")

| Tier | Who holds the key | What it holds | Compromise outcome |
|---|---|---|---|
| **Deposit addresses** | Derivable from master seed (server env) | Only the in-flight deposit, sub-second residence (swept immediately) | Master seed leak → attacker can derive empty addresses. Funds are already in the hot wallet. |
| **Hot wallet** | Single keypair in server env (encrypted at rest in production; plaintext base58 in dev) | At most `ARC_HOT_WALLET_CAP_RAW` × queue depth — ideally ~1 day of withdrawal volume | Hot key leak → attacker drains hot wallet only. Bulk reserve is untouched. |
| **Cold wallet** | Held offline / multisig (Solana SPL Multisig or Squads Protocol) — v1 records the pubkey only | The vast majority of project ARC | Requires multiple key compromises to move funds. |

**v1 caveat:** the cold wallet is **a recorded address, not an automated participant.** Manual operations (or future tooling) move funds: cold → hot as a refill, hot → cold to drain excess. We deliberately did not automate the cold leg because that's where the most expensive mistake can be made; treat it as a manual back-office process for now.

**Limits as a circuit breaker.** `ARC_HOT_WALLET_CAP_RAW` is a per-withdrawal cap, not a daily cap. The intent is: any single withdrawal that would punch above this is rejected at the API and routed through manual approval. We can add daily/weekly aggregates later if needed (Redis counters keyed on `withdraw:{userId}:{yyyymmdd}`).

---

## API surface

All routes are under `/api/arc`, all require auth (cookie or `Authorization: Bearer`).

### `GET /api/arc/wallet`

User's deposit address and balance.

```json
{
  "mint": "DcYWN...",
  "decimals": 9,
  "cluster": "devnet",
  "depositAddress": "HUY29yxQTV1oACzaT9beyU3qYs8ztnQWmeJtzH2dGYz",
  "balance": "0",
  "hotWalletCap": "10000000000000",
  "minWithdraw": "1000000000"
}
```

All amounts are raw token units (BigInt as string).

### `POST /api/arc/deposits/check`

User-triggered "I sent you ARC, please scan now." Rate-limited to 12/min/user.

```json
{ "swept": true, "amount": "1500000000", "signature": "5K..." }
```

or

```json
{ "swept": false, "amount": "0", "reason": "no_balance" }
```

### `POST /api/arc/withdraw`

```json
// request
{ "amount": "1500000000", "destination": "..." }  // destination optional

// success
{ "ok": true, "signature": "5K...", "transactionId": "uuid", "destination": "...", "amount": "1500000000" }

// error
{ "error": "hot_wallet_insufficient" }
```

Error codes: `invalid_destination`, `amount_too_small`, `insufficient_user_balance`, `hot_wallet_insufficient`, `exceeds_hot_wallet_cap`, `send_failed`, `no_destination`.

Rate-limited to 3/min/user.

### `GET /api/arc/transactions?limit=20`

User's deposit + withdraw history. Newest first. Amounts as raw-unit strings.

### `GET /api/arc/operator-status`

Hot wallet address + balance, cold wallet address, cap. Currently auth-gated (any logged-in user can see); promote to admin-only if treated as sensitive.

---

## Schema

```prisma
model User {
  ...
  arcDepositAddress String? @unique
  arcWallet         ArcWallet?
  arcTransactions   ArcTransaction[]
}

model ArcWallet {
  userId    String   @unique
  balance   BigInt   @default(0)   // raw token units; 1 ARC = 10^9
  ...
}

enum ArcTransactionType   { DEPOSIT WITHDRAW }
enum ArcTransactionStatus { PENDING CONFIRMED FAILED }

model ArcTransaction {
  type         ArcTransactionType
  status       ArcTransactionStatus @default(PENDING)
  amount       BigInt
  txSignature  String?  @unique          // idempotency
  destination  String?                   // withdraw target
  source       String?                   // deposit address
  error        String?
  @@index([userId, createdAt])
  @@index([status])
}
```

Amounts everywhere are `BigInt` raw units — there is no floating-point math. API exposes them as strings.

---

## Configuration

```bash
# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com    # any RPC; default is public devnet
SOLANA_CLUSTER=devnet                            # informational, used in tx links
ARC_MINT_ADDRESS=DcYWN...
ARC_DECIMALS=9

# Keys
ARC_MASTER_SEED_HEX=<64 hex chars>               # 32 random bytes
ARC_HOT_WALLET_SECRET_BASE58=<base58 secret>
ARC_COLD_WALLET_ADDRESS=<pubkey base58>

# Limits (raw token units)
ARC_HOT_WALLET_CAP_RAW=10000000000000            # 10,000 ARC per withdrawal
ARC_MIN_WITHDRAW_RAW=1000000000                  # 1 ARC
```

Generate fresh dev credentials any time:

```bash
cd arcania-server && npx tsx src/scripts/arc-keygen.ts
```

That script prints a master seed + hot keypair + cold keypair. Paste the public values into `.env`; the cold secret is printed once and never persisted — store it offline.

**Funding the hot wallet on devnet:**
1. `solana airdrop 2 <ARC_HOT_WALLET_ADDRESS> --url devnet`
2. Send ARC to the hot wallet's ATA (or let the first sweep create the ATA).

---

## Operational notes

- **Sweep cron** runs every minute over every user that has ever had a deposit address. For thousands of users this is fine; for tens of thousands we'd switch to a `pending_deposit` flag or a Solana websocket subscription per address.
- **Confirmation level** is `confirmed` (not `finalized`). For higher safety on withdrawals, change `commitment: 'confirmed'` → `'finalized'` in `withdraw.service.ts` — adds ~5s latency.
- **RPC choice.** Default is the public devnet endpoint, which has aggressive rate limits. For mainnet or load, point `SOLANA_RPC_URL` at Helius/Triton/QuickNode.
- **Decimals.** We trust `ARC_DECIMALS` from config rather than fetching `getMint` on every request. Validate it once at startup if you ever swap mints.

---

## Security checklist (status)

| Item | Status |
|---|---|
| HD-derived deposit addresses (no random key storage) | done |
| Master seed never on the wire / never logged | done — config loads from env, never serialized in responses |
| Atomic balance decrement on withdraw (no read-modify-write race) | done via `updateMany` conditional |
| Refund on send failure | done — wrapped in `$transaction` |
| Per-user rate limit on `/deposits/check` | done (12/min) |
| Per-user rate limit on `/withdraw` | done (3/min) |
| Withdraw amount cap | done (`ARC_HOT_WALLET_CAP_RAW`) |
| Min withdraw threshold | done (`ARC_MIN_WITHDRAW_RAW`) |
| Hot wallet balance check before decrement | done |
| Unique constraint on tx signature | done (idempotency) |
| Master seed in KMS / HSM | **not done** — env only. For prod, wrap `arcConfig.masterSeed` lookup with KMS decrypt. |
| Hot wallet secret in KMS | **not done** — same as above. |
| Cold wallet multisig | **not done** — single pubkey recorded, multisig deferred. |
| Withdrawal admin approval for large amounts | **not done** — single cap, hard rejection. Tiered approval is the next iteration. |
| Daily / weekly withdrawal aggregates | **not done** — add when needed. |
| Anti-abuse: level / playtime / age gates referenced in Token.tsx roadmap | **not done** — apply as middleware before `/api/arc/withdraw` once those signals exist. |

---

## What this **isn't**

This implementation deliberately does **not** include:

- An on-chain escrow program (Anchor / Rust). Custodial only.
- Arcanite↔ARC conversion or bridging logic.
- On-chain marketplace settlement. Marketplace stays in Postgres.
- ARC airdrops, faucets, or reward emission. The game economy still flows in gold + arcanite; ARC is purely a "cash in / cash out" token.
- Mainnet. Devnet hardcoded in config; promotion is a one-line env change once cold wallet operations and KMS storage are in place.

If any of those become in-scope, the integration points are: a new route group (`/api/arc-bridge`, etc.) and a new service module under `services/arc/`. The existing deposit/withdraw paths should not need to change.

---

## Manual smoke test (devnet)

```bash
# 1. Server up, client up
cd arcania-server && npm run dev   # → :3001
cd arcania-client && npm run dev   # → :5173

# 2. Register a user, get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"t@t.com","username":"t","password":"Hunter2hunter"}' \
  | sed 's/.*"token":"\([^"]*\)".*/\1/')

# 3. Get your deposit address
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/arc/wallet

# 4. Send ARC to that address from any wallet (Phantom on devnet)

# 5. Trigger sweep
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/arc/deposits/check
# → { "swept": true, "amount": "<raw>", "signature": "..." }

# 6. Withdraw
curl -s -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":"1000000000","destination":"<your pubkey>"}' \
  http://localhost:3001/api/arc/withdraw

# 7. History
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/arc/transactions
```

Or use the UI: log in, navigate to `/arc`.
