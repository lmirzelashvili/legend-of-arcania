import { api } from './client';

export interface ActiveBooster {
  id: string;
  type: 'xp' | 'gold' | 'combo' | 'mega';
  xpBonus: number;
  goldBonus: number;
  activatedAt: string;
  expiresAt: string;
}

export interface BoosterBonuses {
  totalXpBonus: number;
  totalGoldBonus: number;
}

export const boosterAPI = {
  getActiveBoosters: (): Promise<ActiveBooster[]> =>
    api.get('/boosters').then(r => r.data),

  getBonuses: (): Promise<BoosterBonuses> =>
    api.get('/boosters/bonuses').then(r => r.data),

  activate: (type: 'xp' | 'gold' | 'combo' | 'mega'): Promise<ActiveBooster & { cost: number }> =>
    api.post('/boosters/activate', { type }).then(r => r.data),

  cleanup: (): Promise<{ deletedCount: number }> =>
    api.post('/boosters/cleanup').then(r => r.data),
};
