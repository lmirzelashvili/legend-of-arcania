import React, { useState, useRef } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { SpinReward, SPIN_REWARDS } from '@/types/game.types';

const ITEM_WIDTH = 100;
const VISIBLE_ITEMS = 5;
const SPIN_ITEMS = 30; // Number of items in the reel

// Generate reel items based on weights
const generateReelItems = (): SpinReward[] => {
  const items: SpinReward[] = [];
  for (let i = 0; i < SPIN_ITEMS; i++) {
    // Random weighted selection for visual variety
    const totalWeight = SPIN_REWARDS.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const reward of SPIN_REWARDS) {
      random -= reward.weight;
      if (random <= 0) {
        items.push(reward);
        break;
      }
    }
  }
  return items;
};

const getRewardLabel = (reward: SpinReward): string => {
  switch (reward.type) {
    case 'gold':
      return `${reward.gold}G`;
    case 'arcanite':
      return `${reward.arcanite}A`;
    case 'creation_token':
      return 'TOKEN';
    default:
      return '';
  }
};

const getRewardColor = (reward: SpinReward): string => {
  switch (reward.type) {
    case 'gold':
      return 'text-yellow-400 border-yellow-700';
    case 'arcanite':
      return 'text-cyan-400 border-cyan-700';
    case 'creation_token':
      return 'text-purple-400 border-purple-700 bg-purple-900/30';
    default:
      return 'text-gray-400 border-gray-700';
  }
};

export const DailySpinTab: React.FC = () => {
  const { accountWallet, spin } = useWalletStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelItems, setReelItems] = useState<SpinReward[]>(generateReelItems());
  const [offset, setOffset] = useState(0);
  const [lastReward, setLastReward] = useState<SpinReward | null>(null);
  const [showResult, setShowResult] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);

  const handleSpin = async () => {
    if (isSpinning || accountWallet.spinsRemaining <= 0) return;

    setIsSpinning(true);
    setShowResult(false);
    setLastReward(null);

    // Generate new reel
    const newReel = generateReelItems();
    setReelItems(newReel);
    setOffset(0);

    // Get the actual reward from store
    const reward = await spin();
    if (!reward) {
      setIsSpinning(false);
      return;
    }

    // Find or place the winning item near the end
    const winningIndex = SPIN_ITEMS - 3;
    newReel[winningIndex] = reward;
    setReelItems([...newReel]);

    // Calculate final offset to land on winning item
    const finalOffset = (winningIndex - Math.floor(VISIBLE_ITEMS / 2)) * ITEM_WIDTH;

    // Animate
    setTimeout(() => {
      setOffset(finalOffset);
    }, 50);

    // Show result after animation
    setTimeout(() => {
      setIsSpinning(false);
      setLastReward(reward);
      setShowResult(true);
    }, 3500);
  };

  // Calculate time until reset
  const getTimeUntilReset = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-amber-400 text-[12px] mb-2">DAILY SPIN</div>
        <div className="text-gray-600 text-[8px]">
          {accountWallet.spinsRemaining} / 3 SPINS REMAINING
        </div>
        {accountWallet.spinsRemaining < 3 && (
          <div className="text-gray-700 text-[7px] mt-1">
            Resets in {getTimeUntilReset()}
          </div>
        )}
      </div>

      {/* Spinner Container */}
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-amber-500" />
        </div>

        {/* Reel Window */}
        <div className="border-2 border-gray-700 bg-gray-900 overflow-hidden">
          <div className="relative h-20">
            {/* Reel Strip */}
            <div
              ref={reelRef}
              className="absolute flex items-center h-full"
              style={{
                transform: `translateX(${-offset + (VISIBLE_ITEMS / 2 - 0.5) * ITEM_WIDTH}px)`,
                transition: isSpinning
                  ? 'transform 3s cubic-bezier(0.15, 0.85, 0.35, 1)'
                  : 'none',
              }}
            >
              {reelItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-[100px] h-16 flex items-center justify-center border mx-0.5 text-[9px] ${getRewardColor(
                    item
                  )}`}
                >
                  {getRewardLabel(item)}
                </div>
              ))}
            </div>

            {/* Center highlight */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[104px] border-2 border-amber-500 pointer-events-none" />
          </div>
        </div>

        {/* Bottom Pointer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-amber-500" />
        </div>
      </div>

      {/* Spin Button */}
      <div className="text-center mb-8">
        <button
          onClick={handleSpin}
          disabled={isSpinning || accountWallet.spinsRemaining <= 0}
          className={`px-12 py-4 text-[11px] border transition-all ${
            isSpinning || accountWallet.spinsRemaining <= 0
              ? 'border-gray-700 text-gray-600 cursor-not-allowed'
              : 'border-amber-600 text-amber-400 hover:bg-amber-900/30 hover:border-amber-500'
          }`}
        >
          {isSpinning ? 'SPINNING...' : accountWallet.spinsRemaining <= 0 ? 'NO SPINS LEFT' : 'SPIN'}
        </button>
      </div>

      {/* Result Display */}
      {showResult && lastReward && (
        <div className="text-center animate-pulse">
          <div className="text-gray-500 text-[8px] mb-2">YOU WON</div>
          <div className={`text-[14px] ${
            lastReward.type === 'creation_token' ? 'text-purple-400' :
            lastReward.type === 'arcanite' ? 'text-cyan-400' : 'text-yellow-400'
          }`}>
            {lastReward.type === 'creation_token' && 'CREATION TOKEN!'}
            {lastReward.type === 'gold' && `${lastReward.gold} GOLD`}
            {lastReward.type === 'arcanite' && `${lastReward.arcanite} ARCANITE`}
          </div>
        </div>
      )}

      {/* Rewards Table */}
      <div className="mt-12 border border-gray-800 p-4">
        <div className="text-gray-500 text-[9px] mb-4 text-center">POSSIBLE REWARDS</div>
        <div className="grid grid-cols-2 gap-3 text-[8px]">
          <div className="flex justify-between">
            <span className="text-yellow-400">100 Gold</span>
            <span className="text-gray-600">45%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-400">300G + 2 Arcanite</span>
            <span className="text-gray-600">30%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-400">500G + 3 Arcanite</span>
            <span className="text-gray-600">15%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-400">Creation Token</span>
            <span className="text-gray-600">10%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySpinTab;
