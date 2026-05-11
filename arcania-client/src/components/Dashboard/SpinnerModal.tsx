import React, { useState } from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { SpinReward, SPIN_REWARDS } from '@/types/game.types';

// Spinner configuration
const ITEM_WIDTH = 110;
const ITEM_GAP = 8;
const ITEM_STEP = ITEM_WIDTH + ITEM_GAP;
const TOTAL_ITEMS = 60;
const START_INDEX = 10;
const WIN_INDEX = 45;

// Generate random reel items based on weights
const generateReelItems = (): SpinReward[] => {
  const items: SpinReward[] = [];
  const totalWeight = SPIN_REWARDS.reduce((sum, r) => sum + r.weight, 0);

  for (let i = 0; i < TOTAL_ITEMS; i++) {
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

// Get display text for reward
const getRewardText = (reward: SpinReward): { amount: string; label: string } => {
  switch (reward.type) {
    case 'gold':
      return { amount: `${reward.gold}`, label: 'GOLD' };
    case 'arcanite':
      return { amount: `${reward.arcanite}`, label: 'ARCANITE' };
    case 'creation_token':
      return { amount: '1', label: 'CREATION TOKEN' };
    default:
      return { amount: '', label: '' };
  }
};

// Get icon path for reward
const getRewardIcon = (reward: SpinReward): string => {
  switch (reward.type) {
    case 'gold':
      return '/assets/icons/gold.png';
    case 'arcanite':
      return '/assets/icons/arcanite.png';
    case 'creation_token':
      return '/assets/icons/creation-token.png';
    default:
      return '';
  }
};

// Get text color for reward
const getRewardTextColor = (reward: SpinReward): string => {
  switch (reward.type) {
    case 'gold':
      return 'text-yellow-400';
    case 'arcanite':
      return 'text-cyan-400';
    case 'creation_token':
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
};

interface SpinnerModalProps {
  onClose: () => void;
}

export const SpinnerModal: React.FC<SpinnerModalProps> = ({ onClose }) => {
  const { accountWallet, spin } = useWalletStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reelItems, setReelItems] = useState<SpinReward[]>(generateReelItems());
  const [offset, setOffset] = useState(START_INDEX * ITEM_STEP);
  const [lastReward, setLastReward] = useState<SpinReward | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSpin = async () => {
    if (isSpinning || accountWallet.spinsRemaining <= 0) return;

    setIsSpinning(true);
    setIsAnimating(false);
    setShowResult(false);
    setLastReward(null);

    // Generate new reel
    const newReel = generateReelItems();

    // Get reward from store
    const reward = await spin();
    if (!reward) {
      setIsSpinning(false);
      return;
    }

    // Place winning reward at win position
    newReel[WIN_INDEX] = reward;

    // Reset reel to start with no transition (isAnimating is false)
    setReelItems([...newReel]);
    setOffset(START_INDEX * ITEM_STEP);

    // Wait for browser to paint the reset position, then animate
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
        setOffset(WIN_INDEX * ITEM_STEP);
      });
    });

    // Show result after animation completes
    setTimeout(() => {
      setIsAnimating(false);
      setIsSpinning(false);
      setLastReward(reward);
      setShowResult(true);
    }, 3500);
  };

  const handleBuyToken = () => {
    // Payment integration not yet implemented
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-black border border-gray-700 p-8 max-w-xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-amber-400 text-[14px]">DAILY SPIN</div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-400 text-[14px]">✕</button>
        </div>

        {/* Spins Remaining */}
        <div className="text-center text-gray-500 text-[9px] mb-5">
          {accountWallet.spinsRemaining} / 3 SPINS TODAY
        </div>

        {/* Spinner Container */}
        <div className="relative mb-6">
          {/* Pointer Arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-amber-500" />
          </div>

          {/* Reel Track */}
          <div className="border border-gray-800 bg-gray-900/30 overflow-hidden">
            <div className="relative h-16">
              {/* Scrolling Items */}
              <div
                className="absolute flex items-center h-full left-1/2"
                style={{
                  gap: `${ITEM_GAP}px`,
                  transform: `translateX(${-offset - ITEM_WIDTH / 2}px)`,
                  transition: isAnimating ? 'transform 3.2s cubic-bezier(0.15, 0.85, 0.35, 1)' : 'none',
                }}
              >
                {reelItems.map((item, i) => {
                  const { amount } = getRewardText(item);
                  return (
                    <div
                      key={i}
                      className="flex-shrink-0 flex items-center justify-center gap-1.5 border border-gray-800 bg-gray-900/30"
                      style={{ width: ITEM_WIDTH, height: 48 }}
                    >
                      <img src={getRewardIcon(item)} alt="" className="w-5 h-5" />
                      <span className="text-[10px] text-gray-300">{amount}</span>
                    </div>
                  );
                })}
              </div>

              {/* Winner Highlight */}
              <div
                className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-2 border-amber-500 pointer-events-none"
                style={{ width: ITEM_WIDTH + 4 }}
              />
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || accountWallet.spinsRemaining <= 0}
          className={`w-full py-4 text-[11px] border mb-4 transition-colors ${
            isSpinning || accountWallet.spinsRemaining <= 0
              ? 'border-gray-700 text-gray-600 cursor-not-allowed'
              : 'border-amber-600 text-amber-400 hover:bg-amber-900/30'
          }`}
        >
          {isSpinning ? 'SPINNING...' : accountWallet.spinsRemaining <= 0 ? 'NO SPINS LEFT' : 'SPIN'}
        </button>

        {/* Result Display */}
        {showResult && lastReward && (
          <div className="text-center mb-4 py-4 border border-gray-800 bg-gray-900/30">
            <div className="text-gray-600 text-[8px] mb-2">YOU WON</div>
            <div className="flex items-center justify-center gap-2">
              <img src={getRewardIcon(lastReward)} alt="" className="w-8 h-8" />
              <div className={`text-[14px] ${getRewardTextColor(lastReward)}`}>
                {lastReward.type === 'creation_token' && '1 CREATION TOKEN!'}
                {lastReward.type === 'gold' && `${lastReward.gold} GOLD`}
                {lastReward.type === 'arcanite' && `${lastReward.arcanite} ARCANITE`}
              </div>
            </div>
            {lastReward.type === 'gold' && lastReward.goldDeposited && lastReward.goldDeposited > 0 && (
              <div className="text-gray-500 text-[8px] mt-2">
                {lastReward.goldDeposited.toLocaleString()} gold deposited to your vault
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-800 my-4" />

        {/* Buy Token */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src="/assets/icons/creation-token.png" alt="" className="w-7 h-7" />
            <div>
              <div className="text-gray-400 text-[9px]">NEED A TOKEN NOW?</div>
              <div className="text-gray-600 text-[7px]">Skip the spin</div>
            </div>
          </div>
          <button
            onClick={handleBuyToken}
            className="border border-purple-800 hover:border-purple-600 bg-purple-900/20 px-5 py-2 text-purple-400 text-[9px] transition-colors"
          >
            BUY $0.99
          </button>
        </div>

        {/* Discord Section */}
        <div className="border border-gray-800 bg-gray-900/30 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/assets/icons/discord.png" alt="" className="w-5 h-5" />
              <div>
                <div className="text-[#7289da] text-[9px] mb-0.5">DISCORD GIVEAWAYS</div>
                <div className="text-gray-500 text-[7px]">Creation token daily giveaways</div>
              </div>
            </div>
            <a
              href="https://discord.gg/arcania"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#7289da] hover:bg-[#7289da]/20 px-4 py-2 text-[#7289da] text-[8px] transition-colors"
            >
              JOIN SERVER
            </a>
          </div>
        </div>

        {/* Why Creation Tokens */}
        <div className="border-t border-gray-800 pt-4 mt-2">
          <div className="text-gray-500 text-[8px] mb-2">WHY CREATION TOKENS?</div>
          <p className="text-gray-600 text-[7px] leading-relaxed">
            They help us build a community of dedicated players who truly value their heroes. Your support keeps Arcania growing.
          </p>
        </div>

      </div>
    </div>
  );
};

export default SpinnerModal;
