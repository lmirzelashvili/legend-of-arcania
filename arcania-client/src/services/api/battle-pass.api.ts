import { api } from './client';

export interface TierReward {
  type: 'gold' | 'arcanite' | 'box';
  amount?: number;
  boxName?: string;
}

export interface BattlePassTier {
  id: string;
  tierNumber: number;
  xpRequired: number;
  freeReward: TierReward | null;
  premiumReward: TierReward | null;
}

export interface BattlePassSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  tiers: BattlePassTier[];
}

export interface BattlePassProgress {
  id: string;
  seasonId: string;
  hasPremium: boolean;
  currentXp: number;
  currentTier: number;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
}

export const battlePassAPI = {
  getSeason: (): Promise<{ season: BattlePassSeason | null; tiers: BattlePassTier[] }> =>
    api.get('/battle-pass').then(r => r.data),

  getProgress: (): Promise<BattlePassProgress | null> =>
    api.get('/battle-pass/progress').then(r => r.data),

  purchase: (characterId: string): Promise<{ success: boolean; message: string }> =>
    api.post('/battle-pass/purchase', { characterId }).then(r => r.data),

  claimReward: (tierNumber: number, track: 'free' | 'premium'): Promise<{
    success: boolean;
    reward: TierReward;
    message: string;
  }> =>
    api.post(`/battle-pass/claim/${tierNumber}`, { track }).then(r => r.data),
};
