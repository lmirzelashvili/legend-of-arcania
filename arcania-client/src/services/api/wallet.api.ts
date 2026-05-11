import { api } from './client';

export const walletAPI = {
  getWallet: (): Promise<{
    creationTokens: number;
    spinsRemaining: number;
    lastSpinReset: string;
  }> =>
    api.get('/wallet').then(r => r.data),

  spin: (): Promise<{
    reward: { type: string; gold: number; arcanite: number; goldDeposited: number; arcaniteDeposited: number };
    wallet: { creationTokens: number; spinsRemaining: number; lastSpinReset: string };
  }> =>
    api.post('/wallet/spin').then(r => r.data),

  useCreationToken: (): Promise<{ success: boolean; creationTokens: number }> =>
    api.post('/wallet/use-token').then(r => r.data),
};
