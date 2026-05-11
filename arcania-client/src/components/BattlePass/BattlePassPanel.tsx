import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  battlePassAPI,
  BattlePassSeason,
  BattlePassTier,
  BattlePassProgress,
  TierReward,
} from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import PixelPanel from '@/components/ui/PixelPanel';
import PixelButton from '@/components/ui/PixelButton';

/* ---------- helpers ---------- */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function rewardLabel(r: TierReward): string {
  if (r.type === 'box') return r.boxName ?? 'Loot Box';
  return `${r.amount ?? 0} ${r.type === 'gold' ? 'Gold' : 'Arcanite'}`;
}

function rewardIcon(r: TierReward): string {
  if (r.type === 'gold') return '$';
  if (r.type === 'arcanite') return '*';
  return '?';
}

/* ---------- component ---------- */

const BattlePassPanel: React.FC = () => {
  const { setCurrentCharacter } = useCharacterStore();
  const character = useCharacterStore(s => s.currentCharacter);
  if (!character) return null;

  const [season, setSeason] = useState<BattlePassSeason | null>(null);
  const [tiers, setTiers] = useState<BattlePassTier[]>([]);
  const [progress, setProgress] = useState<BattlePassProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---- data fetching ---- */

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [seasonData, progressData] = await Promise.all([
        battlePassAPI.getSeason(),
        battlePassAPI.getProgress(),
      ]);
      setSeason(seasonData.season);
      setTiers(seasonData.tiers);
      setProgress(progressData);
    } catch {
      setError('Failed to load battle pass data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* scroll current tier into view once loaded */
  useEffect(() => {
    if (!scrollRef.current || !progress) return;
    const el = scrollRef.current.querySelector('[data-current-tier]');
    if (el) el.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  }, [progress, tiers]);

  /* ---- actions ---- */

  const handlePurchase = async () => {
    if (purchasing) return;
    setPurchasing(true);
    setClaimMessage(null);
    try {
      const res = await battlePassAPI.purchase(character.id);
      setClaimMessage(res.message);
      await load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Purchase failed.';
      setClaimMessage(msg);
    } finally {
      setPurchasing(false);
    }
  };

  const handleClaim = async (tierNumber: number, track: 'free' | 'premium') => {
    if (claiming) return;
    setClaiming(true);
    setClaimMessage(null);
    try {
      const res = await battlePassAPI.claimReward(tierNumber, track);
      setClaimMessage(res.message);
      // refresh progress & character
      const [newProgress, newChar] = await Promise.all([
        battlePassAPI.getProgress(),
        import('@/services/api.service').then(m => m.characterAPI.getById(character.id)),
      ]);
      setProgress(newProgress);
      setCurrentCharacter(newChar);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Claim failed.';
      setClaimMessage(msg);
    } finally {
      setClaiming(false);
    }
  };

  /* ---- xp progress helpers ---- */

  const currentTier = progress?.currentTier ?? 0;
  const currentXp = progress?.currentXp ?? 0;

  // Determine XP threshold for next tier
  const nextTierDef = tiers.find(t => t.tierNumber === currentTier + 1);
  const currentTierDef = tiers.find(t => t.tierNumber === currentTier);
  const xpForNext = nextTierDef?.xpRequired ?? currentTierDef?.xpRequired ?? 1000;
  const xpFloor = currentTierDef?.xpRequired ?? 0;
  const xpInTier = Math.max(0, currentXp - xpFloor);
  const xpNeeded = Math.max(1, xpForNext - xpFloor);
  const xpPercent = Math.min(100, (xpInTier / xpNeeded) * 100);

  /* ---- render ---- */

  if (loading) {
    return (
      <PixelPanel title="BATTLE PASS" color="purple">
        <div className="text-gray-500 text-[10px] text-center py-12">Loading battle pass...</div>
      </PixelPanel>
    );
  }

  if (error || !season) {
    return (
      <PixelPanel title="BATTLE PASS" color="purple">
        <div className="text-center py-12 space-y-4">
          <div className="text-gray-500 text-[10px]">{error ?? 'No active season.'}</div>
          <PixelButton onClick={load} variant="secondary" size="sm">RETRY</PixelButton>
        </div>
      </PixelPanel>
    );
  }

  const hasPremium = progress?.hasPremium ?? false;

  return (
    <div className="space-y-4">
      {/* ---- Header ---- */}
      <PixelPanel color="purple">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-purple-400 text-[14px] tracking-wider mb-1">{season.name}</div>
            <div className="text-gray-500 text-[9px]">
              {formatDate(season.startDate)} - {formatDate(season.endDate)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasPremium ? (
              <span className="text-amber-400 text-[10px] border border-amber-600 px-3 py-1">PREMIUM ACTIVE</span>
            ) : (
              <PixelButton onClick={handlePurchase} variant="accent" size="sm">
                {purchasing ? 'PURCHASING...' : 'PURCHASE PREMIUM'}
              </PixelButton>
            )}
          </div>
        </div>
      </PixelPanel>

      {/* ---- XP Progress ---- */}
      <PixelPanel color="amber">
        <div className="flex items-center justify-between text-[9px] mb-2">
          <span className="text-gray-500">TIER {currentTier} / {tiers.length}</span>
          <span className="text-amber-400">{xpInTier.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
        </div>
        <div className="relative h-5 p-[2px] bg-gray-900 border border-gray-800 overflow-hidden">
          <div className="w-full h-full bg-black relative overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-500 transition-all duration-500"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
        <div className="text-center text-[8px] text-white mt-1" style={{ textShadow: '1px 1px 2px black' }}>
          {Math.round(xpPercent)}%
        </div>
      </PixelPanel>

      {/* ---- Claim message ---- */}
      {claimMessage && (
        <div className="text-center text-[10px] text-green-400 border border-green-800 bg-green-900/20 py-2 px-4">
          {claimMessage}
        </div>
      )}

      {/* ---- Tier Grid ---- */}
      <PixelPanel title="REWARD TIERS" color="gray">
        <div ref={scrollRef} className="overflow-x-auto pb-2">
          <div className="flex gap-2" style={{ minWidth: `${tiers.length * 110}px` }}>
            {tiers.map(tier => {
              const reached = currentTier >= tier.tierNumber;
              const isCurrent = currentTier === tier.tierNumber;
              const freeClaimed = progress?.claimedFreeTiers.includes(tier.tierNumber) ?? false;
              const premiumClaimed = progress?.claimedPremiumTiers.includes(tier.tierNumber) ?? false;
              const canClaimFree = reached && !freeClaimed && tier.freeReward !== null;
              const canClaimPremium = reached && !premiumClaimed && hasPremium && tier.premiumReward !== null;

              return (
                <div
                  key={tier.id}
                  data-current-tier={isCurrent ? '' : undefined}
                  className={`flex-shrink-0 w-[100px] border-2 ${
                    isCurrent
                      ? 'border-amber-500 bg-amber-900/10'
                      : reached
                        ? 'border-gray-700 bg-gray-900/30'
                        : 'border-gray-800 bg-black'
                  } p-2 space-y-2`}
                >
                  {/* Tier number */}
                  <div className={`text-center text-[10px] font-bold ${isCurrent ? 'text-amber-400' : reached ? 'text-gray-400' : 'text-gray-600'}`}>
                    T{tier.tierNumber}
                  </div>

                  {/* Free reward */}
                  <div className="space-y-1">
                    <div className="text-[7px] text-gray-500 text-center">FREE</div>
                    {tier.freeReward ? (
                      <button
                        disabled={!canClaimFree || claiming}
                        onClick={() => canClaimFree && handleClaim(tier.tierNumber, 'free')}
                        className={`w-full border p-1.5 text-center text-[8px] transition-colors ${
                          freeClaimed
                            ? 'border-green-700 bg-green-900/20 text-green-500'
                            : canClaimFree
                              ? 'border-amber-600 bg-amber-900/20 text-amber-400 hover:bg-amber-900/40 cursor-pointer'
                              : 'border-gray-800 text-gray-600'
                        }`}
                      >
                        {freeClaimed ? (
                          <span>OK {rewardIcon(tier.freeReward)}</span>
                        ) : (
                          <span>{rewardLabel(tier.freeReward)}</span>
                        )}
                      </button>
                    ) : (
                      <div className="w-full border border-gray-800 p-1.5 text-center text-[8px] text-gray-700">--</div>
                    )}
                  </div>

                  {/* Premium reward */}
                  <div className="space-y-1">
                    <div className="text-[7px] text-purple-600 text-center">PREMIUM</div>
                    {tier.premiumReward ? (
                      <button
                        disabled={!canClaimPremium || claiming}
                        onClick={() => canClaimPremium && handleClaim(tier.tierNumber, 'premium')}
                        className={`w-full border p-1.5 text-center text-[8px] transition-colors ${
                          premiumClaimed
                            ? 'border-green-700 bg-green-900/20 text-green-500'
                            : !hasPremium
                              ? 'border-gray-800 text-gray-700 opacity-40'
                              : canClaimPremium
                                ? 'border-purple-600 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 cursor-pointer'
                                : 'border-gray-800 text-gray-600'
                        }`}
                      >
                        {premiumClaimed ? (
                          <span>OK {rewardIcon(tier.premiumReward)}</span>
                        ) : (
                          <span>{rewardLabel(tier.premiumReward)}</span>
                        )}
                      </button>
                    ) : (
                      <div className="w-full border border-gray-800 p-1.5 text-center text-[8px] text-gray-700">--</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PixelPanel>
    </div>
  );
};

export default BattlePassPanel;
