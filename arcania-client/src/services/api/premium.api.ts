import { api } from './client';

export interface PremiumSubscriptionInfo {
  id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  daysRemaining: number;
}

export interface PremiumStatus {
  isPremium: boolean;
  subscription: PremiumSubscriptionInfo | null;
}

export const premiumAPI = {
  getStatus: (): Promise<PremiumStatus> =>
    api.get('/premium/status').then(r => r.data),

  activate: (durationDays: number): Promise<PremiumStatus> =>
    api.post('/premium/activate', { durationDays }).then(r => r.data),
};
