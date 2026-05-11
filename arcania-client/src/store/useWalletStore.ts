import { create } from 'zustand';
import { AccountWallet, SpinReward } from '@/types/game.types';
import { walletAPI } from '@/services/api.service';

const SPINS_PER_DAY = 3;

const getDefaultWallet = (): AccountWallet => ({
  gold: 0,
  creationTokens: 1,
  spinsRemaining: SPINS_PER_DAY,
  lastSpinReset: new Date().toISOString(),
});

const loadWalletFromStorage = (): AccountWallet => {
  const saved = localStorage.getItem('accountWallet');
  if (!saved) return getDefaultWallet();

  let wallet: AccountWallet;
  try {
    wallet = JSON.parse(saved) as AccountWallet;
  } catch {
    localStorage.removeItem('accountWallet');
    return getDefaultWallet();
  }

  const lastReset = new Date(wallet.lastSpinReset);
  const now = new Date();
  if (lastReset.toDateString() !== now.toDateString()) {
    wallet.spinsRemaining = SPINS_PER_DAY;
    wallet.lastSpinReset = now.toISOString();
  }

  return wallet;
};

const saveWalletToStorage = (wallet: AccountWallet) => {
  localStorage.setItem('accountWallet', JSON.stringify(wallet));
};

interface WalletState {
  accountWallet: AccountWallet;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  spin: () => Promise<SpinReward | null>;
  loadWalletFromServer: () => Promise<void>;
  useCreationToken: () => Promise<boolean>;
  transferWalletToCharacter: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  accountWallet: loadWalletFromStorage(),
  isLoading: false,
  error: null,
  lastFetched: null,

  setError: (error) => set({ error }),

  loadWalletFromServer: async () => {
    set({ isLoading: true, error: null });
    try {
      const serverWallet = await walletAPI.getWallet();
      const { accountWallet } = get();
      const newWallet: AccountWallet = {
        ...accountWallet,
        gold: 0, // Gold lives in Vault, not AccountWallet
        creationTokens: serverWallet.creationTokens,
        spinsRemaining: serverWallet.spinsRemaining,
        lastSpinReset: serverWallet.lastSpinReset,
      };
      saveWalletToStorage(newWallet);
      set({ accountWallet: newWallet, isLoading: false, lastFetched: Date.now() });
    } catch (err) {
      // Fall back to localStorage if server unavailable
      set({ isLoading: false, error: err instanceof Error ? err.message : 'An error occurred' });
    }
  },

  spin: async () => {
    const { accountWallet } = get();
    if (accountWallet.spinsRemaining <= 0) return null;

    set({ isLoading: true, error: null });
    try {
      const result = await walletAPI.spin();
      const reward: SpinReward = {
        type: result.reward.type as any,
        gold: result.reward.gold,
        arcanite: result.reward.arcanite,
        goldDeposited: result.reward.goldDeposited || 0,
        arcaniteDeposited: result.reward.arcaniteDeposited || 0,
        weight: 0,
      };

      const newWallet: AccountWallet = {
        ...accountWallet,
        gold: 0, // Gold lives in Vault, not AccountWallet
        creationTokens: result.wallet.creationTokens,
        spinsRemaining: result.wallet.spinsRemaining,
        lastSpinReset: result.wallet.lastSpinReset,
      };

      saveWalletToStorage(newWallet);
      set({ accountWallet: newWallet, isLoading: false });
      return reward;
    } catch (err) {
      console.error('Spin failed — server unreachable');
      set({ isLoading: false, error: err instanceof Error ? err.message : 'An error occurred' });
      return null;
    }
  },

  useCreationToken: async () => {
    const { accountWallet } = get();
    if (accountWallet.creationTokens <= 0) return false;

    set({ isLoading: true, error: null });
    try {
      const result = await walletAPI.useCreationToken();
      const newWallet: AccountWallet = {
        ...accountWallet,
        creationTokens: result.creationTokens,
      };
      saveWalletToStorage(newWallet);
      set({ accountWallet: newWallet, isLoading: false });
      return true;
    } catch (err) {
      console.error('Failed to use creation token — server unreachable');
      set({ isLoading: false, error: err instanceof Error ? err.message : 'An error occurred' });
      return false;
    }
  },

  transferWalletToCharacter: () => {
    // Server handles gold via vault. Wallet sync happens on dashboard load.
  },

  reset: () => {
    localStorage.removeItem('accountWallet');
    set({ accountWallet: getDefaultWallet(), isLoading: false, error: null, lastFetched: null });
  },
}));
