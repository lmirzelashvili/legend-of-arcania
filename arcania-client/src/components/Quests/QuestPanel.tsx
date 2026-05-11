import React, { useState, useEffect } from 'react';
import { questAPI, PlayerQuest, QuestData, QuestReward } from '@/services/api.service';

type QuestCategory = 'social' | 'achievement' | 'daily' | 'weekly' | 'referral';

const CATEGORY_LABELS: Record<QuestCategory, string> = {
  social: 'SOCIAL',
  achievement: 'ACHIEVEMENTS',
  daily: 'DAILY',
  weekly: 'WEEKLY',
  referral: 'REFERRAL',
};

interface QuestPanelProps {
  onRewardClaimed?: (reward: QuestReward) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({ onRewardClaimed }) => {
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [activeCategory, setActiveCategory] = useState<QuestCategory>('daily');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginStreak, setLoginStreak] = useState<number>(0);

  useEffect(() => {
    loadQuests();
    loadLoginStreak();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const data = await questAPI.getQuests();
      setQuestData(data);
    } catch (err: any) {
      // If quests not initialized, initialize them
      if (err.response?.status === 404 || (questData?.totalQuests === 0)) {
        try {
          await questAPI.initializeQuests();
          const data = await questAPI.getQuests();
          setQuestData(data);
        } catch (initErr) {
          setError('Failed to load quests');
        }
      } else {
        setError('Failed to load quests');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadLoginStreak = async () => {
    try {
      const streak = await questAPI.getLoginStreak();
      setLoginStreak(streak.currentStreak);
    } catch (err) {
      // Ignore errors
    }
  };

  const handleClaimReward = async (questId: string) => {
    try {
      setClaiming(questId);
      const result = await questAPI.claimReward(questId);
      await loadQuests();
      if (onRewardClaimed) {
        onRewardClaimed(result.reward);
      }
    } catch (err) {
      setError('Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const handleSocialQuestClick = async (quest: PlayerQuest) => {
    // For social quests, open the relevant link and mark as complete
    const links: Record<string, string> = {
      social_twitter_follow: 'https://twitter.com/ArcaniaMMO',
      social_twitter_retweet: 'https://twitter.com/ArcaniaMMO',
      social_discord_join: 'https://discord.gg/arcania',
      social_telegram_join: 'https://t.me/arcania',
    };

    const link = links[quest.questId];
    if (link) {
      window.open(link, '_blank');
      // Mark as complete after opening
      try {
        await questAPI.completeSocialQuest(quest.questId);
        await loadQuests();
      } catch (err) {
        // Ignore errors
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'CLAIMABLE':
        return 'text-yellow-400';
      case 'IN_PROGRESS':
        return 'text-blue-400';
      case 'LOCKED':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'CLAIMABLE':
        return 'bg-yellow-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500';
      default:
        return 'bg-gray-600';
    }
  };

  const formatReward = (reward: QuestReward) => {
    const parts: string[] = [];
    if (reward.gold) parts.push(`${reward.gold} Gold`);
    if (reward.arcanite) parts.push(`${reward.arcanite} RT`);
    if (reward.xp) parts.push(`${reward.xp} XP`);
    return parts.join(' + ');
  };

  const currentQuests = questData?.quests[activeCategory] || [];
  const claimableCount = questData?.claimableQuests || 0;

  if (loading) {
    return (
      <div className="bg-black border border-gray-800 p-4">
        <div className="text-center text-gray-500 text-xs">Loading quests...</div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 tracking-widest">PLATFORM QUESTS</span>
          {claimableCount > 0 && (
            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[8px] rounded">
              {claimableCount} CLAIMABLE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-gray-600">STREAK:</span>
          <span className="text-[10px] text-orange-400">{loginStreak}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-800">
        {(Object.keys(CATEGORY_LABELS) as QuestCategory[]).map((cat) => {
          const quests = questData?.quests[cat] || [];
          const claimable = quests.filter((q) => q.status === 'CLAIMABLE').length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-1 py-2 text-[8px] tracking-wider relative transition-colors ${
                activeCategory === cat
                  ? 'text-white bg-gray-900'
                  : 'text-gray-600 hover:text-gray-400 hover:bg-gray-900/50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
              {claimable > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quest List */}
      <div>
        {currentQuests.length === 0 ? (
          <div className="text-center text-gray-600 text-[10px] py-4">
            No quests available
          </div>
        ) : (
          currentQuests.map((quest) => (
            <div
              key={quest.id}
              className={`px-3 py-2 border-b border-gray-900 last:border-b-0 ${
                quest.status === 'LOCKED' ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium ${getStatusColor(quest.status)}`}>
                      {quest.quest.title}
                    </span>
                    {quest.quest.isRepeatable && (
                      <span className="text-[7px] text-gray-600 px-1 border border-gray-800">
                        REPEATABLE
                      </span>
                    )}
                  </div>
                  <p className="text-[8px] text-gray-500 truncate mt-0.5">
                    {quest.quest.description}
                  </p>

                  {/* Progress Bar */}
                  {quest.status !== 'LOCKED' && quest.status !== 'COMPLETED' && (
                    <div className="mt-1.5">
                      <div className="flex justify-between text-[7px] text-gray-600 mb-0.5">
                        <span>Progress</span>
                        <span>{quest.progress} / {quest.quest.targetProgress}</span>
                      </div>
                      <div className="h-1 bg-gray-900 overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(quest.status)} transition-all`}
                          style={{
                            width: `${Math.min(
                              (quest.progress / quest.quest.targetProgress) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Reward */}
                  <div className="mt-1 text-[8px] text-gray-600">
                    Reward: <span className="text-amber-400">{formatReward(quest.quest.reward)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0">
                  {quest.status === 'CLAIMABLE' && (
                    <button
                      onClick={() => handleClaimReward(quest.questId)}
                      disabled={claiming === quest.questId}
                      className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[8px] hover:bg-yellow-500/30 disabled:opacity-50 transition-colors"
                    >
                      {claiming === quest.questId ? '...' : 'CLAIM'}
                    </button>
                  )}
                  {quest.status === 'AVAILABLE' && quest.quest.category === 'SOCIAL' && (
                    <button
                      onClick={() => handleSocialQuestClick(quest)}
                      className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[8px] hover:bg-blue-500/30 transition-colors"
                    >
                      GO
                    </button>
                  )}
                  {quest.status === 'COMPLETED' && (
                    <span className="text-[8px] text-green-500">DONE</span>
                  )}
                  {quest.status === 'LOCKED' && (
                    <span className="text-[8px] text-gray-700">LOCKED</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/30">
          <p className="text-[8px] text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default QuestPanel;
