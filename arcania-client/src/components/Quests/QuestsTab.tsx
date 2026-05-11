import React, { useState, useEffect } from 'react';
import { questAPI, PlayerQuest, QuestData, QuestReward, ReferralStats } from '@/services/api.service';
import { LOGIN_STREAK_REWARDS, ACHIEVEMENT_SUBCATEGORIES, AchievementSubcategory } from '@/constants/quest.constants';

type QuestCategory = 'social' | 'achievement' | 'daily' | 'weekly' | 'referral';

const CATEGORY_LABELS: Record<QuestCategory, string> = {
  social: 'SOCIAL',
  achievement: 'ACHIEVEMENTS',
  daily: 'DAILY',
  weekly: 'WEEKLY',
  referral: 'REFERRAL',
};

// Inline reward display with icons
const RewardDisplay: React.FC<{ reward: QuestReward; size?: 'sm' | 'md' }> = ({ reward, size = 'sm' }) => {
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  const textSize = size === 'md' ? 'text-[9px]' : 'text-[8px]';

  const parts: React.ReactNode[] = [];

  if (reward.gold) {
    parts.push(
      <span key="gold" className="inline-flex items-center gap-0.5">
        <img src="/assets/icons/gold.png" alt="Gold" className={iconSize} />
        <span className={`${textSize} text-gray-300`}>{reward.gold.toLocaleString()}</span>
      </span>
    );
  }
  if (reward.arcanite) {
    parts.push(
      <span key="arcanite" className="inline-flex items-center gap-0.5">
        <img src="/assets/icons/arcanite.png" alt="Arcanite" className={iconSize} />
        <span className={`${textSize} text-gray-300`}>{reward.arcanite}</span>
      </span>
    );
  }
  if (reward.xp) {
    parts.push(
      <span key="xp" className={`${textSize} text-gray-400`}>{reward.xp} XP</span>
    );
  }
  if (reward.item) {
    parts.push(
      <span key="item" className={`${textSize} text-gray-300`}>{reward.item}</span>
    );
  }
  if (reward.booster) {
    parts.push(
      <span key="booster" className={`${textSize} text-gray-300`}>{reward.booster}</span>
    );
  }

  if (parts.length === 0) return <span className={`${textSize} text-gray-600`}>--</span>;

  return (
    <span className="inline-flex items-center gap-2 flex-wrap">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-gray-700 text-[7px]">+</span>}
          {part}
        </React.Fragment>
      ))}
    </span>
  );
};

// Compact streak reward label
const StreakRewardLabel: React.FC<{ reward: QuestReward }> = ({ reward }) => {
  if (reward.gold && reward.booster) return (
    <span className="flex flex-col items-center gap-0.5">
      <img src="/assets/icons/gold.png" alt="Gold" className="w-3 h-3" />
      <span className="text-[6px] text-gray-500">25K</span>
    </span>
  );
  if (reward.gold) return (
    <span className="flex flex-col items-center gap-0.5">
      <img src="/assets/icons/gold.png" alt="Gold" className="w-3 h-3" />
      <span className="text-[6px] text-gray-500">{(reward.gold / 1000).toFixed(0)}K</span>
    </span>
  );
  if (reward.arcanite) return (
    <span className="flex flex-col items-center gap-0.5">
      <img src="/assets/icons/arcanite.png" alt="Arcanite" className="w-3 h-3" />
      <span className="text-[6px] text-gray-500">{reward.arcanite}</span>
    </span>
  );
  if (reward.item) return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="text-[7px] text-gray-600">BOX</span>
    </span>
  );
  return null;
};

const QuestsTab: React.FC = () => {
  const [questData, setQuestData] = useState<QuestData | null>(null);
  const [activeCategory, setActiveCategory] = useState<QuestCategory>('daily');
  const [achievementFilter, setAchievementFilter] = useState<AchievementSubcategory | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loginStreak, setLoginStreak] = useState<number>(0);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadQuests();
    loadLoginStreak();
    loadReferralStats();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const data = await questAPI.getQuests();
      setQuestData(data);
    } catch {
      try {
        await questAPI.initializeQuests();
        const data = await questAPI.getQuests();
        setQuestData(data);
      } catch {
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
    } catch { /* ignore */ }
  };

  const loadReferralStats = async () => {
    try {
      const stats = await questAPI.getReferralStats();
      setReferralStats(stats);
    } catch { /* ignore */ }
  };

  const handleClaimReward = async (questId: string) => {
    try {
      setClaiming(questId);
      await questAPI.claimReward(questId);
      await loadQuests();
    } catch {
      setError('Failed to claim reward');
    } finally {
      setClaiming(null);
    }
  };

  const handleSocialQuestClick = async (quest: PlayerQuest) => {
    const links: Record<string, string> = {
      social_twitter_follow: 'https://twitter.com/ArcaniaMMO',
      social_discord_join: 'https://discord.gg/arcania',
      social_youtube_subscribe: 'https://youtube.com/@arcania',
      social_share: 'https://twitter.com/intent/tweet?text=Check%20out%20Arcania%20Nexus!',
    };

    const link = links[quest.questId];
    if (link) {
      window.open(link, '_blank');
      try {
        await questAPI.completeSocialQuest(quest.questId);
        await loadQuests();
      } catch { /* ignore */ }
    }
  };

  const handleGenerateReferralCode = async () => {
    try {
      const code = await questAPI.generateReferralCode();
      setReferralStats(prev => prev ? { ...prev, code } : { code, totalReferrals: 0, commissionEarned: 0 });
    } catch { /* ignore */ }
  };

  const handleCopyReferralCode = () => {
    if (referralStats?.code) {
      navigator.clipboard.writeText(referralStats.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const currentQuests = questData?.quests[activeCategory] || [];
  const filteredQuests = activeCategory === 'achievement' && achievementFilter !== 'all'
    ? currentQuests.filter(q => q.quest.subcategory === achievementFilter)
    : currentQuests;

  if (loading) {
    return (
      <div className="border-2 border-gray-800 bg-black p-12 text-center">
        <div className="text-gray-600 text-[10px]">Loading quests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Login Streak */}
      <div className="border-2 border-gray-800 bg-black">
        <div className="px-5 py-3 border-b border-gray-800/50 flex items-center justify-between">
          <span className="text-amber-500/80 text-[10px] tracking-widest">LOGIN STREAK</span>
          <span className="text-[9px] text-gray-500">
            Day <span className="text-gray-300">{Math.min(loginStreak, 7)}</span> / 7
            {loginStreak > 7 && <span className="text-gray-600 ml-2">({loginStreak} total)</span>}
          </span>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-end justify-between gap-3">
            {LOGIN_STREAK_REWARDS.map((reward, index) => {
              const day = index + 1;
              const isClaimed = loginStreak >= day;
              const isNext = loginStreak === day - 1;

              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <StreakRewardLabel reward={reward} />
                  <div className={`w-7 h-7 border flex items-center justify-center text-[8px] transition-all ${
                    isClaimed
                      ? 'border-amber-700/60 bg-amber-900/20 text-amber-500/80'
                      : isNext
                        ? 'border-gray-600 bg-gray-900 text-gray-400'
                        : 'border-gray-800 bg-black text-gray-700'
                  }`}>
                    {isClaimed ? '◆' : day}
                  </div>
                </div>
              );
            })}
          </div>
          {loginStreak >= 7 && (
            <div className="mt-3 text-center text-[7px] text-gray-600">
              Streak maxed — receiving Day 7 rewards daily
            </div>
          )}
        </div>
      </div>

      {/* Main Quest Panel */}
      <div className="border-2 border-gray-800 bg-black">
        {/* Category Tabs */}
        <div className="flex border-b border-gray-800" role="tablist">
          {(Object.keys(CATEGORY_LABELS) as QuestCategory[]).map((cat) => {
            const quests = questData?.quests[cat] || [];
            const claimable = quests.filter((q) => q.status === 'CLAIMABLE').length;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => {
                  setActiveCategory(cat);
                  if (cat !== 'achievement') setAchievementFilter('all');
                }}
                className={`flex-1 py-3 text-[8px] tracking-widest transition-colors relative ${
                  activeCategory === cat
                    ? 'text-amber-500 bg-gray-900/40'
                    : 'text-gray-600 hover:text-gray-500 hover:bg-gray-900/20'
                }`}
              >
                {CATEGORY_LABELS[cat]}
                {claimable > 0 && (
                  <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-amber-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Achievement Sub-filters */}
        {activeCategory === 'achievement' && (
          <div className="flex gap-1 px-4 py-2 border-b border-gray-800/50">
            <button
              onClick={() => setAchievementFilter('all')}
              className={`px-2 py-1 text-[7px] tracking-wider transition-colors ${
                achievementFilter === 'all'
                  ? 'text-amber-500 border border-gray-700 bg-gray-900/50'
                  : 'text-gray-600 hover:text-gray-500 border border-transparent'
              }`}
            >
              ALL
            </button>
            {(Object.entries(ACHIEVEMENT_SUBCATEGORIES) as [AchievementSubcategory, string][]).map(([key, label]) => {
              const count = currentQuests.filter(q => q.quest.subcategory === key).length;
              const completed = currentQuests.filter(q => q.quest.subcategory === key && q.status === 'COMPLETED').length;
              return (
                <button
                  key={key}
                  onClick={() => setAchievementFilter(key)}
                  className={`px-2 py-1 text-[7px] tracking-wider transition-colors ${
                    achievementFilter === key
                      ? 'text-amber-500 border border-gray-700 bg-gray-900/50'
                      : 'text-gray-600 hover:text-gray-500 border border-transparent'
                  }`}
                >
                  {label} <span className="text-gray-700">{completed}/{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Referral Header */}
        {activeCategory === 'referral' && (
          <div className="px-5 py-3 border-b border-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[7px] text-gray-600 tracking-wider mb-1">YOUR REFERRAL CODE</div>
                {referralStats?.code ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 text-[11px] tracking-[0.2em]">{referralStats.code}</span>
                    <button
                      onClick={handleCopyReferralCode}
                      className="px-2 py-0.5 text-[7px] border border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700 transition-colors"
                    >
                      {copySuccess ? 'COPIED' : 'COPY'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateReferralCode}
                    className="px-3 py-1 text-[8px] border border-gray-700 text-gray-400 hover:text-gray-300 hover:border-gray-600 transition-colors"
                  >
                    GENERATE CODE
                  </button>
                )}
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-[11px] text-gray-300">{referralStats?.totalReferrals || 0}</div>
                  <div className="text-[6px] text-gray-600 tracking-wider">REFERRALS</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-300 flex items-center justify-center gap-0.5">
                    <img src="/assets/icons/arcanite.png" alt="Arcanite" className="w-3 h-3" />
                    {referralStats?.commissionEarned || 0}
                  </div>
                  <div className="text-[6px] text-gray-600 tracking-wider">EARNED</div>
                </div>
              </div>
            </div>
            <div className="mt-2 text-[6px] text-gray-700">
              Referred player must reach level 10 with 5+ hours playtime. 7-day verification period.
            </div>
          </div>
        )}

        {/* Quest List */}
        <div className="max-h-[480px] overflow-y-auto">
          {filteredQuests.length === 0 ? (
            <div className="text-center text-gray-700 text-[9px] py-10">
              No quests in this category
            </div>
          ) : (
            filteredQuests.map((quest) => (
              <div
                key={quest.id}
                className={`px-5 py-3 border-b border-gray-900/60 last:border-b-0 ${
                  quest.status === 'LOCKED' ? 'opacity-30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] ${
                        quest.status === 'COMPLETED' ? 'text-gray-500 line-through' :
                        quest.status === 'CLAIMABLE' ? 'text-amber-500' :
                        'text-gray-300'
                      }`}>
                        {quest.quest.title}
                      </span>
                      {quest.quest.isRepeatable && (
                        <span className="text-[6px] text-gray-700 border border-gray-800 px-1">REPEAT</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-[8px] text-gray-600 mb-2">{quest.quest.description}</p>

                    {/* Progress Bar */}
                    {quest.status !== 'LOCKED' && quest.status !== 'COMPLETED' && (
                      <div className="mb-2">
                        <div className="flex justify-between text-[7px] text-gray-700 mb-0.5">
                          <span>{quest.progress} / {quest.quest.targetProgress}</span>
                        </div>
                        <div className="h-1 bg-gray-900 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              quest.status === 'CLAIMABLE' ? 'bg-amber-600/80' : 'bg-gray-600'
                            }`}
                            style={{
                              width: `${Math.min((quest.progress / quest.quest.targetProgress) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Reward */}
                    <RewardDisplay reward={quest.quest.reward} />
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0 pt-1">
                    {quest.status === 'CLAIMABLE' && (
                      <button
                        onClick={() => handleClaimReward(quest.questId)}
                        disabled={claiming === quest.questId}
                        className="px-3 py-1.5 border border-amber-700/60 bg-amber-900/20 text-amber-500 text-[8px] hover:bg-amber-900/40 hover:border-amber-600/60 disabled:opacity-50 transition-colors tracking-wider"
                      >
                        {claiming === quest.questId ? '...' : 'CLAIM'}
                      </button>
                    )}
                    {quest.status === 'AVAILABLE' && quest.quest.category === 'social' && (
                      <button
                        onClick={() => handleSocialQuestClick(quest)}
                        className="px-3 py-1.5 border border-gray-700 text-gray-400 text-[8px] hover:text-gray-300 hover:border-gray-600 transition-colors tracking-wider"
                      >
                        GO
                      </button>
                    )}
                    {quest.status === 'COMPLETED' && (
                      <span className="text-[8px] text-gray-600 tracking-wider">DONE</span>
                    )}
                    {quest.status === 'LOCKED' && (
                      <span className="text-[8px] text-gray-800 tracking-wider">LOCKED</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-gray-800 flex items-center justify-between">
          <span className="text-[8px] text-gray-600">
            {questData?.completedQuests || 0} / {questData?.totalQuests || 0} complete
          </span>
          {(questData?.claimableQuests || 0) > 0 && (
            <span className="text-[8px] text-amber-600">
              {questData?.claimableQuests} claimable
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border border-gray-800 bg-black px-4 py-2 flex items-center justify-between">
          <span className="text-[8px] text-gray-400">{error}</span>
          <button onClick={() => setError(null)} className="text-[7px] text-gray-600 hover:text-gray-400">DISMISS</button>
        </div>
      )}
    </div>
  );
};

export default QuestsTab;
