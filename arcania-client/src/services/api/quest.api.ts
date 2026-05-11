import { api } from './client';

export interface QuestReward {
  gold?: number;
  arcanite?: number;
  xp?: number;
  item?: string;
  booster?: string;
  commissionPercent?: number;
  commissionDays?: number;
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  targetProgress: number;
  reward: QuestReward;
  unlockLevel?: number;
  prerequisiteQuestId?: string;
  isRepeatable: boolean;
  resetPeriod?: 'daily' | 'weekly';
  trackingKey: string;
}

export interface PlayerQuest {
  id: string;
  questId: string;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'CLAIMABLE' | 'COMPLETED';
  progress: number;
  completedAt: string | null;
  claimedAt: string | null;
  quest: QuestDefinition;
}

export interface QuestData {
  quests: {
    social: PlayerQuest[];
    achievement: PlayerQuest[];
    daily: PlayerQuest[];
    weekly: PlayerQuest[];
    referral: PlayerQuest[];
  };
  totalQuests: number;
  completedQuests: number;
  claimableQuests: number;
}

export interface LoginStreakData {
  streakDay: number;
  reward: QuestReward;
  isNewDay: boolean;
}

export interface ReferralStats {
  code: string | null;
  totalReferrals: number;
  commissionEarned: number;
}

export const questAPI = {
  getQuests: (): Promise<QuestData> =>
    api.get('/quests').then(r => r.data),

  getQuestsByCategory: (category: string): Promise<PlayerQuest[]> =>
    api.get(`/quests/${category}`).then(r => r.data),

  claimReward: (questId: string): Promise<{ reward: QuestReward; message: string }> =>
    api.post(`/quests/${questId}/claim`).then(r => r.data),

  handleLogin: (): Promise<LoginStreakData> =>
    api.post('/quests/login').then(r => r.data),

  getLoginStreak: (): Promise<{ currentStreak: number; longestStreak: number; lastLoginDate: string | null }> =>
    api.get('/quests/streak').then(r => r.data),

  initializeQuests: (): Promise<void> =>
    api.post('/quests/initialize').then(() => undefined),

  generateReferralCode: (): Promise<string> =>
    api.post('/referral/generate').then(r => r.data.code),

  useReferralCode: (code: string): Promise<void> =>
    api.post('/referral/use', { code }).then(() => undefined),

  getReferralStats: (): Promise<ReferralStats> =>
    api.get('/referral/stats').then(r => r.data),

  completeSocialQuest: (questId: string): Promise<void> =>
    api.post(`/quests/social/${questId}`).then(() => undefined),
};
