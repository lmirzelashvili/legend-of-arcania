import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { ARC_MINT_DEVNET, ARC_TOTAL_SUPPLY, ARC_DECIMALS } from '@/config/solana';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`border border-gray-800 bg-black p-4 ${className}`}>
    {children}
  </div>
);

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-amber-400 text-lg">{value}</div>
    <div className="text-gray-600 text-[7px]">{label}</div>
  </div>
);

const SectionHeading: React.FC<{ num: string; title: string }> = ({ num, title }) => (
  <h2 className="text-amber-500 text-[12px] mb-4 uppercase tracking-wider">
    {num}. {title}
  </h2>
);

export const Whitepaper: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ── Header Block ── */}
        <div className="text-center mb-10">
          <h1 className="text-amber-500 text-xl mb-3">LEGEND OF ARCANIA — WHITEPAPER</h1>
          <p className="text-gray-400 text-[8px] leading-relaxed mb-4">
            A 2D MMORPG with player-owned economy on Solana.
            Version 0.1 — May 2026 — Colosseum Frontier submission.
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <span className="border border-green-800 text-green-500 text-[7px] px-3 py-1">
              STATUS: DEVNET LIVE
            </span>
            <span className="border border-amber-800 text-amber-400 text-[7px] px-3 py-1">
              100M ARC SUPPLY MINTED
            </span>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://github.com/lmirzelashvili/legend-of-arcania"
              target="_blank"
              rel="noreferrer"
              className="border border-gray-700 text-gray-400 text-[7px] px-4 py-2 hover:border-amber-700 hover:text-amber-400 transition-colors"
            >
              GITHUB
            </a>
            <a
              href={`https://solscan.io/token/${ARC_MINT_DEVNET}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="border border-gray-700 text-gray-400 text-[7px] px-4 py-2 hover:border-amber-700 hover:text-amber-400 transition-colors"
            >
              SOLSCAN: ARC
            </a>
            <Link
              to="/login"
              className="border border-amber-700 text-amber-500 text-[7px] px-4 py-2 hover:bg-amber-950 hover:text-amber-400 transition-colors"
            >
              PLAY DEMO
            </Link>
          </div>
        </div>

        {/* ── Table of Contents ── */}
        <Card className="mb-12">
          <div className="text-amber-500 text-[9px] mb-4 uppercase tracking-wider">Table of Contents</div>
          <div className="grid md:grid-cols-2 gap-1">
            {[
              ['#section-01', '01. Vision'],
              ['#section-02', '02. The Problem'],
              ['#section-03', '03. The Solution'],
              ['#section-04', '04. Game Systems Live Today'],
              ['#section-05', '05. Solana Architecture'],
              ['#section-06', '06. ARC Tokenomics'],
              ['#section-07', '07. Currency Mechanics'],
              ['#section-08', '08. Conversion Mechanics'],
              ['#section-09', '09. Anti-Abuse Design'],
              ['#section-10', '10. Business Model'],
              ['#section-11', '11. Roadmap'],
              ['#section-12', '12. Team & Hackathon'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-gray-500 text-[8px] hover:text-amber-400 transition-colors py-0.5"
              >
                {label}
              </a>
            ))}
          </div>
        </Card>

        <div className="space-y-16">

          {/* ── 01. Vision ── */}
          <section id="section-01">
            <SectionHeading num="01" title="Vision" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                Every great game has an economy. We're building the one players actually own.
                Legend of Arcania is a 2D top-down MMORPG on Solana — not a token with a game
                stitched on, but a production-grade MMORPG where the blockchain makes the economy real.
              </p>
              <p className="text-gray-400 text-[8px] leading-relaxed">
                We believe the next generation of online games will be defined by one question:
                does the player own what they earn? Arcania's answer is yes — every item traded,
                every Arcanite earned, every marketplace transaction carries real on-chain weight.
                The ARC SPL token is already live on Solana devnet. The economy is already designed.
                The game already runs.
              </p>
              <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Stat value="88" label="API ENDPOINTS" />
                  <Stat value="28" label="DB MODELS" />
                  <Stat value="30+" label="BACKEND SERVICES" />
                  <Stat value="60+" label="UI COMPONENTS" />
                </div>
              </Card>
            </div>
          </section>

          {/* ── 02. The Problem ── */}
          <section id="section-02">
            <SectionHeading num="02" title="The Problem" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                Traditional game economies are fundamentally extractive. Players invest thousands
                of hours grinding for rare items, building characters, and mastering markets — yet
                they own nothing. When a server shuts down, everything disappears. When a player
                quits, their progress has zero transferable value. Game studios capture 100% of
                the economic value that players create.
              </p>
              <p className="text-gray-400 text-[8px] leading-relaxed">
                This is the model that has defined gaming for decades: centralized databases, opaque
                economies, and terms of service that can revoke your "ownership" at any time. The
                result is players who grind without recourse and studios with no accountability to
                the people who actually power their economies.
              </p>
              <Card>
                <div className="space-y-2 text-[8px]">
                  <div className="flex gap-3">
                    <span className="text-red-500 shrink-0">—</span>
                    <span className="text-gray-400">Players grind for years, own nothing when servers shut down</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-red-500 shrink-0">—</span>
                    <span className="text-gray-400">Studios capture 100% of player-created economic value</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-red-500 shrink-0">—</span>
                    <span className="text-gray-400">Virtual items are database entries, not real assets</span>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* ── 03. The Solution ── */}
          <section id="section-03">
            <SectionHeading num="03" title="The Solution" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                Arcania Nexus proves a better model exists. Unlike typical GameFi projects that bolt
                a token onto a minimal prototype, we built a feature-complete game platform first.
                The Nexus — our browser-based management hub — includes 88 API endpoints, 28 database
                models, 30+ backend services, and 60+ UI components. Every system is interconnected:
                items flow between inventory, vault, marketplace, and forge. Currency earned from
                quests feeds vendor purchases, which feeds enhancement, which feeds marketplace value.
              </p>
              <p className="text-gray-400 text-[8px] leading-relaxed">
                The Solana layer transforms this from a game into an economy. The ARC token — an SPL
                token with designed tokenomics — is live on devnet today, with 100M supply minted.
                Players earn ARC through gameplay: completing quests, winning PvP, selling on the
                marketplace. The on-chain escrow program (in progress) enables trustless P2P trading
                where items are escrowed in a Solana program until both parties confirm.
              </p>
              <Card className="border-amber-900">
                <p className="text-amber-400 text-[8px] text-center">
                  Most GameFi: token first, game later. Us: game first, on-chain second.
                </p>
              </Card>
            </div>
          </section>

          {/* ── 04. Game Systems ── */}
          <section id="section-04">
            <SectionHeading num="04" title="Game Systems Live Today" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                All 12 systems below are live in the codebase and accessible through the Nexus hub.
                They are interconnected — not isolated features.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  ['Character Creation', '5 races, 5 classes, stat allocation, pixel paperdoll preview'],
                  ['Equipment System', '+1 to +15 enhancement with risk mechanics and protection scrolls'],
                  ['Marketplace', 'P2P listings with server-side pagination, filtering, and fee burning'],
                  ['Forge', '12 recipes, crystal-boosted success rates, material return on failure'],
                  ['Battle Pass', '30-tier seasonal progression, free + premium tracks'],
                  ['Quests', 'Daily + repeatable quests with state machine (in-progress → claimed)'],
                  ['Vendors', 'Three NPC shops — potions, gear, crafting materials'],
                  ['Inventory + Vault', 'Account-wide vault storage with zone-restricted access'],
                  ['Friends + Direct Trade', 'Lock-based P2P with 10-minute expiry, atomic item swap'],
                  ['Boosters', 'XP and gold rate multipliers with active booster tracking'],
                  ['PvP Leaderboard', 'Kill recording, K/D tracking, streak leaderboard'],
                  ['Sprite Paperdoll', 'LPC-format layered canvas with per-race/class/gender equipment'],
                ].map(([title, desc]) => (
                  <Card key={title}>
                    <div className="text-amber-400 text-[8px] mb-1">{title}</div>
                    <div className="text-gray-600 text-[7px] leading-relaxed">{desc}</div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ── 05. Solana Architecture ── */}
          <section id="section-05">
            <SectionHeading num="05" title="Solana Architecture" />
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <Card className="border-green-900">
                  <div className="text-green-500 text-[8px] mb-2">LIVE TODAY — DEVNET</div>
                  <ul className="text-gray-400 text-[7px] space-y-1.5 leading-relaxed">
                    <li>
                      ARC SPL token mint:{' '}
                      <a
                        href={`https://solscan.io/token/${ARC_MINT_DEVNET}?cluster=devnet`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 underline break-all"
                      >
                        {ARC_MINT_DEVNET.slice(0, 8)}…
                      </a>
                    </li>
                    <li>{ARC_TOTAL_SUPPLY.toLocaleString()} ARC supply minted at genesis</li>
                    <li>Phantom wallet adapter integrated in React client</li>
                    <li>Wallet-link with ed25519 signature verification (tweetnacl, server-side)</li>
                    <li>8 SSE channels for real-time event push</li>
                  </ul>
                </Card>
                <Card className="border-yellow-900">
                  <div className="text-yellow-500 text-[8px] mb-2">IN PROGRESS — 4-WEEK SPRINT</div>
                  <ul className="text-gray-400 text-[7px] space-y-1.5 leading-relaxed">
                    <li>Anchor marketplace escrow program (Rust)</li>
                    <li>Arcanite ↔ ARC bridge with time-lock bonus tiers</li>
                    <li>Server pivots from "owns trades" to "watches chain"</li>
                    <li>Wallet-link UI flow polish + ARC faucet endpoint</li>
                  </ul>
                </Card>
                <Card className="border-blue-900">
                  <div className="text-blue-400 text-[8px] mb-2">MAINNET — Q3 2026</div>
                  <ul className="text-gray-400 text-[7px] space-y-1.5 leading-relaxed">
                    <li>Production ARC deployment</li>
                    <li>Full withdrawal flow to player wallets</li>
                    <li>Fiat off-ramp partner integrations</li>
                    <li>Phaser 3 world scene (real-time movement)</li>
                  </ul>
                </Card>
              </div>
            </div>
          </section>

          {/* ── 06. ARC Tokenomics ── */}
          <section id="section-06">
            <SectionHeading num="06" title="ARC Tokenomics" />
            <div className="space-y-4">
              <Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Stat value="100M" label="TOTAL SUPPLY (FIXED)" />
                  <Stat value="9" label="DECIMALS" />
                  <Stat value="75%" label="TO PLAYERS (DESIGN)" />
                  <Stat value="3–5%" label="TARGET ANNUAL DEFLATION" />
                </div>
              </Card>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">SUPPLY NOTES</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    100,000,000 ARC total supply — fixed forever, never inflated. Design intent:
                    75% allocated to play-to-earn distribution, 25% to treasury, team, and
                    operational runway. Decimals: {ARC_DECIMALS}. Primary acquisition: gameplay,
                    not purchases.
                  </p>
                </Card>
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">BURN DISTRIBUTION</div>
                  <div className="space-y-1 text-[7px]">
                    {[
                      ['Marketplace fees', '~40%'],
                      ['Conversion fees', '~30%'],
                      ['Premium features', '~20%'],
                      ['Cosmetics / upgrades', '~10%'],
                    ].map(([label, pct]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-400">{label}</span>
                        <span className="text-amber-400">{pct}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <Card>
                <div className="text-amber-400 text-[8px] mb-2">DEFLATION SCHEDULE</div>
                <div className="grid md:grid-cols-3 gap-4 text-[7px]">
                  <div>
                    <div className="text-gray-300 mb-1">Year 1 — Growth</div>
                    <div className="text-gray-500">~22.5M emitted, ~2–4M burned. Net inflationary (ecosystem growing).</div>
                  </div>
                  <div>
                    <div className="text-gray-300 mb-1">Year 2 — Transition</div>
                    <div className="text-gray-500">~7.5M emitted, ~4–6M burned. Near neutral to deflationary.</div>
                  </div>
                  <div>
                    <div className="text-gray-300 mb-1">Year 3+ — Deflationary</div>
                    <div className="text-gray-500">~6M emitted, ~6–8M burned. Target 3–5% annual deflation.</div>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* ── 07. Currency Mechanics ── */}
          <section id="section-07">
            <SectionHeading num="07" title="Currency Mechanics" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                Arcania uses a three-tier currency system. Each tier serves a distinct role and
                connects to the next through intentional mechanics that reward genuine play.
              </p>
              <div className="grid md:grid-cols-3 gap-3">
                <Card>
                  <div className="text-yellow-500 text-[9px] mb-2">GOLD</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    Off-chain gameplay currency. Earned from monsters, quests, dungeons,
                    and NPC sales. Unlimited supply — no real-world value. Used for
                    vendors, stat respecs, vault expansion, marketplace fees, and
                    equipment enhancement. The everyday economy layer.
                  </p>
                </Card>
                <Card>
                  <div className="text-cyan-400 text-[9px] mb-2">ARCANITE</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    Scarce premium currency with active sink mechanics. Earned through
                    Battle Pass rewards, rare world drops, and achievement milestones.
                    Can be purchased directly. Convertible to ARC at 100:1 base rate.
                    Earn cap pegged to ARC emissions — halves with the emission schedule.
                  </p>
                </Card>
                <Card>
                  <div className="text-amber-400 text-[9px] mb-2">ARC TOKEN</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    SPL token on Solana. Live on devnet today. Earned by converting
                    Arcanite (Level 35+, 100 hours, 30 days account age). Tradeable
                    on DEX. Used for premium features, governance, and marketplace
                    transactions. Mainnet + tradeable: Q3 2026.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* ── 08. Conversion Mechanics ── */}
          <section id="section-08">
            <SectionHeading num="08" title="Conversion Mechanics" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                The Arcanite-to-ARC conversion system rewards dedicated, long-term players over
                extractors and bots. Two multipliers determine your final rate:
                Account Rate (40–100% based on progression) and Time-Lock Rate (30–100% based
                on withdrawal speed).
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <div className="text-amber-400 text-[8px] mb-3">ACCOUNT RATE (40–100%)</div>
                  <div className="space-y-1 text-[7px]">
                    {[
                      ['Level (30%)', 'L35→8% | L55→15% | L85→30%'],
                      ['Playtime (20%)', '100h→5% | 400h→15% | 1000h→20%'],
                      ['Achievements (50%)', 'Homeland→10% | All quests→40% | All milestones→50%'],
                    ].map(([factor, detail]) => (
                      <div key={factor} className="flex flex-col gap-0.5">
                        <span className="text-gray-300">{factor}</span>
                        <span className="text-gray-500">{detail}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <div className="text-amber-400 text-[8px] mb-3">TIME-LOCK RATES</div>
                  <div className="space-y-2 text-[7px]">
                    {[
                      ['Instant', '30–60%', 'Oracle-adjusted'],
                      ['1-Week Lock', '60–80%', 'Oracle-adjusted'],
                      ['2-Week Lock', '100%', 'Always fixed'],
                    ].map(([type, rate, note]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-400">{type}</span>
                        <span className="text-amber-400">{rate}</span>
                        <span className="text-gray-600">{note}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              <Card className="border-amber-900">
                <div className="text-amber-400 text-[8px] mb-2">VETERAN EXAMPLE</div>
                <p className="text-gray-400 text-[7px] leading-relaxed">
                  Veteran player (Level 85, all achievements, 1,200h+ playtime) converting 1,000
                  Arcanite with 2-week lock: Account Rate 100% × Time-Lock 100% = 100% final
                  rate. Base 10 ARC minus 2% burn fee = <span className="text-amber-400">~9.8 ARC received</span>.
                </p>
              </Card>
              <Card>
                <div className="text-amber-400 text-[8px] mb-2">DYNAMIC ORACLE</div>
                <p className="text-gray-400 text-[7px] leading-relaxed">
                  The Oracle adjusts only Instant and 1-Week rates plus weekly caps, reviewed
                  every Monday at 00:00 UTC with 7-day advance notice. The 2-week lock rate
                  is always 100% — patience is always rewarded. Weekly caps: 10,000 Arcanite
                  basic / 20,000 with KYC.
                </p>
              </Card>
            </div>
          </section>

          {/* ── 09. Anti-Abuse Design ── */}
          <section id="section-09">
            <SectionHeading num="09" title="Anti-Abuse Design" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed italic">
                Note: these mechanisms are designed and documented — not yet enforced on devnet.
                Enforcement begins alongside the Arcanite ↔ ARC bridge (4-week sprint).
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">WEEKLY CAPS</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    10,000 Arcanite / week for basic accounts. 20,000 with KYC verification.
                    Oracle can tighten caps (floor: 5k / 10k KYC) during economic stress.
                  </p>
                </Card>
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">BOT DETECTION</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    Behavioral analysis flags abnormal play patterns. Achievements are the
                    50%-weighted factor specifically because they require genuine skill
                    that bots cannot easily replicate.
                  </p>
                </Card>
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">ACTIVITY REQUIREMENTS</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    Level 35 minimum, 100+ hours of play spread over 30+ calendar days.
                    Playtime must be accumulated naturally — rapid farming doesn't qualify.
                  </p>
                </Card>
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">HALVING SCHEDULE</div>
                  <p className="text-gray-400 text-[7px] leading-relaxed">
                    ARC emissions follow a 6-month halving schedule, with tail emissions of
                    500k/month starting Year 2. Arcanite earn rates halve in lockstep.
                    Sustainable long-term without driving inflation.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          {/* ── 10. Business Model ── */}
          <section id="section-10">
            <SectionHeading num="10" title="Business Model" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                Self-sustaining without relying on token price speculation. Five revenue streams —
                all present in the codebase today.
              </p>
              <Card>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-[7px] text-gray-500 border-b border-gray-800 pb-2 mb-2">
                    <span>STREAM</span>
                    <span>DETAIL</span>
                    <span>ON-CHAIN</span>
                  </div>
                  {[
                    ['Marketplace Fees', '5% free / 2% premium', 'Burned as ARC'],
                    ['Premium Subscriptions', 'Enhanced XP/gold rates, reduced fees', 'Off-chain'],
                    ['Battle Pass', 'Seasonal content $5–10', 'Off-chain'],
                    ['Creation Tokens', '$0.99 per new character slot', 'Off-chain'],
                    ['Arcanite Packages', '$0.99 – $49.99 (Starter to Ultimate)', 'Bridges to ARC'],
                  ].map(([stream, detail, chain]) => (
                    <div key={stream} className="grid grid-cols-3 text-[7px]">
                      <span className="text-amber-400">{stream}</span>
                      <span className="text-gray-400">{detail}</span>
                      <span className="text-gray-600">{chain}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="border-amber-900">
                <p className="text-amber-400 text-[8px] text-center">
                  Every revenue stream exists in the codebase today — not on a roadmap.
                </p>
              </Card>
            </div>
          </section>

          {/* ── 11. Roadmap ── */}
          <section id="section-11">
            <SectionHeading num="11" title="Roadmap" />
            <div className="space-y-4">
              <Card>
                <div className="space-y-3">
                  {[
                    ['NOW (MAY 2026)', 'ARC SPL token live on Solana devnet. 100M supply minted. Phantom wallet adapter. ed25519 signature verification.'],
                    ['+ 1 WEEK', 'Wallet-link UI flow polish. ARC faucet endpoint. Conversion UI prototype.'],
                    ['+ 4 WEEKS', 'Anchor marketplace escrow program (Rust). Arcanite ↔ ARC bridge with time-lock bonus tiers. Server "watches chain" pivot.'],
                    ['Q3 2026', 'Mainnet ARC deployment. Full withdrawal flow to player wallets. Phaser 3 world scene. Fiat off-ramp partners.'],
                    ['Q4 2026', 'Combat loop. On-chain loot drops. PvP economy with ARC rewards. Guild system.'],
                    ['2027', 'Mobile client. Guild treasuries. Cross-game asset interop. DAO governance launch.'],
                  ].map(([phase, desc]) => (
                    <div key={phase} className="flex gap-4 text-[7px]">
                      <div className="text-amber-400 w-24 shrink-0">{phase}</div>
                      <div className="text-gray-400 leading-relaxed">{desc}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* ── 12. Team & Hackathon ── */}
          <section id="section-12">
            <SectionHeading num="12" title="Team & Hackathon" />
            <div className="space-y-4">
              <p className="text-gray-400 text-[8px] leading-relaxed">
                Arcania Nexus is built by a Tbilisi-based full-stack team applying for the
                Colosseum Accelerator ($250K program) under the Gaming track. We are not
                pitching a concept — we are demonstrating a working product with 111 design
                documents, 30+ backend services, and an SPL token already deployed on Solana devnet.
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">CONFIRMED DEVS</div>
                  <div className="space-y-1 text-[7px]">
                    <div className="text-gray-400">Lasha Mirzelashvili — Full-Stack Lead</div>
                    <div className="text-gray-400">Giorgi Tsereteli — Full-Stack Engineer</div>
                  </div>
                  <div className="text-gray-600 text-[7px] mt-3 italic">
                    Team bios and Telegram will be added before submission deadline.
                  </div>
                </Card>
                <Card>
                  <div className="text-amber-400 text-[8px] mb-2">HACKATHON</div>
                  <div className="space-y-1 text-[7px]">
                    <div className="text-gray-400">Event: Colosseum Frontier</div>
                    <div className="text-gray-400">Track: Gaming ($25K prize)</div>
                    <div className="text-gray-400">Accelerator: $250K potential</div>
                    <div className="text-gray-400">Deadline: May 11, 2026</div>
                    <div className="mt-2">
                      <a
                        href="https://github.com/lmirzelashvili/legend-of-arcania"
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        github.com/lmirzelashvili/legend-of-arcania
                      </a>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

        </div>

        {/* ── Footer ── */}
        <div className="mt-16 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-700 text-[7px]">
            Whitepaper v0.1 — May 11 2026. Living document. Last updated for Colosseum Frontier submission.
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default Whitepaper;
