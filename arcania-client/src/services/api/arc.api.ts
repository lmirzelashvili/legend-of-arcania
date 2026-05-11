import { api } from './client';

export interface ArcWalletInfo {
  mint: string;
  decimals: number;
  cluster: string;
  depositAddress: string;
  balance: string;
  hotWalletCap: string;
  minWithdraw: string;
}

export interface ArcTransactionRow {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  amount: string;
  signature: string | null;
  destination: string | null;
  source: string | null;
  error: string | null;
  createdAt: string;
}

export interface SweepCheckResult {
  swept: boolean;
  amount: string;
  signature?: string;
  reason?: string;
}

export interface WithdrawResult {
  ok: boolean;
  signature?: string;
  transactionId?: string;
  destination?: string;
  amount?: string;
}

export const arcApi = {
  getWallet: () => api.get<ArcWalletInfo>('/arc/wallet'),
  checkDeposits: () => api.post<SweepCheckResult>('/arc/deposits/check'),
  withdraw: (amount: string, destination?: string) =>
    api.post<WithdrawResult>('/arc/withdraw', destination ? { amount, destination } : { amount }),
  getTransactions: (limit = 20) =>
    api.get<{ transactions: ArcTransactionRow[] }>('/arc/transactions', { params: { limit } }),
};
