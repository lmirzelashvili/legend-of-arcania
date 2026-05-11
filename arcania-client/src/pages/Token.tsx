import React, { useEffect, useMemo, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Layout } from '@/components/Layout/Layout';
import { ARC_MINT_DEVNET, ARC_TREASURY_ATA_DEVNET, ARC_TOTAL_SUPPLY } from '@/config/solana';
import { shortenAddress } from '@/utils/solana';

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

/** Shorten an address to first-6 + last-4 chars for on-chain links. */
function shortenAddr(addr: string): string {
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const ARC_BALANCE_REFRESH_MS = 30_000;

export const Token: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [arcBalance, setArcBalance] = useState<number | null>(null);

  // Memoize PublicKey so it isn't re-instantiated each render.
  const arcMintKey = useMemo(() => new PublicKey(ARC_MINT_DEVNET), []);

  useEffect(() => {
    if (!publicKey) {
      setArcBalance(null);
      return;
    }

    let cancelled = false;

    const fetchArcBalance = async () => {
      try {
        const result = await connection.getParsedTokenAccountsByOwner(publicKey, { mint: arcMintKey });
        if (cancelled) return;
        const total = result.value.reduce((sum, { account }) => {
          const uiAmount: number = account.data.parsed.info.tokenAmount.uiAmount ?? 0;
          return sum + uiAmount;
        }, 0);
        setArcBalance(total);
      } catch {
        // Non-critical — leave balance as-is if fetch fails.
      }
    };

    void fetchArcBalance();
    const id = setInterval(() => void fetchArcBalance(), ARC_BALANCE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [publicKey, connection, arcMintKey]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-amber-500 text-xl mb-2 text-center">TOKEN ECONOMY</h1>
        <p className="text-gray-600 text-[8px] mb-12 text-center">Play-to-Earn with sustainable tokenomics</p>

        {/* Live on Devnet */}
        <Card className="mb-4 border-green-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[7px] font-pixel text-amber-500">LIVE ON SOLANA DEVNET</span>
            <span className="text-green-500 border border-green-900 text-[7px] px-2 py-0.5">STATUS: DEPLOYED</span>
          </div>
          <div className="grid md:grid-cols-3 gap-3 text-[7px] mb-3">
            <div>
              <div className="text-gray-400 mb-1">MINT ADDRESS</div>
              <a
                href={`https://solscan.io/token/${ARC_MINT_DEVNET}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                title={ARC_MINT_DEVNET}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                {shortenAddr(ARC_MINT_DEVNET)}
              </a>
            </div>
            <div>
              <div className="text-gray-400 mb-1">TREASURY</div>
              <a
                href={`https://solscan.io/account/${ARC_TREASURY_ATA_DEVNET}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                title={ARC_TREASURY_ATA_DEVNET}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                {shortenAddr(ARC_TREASURY_ATA_DEVNET)}
              </a>
            </div>
            <div>
              <div className="text-gray-400 mb-1">TOTAL SUPPLY</div>
              <span className="text-amber-400">{ARC_TOTAL_SUPPLY.toLocaleString()} ARC</span>
            </div>
          </div>
          <p className="text-gray-600 text-[7px]">Connect Phantom (top-right) to view your ARC balance below.</p>
        </Card>

        {/* My ARC Balance */}
        <Card className="mb-8 border-gray-800">
          <div className="text-amber-500 text-[9px] mb-2">MY ARC BALANCE</div>
          {!publicKey ? (
            <p className="text-gray-600 text-[8px]">Connect a wallet to view your ARC balance.</p>
          ) : (
            <div className="text-[8px] space-y-1">
              <div className="text-gray-500">
                Wallet: <span className="text-amber-400">{shortenAddress(publicKey.toBase58())}</span>
              </div>
              <div className="text-gray-500">
                ARC Balance:{' '}
                <span className="text-amber-400">
                  {arcBalance === null
                    ? 'Loading…'
                    : arcBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </span>
              </div>
              {arcBalance === 0 && (
                <div className="text-gray-600 text-[7px]">You don't hold any ARC yet. Faucet flow coming soon.</div>
              )}
            </div>
          )}
        </Card>

        {/* Key Stats */}
        <Card className="mb-8">
          <div className="grid grid-cols-3 gap-4">
            <Stat value="100M" label="MAX SUPPLY" />
            <Stat value="75%" label="TO PLAYERS" />
            <Stat value="0%" label="PAY-TO-WIN" />
          </div>
        </Card>

        {/* Not Required */}
        <Card className="mb-8 border-green-900">
          <p className="text-green-500 text-[8px] text-center">
            ARC Token is NOT required to play. All gameplay is accessible with Gold.
          </p>
        </Card>

        {/* Currency System */}
        <h2 className="text-amber-500 text-[10px] mb-6">DUAL CURRENCY SYSTEM</h2>
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          <Card>
            <div className="text-yellow-500 text-[10px] mb-2">GOLD</div>
            <p className="text-gray-500 text-[7px] mb-2">Off-chain gameplay currency</p>
            <ul className="text-gray-600 text-[7px] space-y-1">
              <li>• Earned from monsters</li>
              <li>• Used for vendors</li>
              <li>• No real-world value</li>
            </ul>
          </Card>
          <Card>
            <div className="text-cyan-400 text-[10px] mb-2">ARCANITE</div>
            <p className="text-gray-500 text-[7px] mb-2">Bridged premium currency</p>
            <ul className="text-gray-600 text-[7px] space-y-1">
              <li>• Earned from achievements</li>
              <li>• Convertible to ARC</li>
              <li>• 100 Arcanite = 1 ARC</li>
            </ul>
          </Card>
          <Card>
            <div className="text-amber-400 text-[10px] mb-2">ARC TOKEN</div>
            <p className="text-gray-500 text-[7px] mb-2">SPL token live on Solana devnet</p>
            <ul className="text-gray-600 text-[7px] space-y-1">
              <li>• Live on devnet today</li>
              <li>• Mainnet + tradeable Q3 2026</li>
              <li>• Withdrawal — 4-week sprint</li>
            </ul>
          </Card>
        </div>

        {/* Earning Requirements */}
        <h2 className="text-amber-500 text-[10px] mb-6">EARNING REQUIREMENTS</h2>
        <Card className="mb-8">
          <div className="grid md:grid-cols-3 gap-4 text-center text-[8px]">
            <div>
              <div className="text-amber-400 mb-1">Level 35+</div>
              <div className="text-gray-600">Minimum level</div>
            </div>
            <div>
              <div className="text-amber-400 mb-1">100+ Hours</div>
              <div className="text-gray-600">Playtime required</div>
            </div>
            <div>
              <div className="text-amber-400 mb-1">30+ Days</div>
              <div className="text-gray-600">Account age</div>
            </div>
          </div>
        </Card>

        {/* Withdrawal */}
        <h2 className="text-amber-500 text-[10px] mb-6">WITHDRAWAL OPTIONS</h2>
        <div className="grid md:grid-cols-2 gap-3 mb-8">
          <Card>
            <div className="text-amber-400 text-[9px] mb-2">INSTANT</div>
            <p className="text-gray-500 text-[7px] mb-2">3% fee, immediate access</p>
            <div className="text-gray-600 text-[7px]">Designed: withdrawal goes to treasury</div>
          </Card>
          <Card>
            <div className="text-amber-400 text-[9px] mb-2">TIME-LOCKED</div>
            <p className="text-gray-500 text-[7px] mb-2">2% fee, 7-day lock</p>
            <div className="text-gray-600 text-[7px]">Designed: fee is burned (deflationary)</div>
          </Card>
        </div>

        {/* Anti-Abuse */}
        <h2 className="text-amber-500 text-[10px] mb-6">PLANNED ANTI-ABUSE MEASURES</h2>
        <Card>
          <div className="text-gray-600 text-[7px] italic mb-3">// DESIGNED, NOT YET ENFORCED</div>
          <div className="grid md:grid-cols-2 gap-4 text-[7px]">
            <div>
              <div className="text-gray-400 mb-1">Weekly Caps</div>
              <div className="text-gray-600">10k basic / 20k with KYC</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Bot Detection</div>
              <div className="text-gray-600">Behavioral analysis</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Activity Requirements</div>
              <div className="text-gray-600">Must play to earn</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Halving Schedule</div>
              <div className="text-gray-600">Sustainable emissions</div>
            </div>
          </div>
        </Card>

        {/* Philosophy */}
        <h2 className="text-amber-500 text-[10px] mt-12 mb-6">DESIGN PHILOSOPHY</h2>
        <Card className="mb-8">
          <p className="text-gray-500 text-[8px] leading-relaxed">
            Arcania is a game first. The token economy rewards dedicated players, not extractors.
            We believe sustainable play-to-earn requires fun gameplay - if the game isn't worth
            playing without earning potential, the economy will collapse.
          </p>
        </Card>

        {/* Roadmap */}
        <h2 className="text-amber-500 text-[10px] mb-6">ROADMAP</h2>
        <Card>
          <div className="space-y-3 text-[7px]">
            <div className="flex gap-4">
              <div className="text-amber-400 w-16 shrink-0">NOW</div>
              <div className="text-gray-500">ARC SPL token live on Solana devnet (100M supply minted)</div>
            </div>
            <div className="flex gap-4">
              <div className="text-amber-400 w-16 shrink-0">+4 WEEKS</div>
              <div className="text-gray-500">Anchor marketplace escrow program; Arcanite ↔ ARC bridge with time-lock bonuses</div>
            </div>
            <div className="flex gap-4">
              <div className="text-amber-400 w-16 shrink-0">Q3 2026</div>
              <div className="text-gray-500">Mainnet ARC; withdrawal flow; Phaser world scene</div>
            </div>
            <div className="flex gap-4">
              <div className="text-amber-400 w-16 shrink-0">Q4 2026</div>
              <div className="text-gray-500">Combat loop with on-chain loot drops; PvP economy</div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Token;
