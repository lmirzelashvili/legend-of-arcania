import { create } from 'zustand';
import { Vault, VaultTier } from '@/types/game.types';
import { vaultAPI } from '@/services/api.service';
import { useCharacterStore } from './useCharacterStore';

interface VaultState {
  vault: Vault | null;
  isVaultLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  setVault: (vault: Vault | null) => void;
  loadVault: () => Promise<void>;
  depositToVault: (characterId: string, itemId: string, quantity: number) => Promise<boolean>;
  withdrawFromVault: (characterId: string, vaultItemId: string, quantity: number) => Promise<boolean>;
  withdrawCurrency: (characterId: string, currency: 'gold' | 'arcanite', amount: number) => Promise<boolean>;
  depositCurrency: (characterId: string, currency: 'gold' | 'arcanite', amount: number) => Promise<boolean>;
  upgradeVaultTier: (tier: VaultTier, characterId?: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  reset: () => void;
}

function syncCharacter(characterId: string, updatedCharacter: any) {
  const charStore = useCharacterStore.getState();
  if (charStore.currentCharacter?.id === characterId) {
    charStore.setCurrentCharacter(updatedCharacter);
  }
  charStore.setCharacters(
    charStore.characters.map(c => c.id === characterId ? updatedCharacter : c)
  );
}

export const useVaultStore = create<VaultState>((set) => ({
  vault: null,
  isVaultLoading: false,
  error: null,
  lastFetched: null,

  setVault: (vault) => set({ vault }),
  setError: (error) => set({ error }),

  loadVault: async () => {
    set({ isVaultLoading: true, error: null });
    try {
      const vault = await vaultAPI.getVault();
      set({ vault, isVaultLoading: false, lastFetched: Date.now() });
    } catch (error) {
      console.error('Failed to load vault:', error);
      set({ isVaultLoading: false, error: error instanceof Error ? error.message : 'An error occurred' });
    }
  },

  depositToVault: async (characterId, itemId, quantity) => {
    set({ error: null });
    try {
      const result = await vaultAPI.depositItem(characterId, itemId, quantity);
      if (result.updatedVault) set({ vault: result.updatedVault });
      if (result.updatedCharacter) syncCharacter(characterId, result.updatedCharacter);
      return true;
    } catch (error) {
      console.error('Failed to deposit to vault:', error);
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      return false;
    }
  },

  withdrawFromVault: async (characterId, vaultItemId, quantity) => {
    set({ error: null });
    try {
      const result = await vaultAPI.withdrawItem(characterId, vaultItemId, quantity);
      if (result.updatedVault) set({ vault: result.updatedVault });
      if (result.updatedCharacter) syncCharacter(characterId, result.updatedCharacter);
      return true;
    } catch (error) {
      console.error('Failed to withdraw from vault:', error);
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      return false;
    }
  },

  withdrawCurrency: async (characterId, currency, amount) => {
    set({ error: null });
    try {
      const result = await vaultAPI.withdrawCurrency(characterId, currency, amount);
      if (result.updatedVault) set({ vault: result.updatedVault });
      if (result.updatedCharacter) syncCharacter(characterId, result.updatedCharacter);
      return true;
    } catch (error: any) {
      console.error('Failed to withdraw currency:', error?.response?.data?.message || error?.message);
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      return false;
    }
  },

  depositCurrency: async (characterId, currency, amount) => {
    set({ error: null });
    try {
      const result = await vaultAPI.depositCurrency(characterId, currency, amount);
      if (result.updatedVault) set({ vault: result.updatedVault });
      if (result.updatedCharacter) syncCharacter(characterId, result.updatedCharacter);
      return true;
    } catch (error: any) {
      console.error('Failed to deposit currency:', error?.response?.data?.message || error?.message);
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      return false;
    }
  },

  upgradeVaultTier: async (tier, characterId) => {
    set({ error: null });
    try {
      const result = await vaultAPI.upgradeVault(tier, characterId);
      if (result.vault) {
        set({ vault: result.vault });
      }
      return true;
    } catch (error) {
      console.error('Failed to upgrade vault:', error);
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
      return false;
    }
  },

  reset: () => set({ vault: null, isVaultLoading: false, error: null, lastFetched: null }),
}));
