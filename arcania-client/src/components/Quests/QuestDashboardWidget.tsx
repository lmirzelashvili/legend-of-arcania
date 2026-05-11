import React, { useState, useEffect } from 'react';
import { questAPI, PlayerQuest, QuestData, QuestReward } from '@/services/api.service';
import { LOGIN_STREAK_REWARDS } from '@/constants/quest.constants';

interface QuestDashboardWidgetProps {
  onNavigateToQuests: () => void;
}

const InlineReward: React.FC<{ reward: QuestReward }> = ({ reward }) => {
  const parts: React.ReactNode[] = [];

  if (reward.gold) {
    parts.push(
      <span key="gold" className="inline-flex items-center gap-0.5">
        <img src="/assets/icons/gold.png" alt="Gold" className="w-3 h-3" />
        <span className="text-[7px] text-gray-400">{(reward.gold / 1000).toFixed(0)}K</span>
      </span>
    );
  }
  if (reward.arcanite) {
    parts.push(
      <span key="arcanite" className="inline-flex items-center gap-0.5">
        <img src="/assets/icons/arcanite.png" alt="Arcanite" className="w-3 h-3" />
        <span className="text-[7px] text-gray-400">{reward.arcanite}</span>
      </span>
    );
  }
  if (reward.xp) {
    parts.push(<span key="xp" className="text-[7px] text-gray-500">{reward.xp} XP</span>);
  }
  if (reward.item) {
    parts.push(<span key="item" className="text-[7px] text-gray-500">{reward.item.replace('Box of ', '')}</span>);
  }

  if (parts.length === 0) return <span className="text-[7px] text-gray-700">--</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-gray-800 text-[6px]">+</span>}
          {part}
        </React.Fragment>
      ))}
    </span>
  );
};

const QuestDashboardWidget: React.FC<QuestDashboardWidgetProps> = ({ onNavigateToQuests }) => {
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [loginStreak, setLoginStreak] = useState<number>(0);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [data, streak] = await Promise.all([
        questAPI.getQuests().catch(async () => {
          await questAPI.initializeQuests();
          return questAPI.getQuests();
        }),
        questAPI.getLoginStreak().catch(() => ({ currentStreak: 0 })),
      ]);
      setQuestData(data);
      setLoginStreak(streak.currentStreak);
    } catch { /* ignore */ }
  };

  const handleClaimReward = async (questId: string) => {
    try {
      setClaiming(questId);
      await questAPI.claimReward(questId);
      await loadData();
    } catch { /* ignore */ }
    finally { setClaiming(null); }
  };

  // Gather all claimable quests across categories
  const claimableQuests: PlayerQuest[] = questData
    ? Object.values(questData.quests).flat().filter(q => q.status === 'CLAIMABLE')
    : [];

  return (
    <div className="border-2 border-gray-800 bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800/50">
        <span className="text-amber-500/80 text-[10px] tracking-widest">QUESTS</span>
        <button
          onClick={onNavigateToQuests}
          className="text-[8px] text-gray-600 hover:text-amber-500 transition-colors tracking-wider"
        >
          VIEW ALL →
        </button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Login Streak Mini */}
        <div className="pb-3 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[7px] text-gray-600 tracking-wider">LOGIN STREAK</span>
            <span className="text-[8px] text-gray-500">
              Day <span className="text-gray-300">{Math.min(loginStreak, 7)}</span>/7
            </span>
          </div>
          <div className="flex items-center gap-1">
            {LOGIN_STREAK_REWARDS.map((_, index) => {
              const day = index + 1;
              const isClaimed = loginStreak >= day;
              return (
                <div
                  key={day}
                  className={`flex-1 h-1.5 transition-all ${
                    isClaimed ? 'bg-amber-700/60' : 'bg-gray-900'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-[8px]">
          <span className="text-gray-600">
            <span className="text-gray-400">{questData?.completedQuests || 0}</span>
            <span className="text-gray-700"> / </span>
            {questData?.totalQuests || 0} complete
          </span>
          {claimableQuests.length > 0 && (
            <span className="text-[7px] text-amber-600">
              {claimableQuests.length} CLAIMABLE
            </span>
          )}
        </div>

        {/* Claimable Quests (top 3) */}
        {claimableQuests.length > 0 ? (
          <div className="space-y-1">
            {claimableQuests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-900/60 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-gray-300 truncate mb-0.5">{quest.quest.title}</div>
                  <InlineReward reward={quest.quest.reward} />
                </div>
                <button
                  onClick={() => handleClaimReward(quest.questId)}
                  disabled={claiming === quest.questId}
                  className="px-2 py-1 border border-amber-700/50 bg-amber-900/15 text-amber-500 text-[7px] hover:bg-amber-900/30 hover:border-amber-600/50 disabled:opacity-50 transition-colors tracking-wider"
                >
                  {claiming === quest.questId ? '...' : 'CLAIM'}
                </button>
              </div>
            ))}
            {claimableQuests.length > 3 && (
              <button
                onClick={onNavigateToQuests}
                className="w-full text-center text-[7px] text-gray-600 hover:text-amber-500 py-1 transition-colors"
              >
                +{claimableQuests.length - 3} more →
              </button>
            )}
          </div>
        ) : (
          <div className="text-center text-[8px] text-gray-700 py-2">
            No quests ready to claim
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestDashboardWidget;
