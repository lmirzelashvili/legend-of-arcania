import { api } from './client';

export interface PvPStatsData {
  characterId: string;
  characterName: string;
  characterClass: string;
  characterLevel: number;
  kills: number;
  deaths: number;
  kdRatio: number;
  killStreak: number;
  bestStreak: number;
}

export interface PvPSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export const pvpAPI = {
  getLeaderboard: (sort: 'kills' | 'kd_ratio' | 'streak' = 'kills', limit: number = 20): Promise<PvPStatsData[]> =>
    api.get('/pvp/leaderboard', { params: { sort, limit } }).then(r => r.data),

  getStats: (characterId: string): Promise<PvPStatsData> =>
    api.get(`/pvp/stats/${characterId}`).then(r => r.data),

  recordKill: (killerId: string, victimId: string): Promise<{
    killer: string;
    victim: string;
    killerKills: number;
    killerStreak: number;
  }> =>
    api.post('/pvp/record-kill', { killerId, victimId }).then(r => r.data),

  getSeasons: (): Promise<PvPSeason[]> =>
    api.get('/pvp/seasons').then(r => r.data),
};
