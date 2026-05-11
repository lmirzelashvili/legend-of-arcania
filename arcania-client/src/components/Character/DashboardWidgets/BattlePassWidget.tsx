import React, { useState, useEffect } from 'react';
import { battlePassAPI, BattlePassSeason, BattlePassProgress, BattlePassTier } from '@/services/api.service';
import { PixelPanel, ProgressBar } from '@/components/ui';

interface Props {
  onNavigate: (section: string, subTab?: string) => void;
}

const BattlePassWidget: React.FC<Props> = ({ onNavigate }) => {
  const [season, setSeason] = useState<BattlePassSeason | null>(null);
  const [tiers, setTiers] = useState<BattlePassTier[]>([]);
  const [progress, setProgress] = useState<BattlePassProgress | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [seasonData, progressData] = await Promise.all([
        battlePassAPI.getSeason().catch(() => ({ season: null, tiers: [] })),
        battlePassAPI.getProgress().catch(() => null),
      ]);
      setSeason(seasonData.season);
      setTiers(seasonData.tiers);
      setProgress(progressData);
    } catch { /* ignore */ }
  };

  const currentTier = progress?.currentTier || 0;
  const maxTier = tiers.length || 30;

  // Check if there are claimable rewards
  const hasClaimable = progress && tiers.some((tier) => {
    const isFreeClaimable = tier.tierNumber <= currentTier && !progress.claimedFreeTiers.includes(tier.tierNumber) && tier.freeReward;
    const isPremiumClaimable = progress.hasPremium && tier.tierNumber <= currentTier && !progress.claimedPremiumTiers.includes(tier.tierNumber) && tier.premiumReward;
    return isFreeClaimable || isPremiumClaimable;
  });

  // XP progress within current tier
  const currentTierData = tiers.find(t => t.tierNumber === currentTier + 1);
  const xpForNextTier = currentTierData?.xpRequired || 1000;
  const currentXp = progress?.currentXp || 0;

  return (
    <PixelPanel color="purple" className="cursor-pointer hover:brightness-110 transition-all">
      <div onClick={() => onNavigate('adventure', 'battlepass')}>
        {/* Inline header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-[9px] text-purple-400 tracking-wider">
            BATTLE PASS
            {season && (
              <span className="text-purple-600 ml-1">
                — {season.name}
              </span>
            )}
          </div>
          <span className="text-[7px] text-gray-600 hover:text-purple-400 transition-colors">
            VIEW →
          </span>
        </div>

        {/* Tier display */}
        <div className="text-[12px] text-white mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
          TIER <span className="text-purple-400">{currentTier}</span>
          <span className="text-gray-600 text-[10px]"> / {maxTier}</span>
        </div>

        {/* XP progress bar (narrow, purple) */}
        <ProgressBar
          value={currentXp}
          max={xpForNextTier}
          color="purple"
          height="sm"
        />

        {/* Claimable rewards notice */}
        {hasClaimable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('adventure', 'battlepass');
            }}
            className="mt-2 w-full border border-amber-700/50 bg-amber-900/15 text-amber-500 text-[8px] py-1.5 hover:bg-amber-900/30 hover:border-amber-600/50 transition-colors tracking-wider"
          >
            CLAIM REWARDS
          </button>
        )}
      </div>
    </PixelPanel>
  );
};

export default BattlePassWidget;
