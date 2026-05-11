import { create } from 'zustand';
import { Character } from '@/types/game.types';
import { questAPI, battlePassAPI, friendsAPI } from '@/services/api.service';

interface NotificationState {
  unspentPoints: number;
  claimableQuests: number;
  claimableBattlePass: number;
  pendingFriendRequests: number;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  loadBadges: (character: Character) => Promise<void>;
  setLastFetched: (ts: number | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unspentPoints: 0,
  claimableQuests: 0,
  claimableBattlePass: 0,
  pendingFriendRequests: 0,
  isLoading: false,
  error: null,
  lastFetched: null,

  setLastFetched: (ts) => set({ lastFetched: ts }),
  setError: (error) => set({ error }),

  reset: () => set({
    unspentPoints: 0,
    claimableQuests: 0,
    claimableBattlePass: 0,
    pendingFriendRequests: 0,
    isLoading: false,
    error: null,
    lastFetched: null,
  }),

  loadBadges: async (character: Character) => {
    set({ isLoading: true, error: null });
    // Unspent stat points are already on the character object
    set({ unspentPoints: character.unspentStatPoints ?? 0 });

    const results = await Promise.allSettled([
      questAPI.getQuests(),
      battlePassAPI.getProgress(),
      friendsAPI.getPendingRequests(),
    ]);

    // Claimable quests
    if (results[0].status === 'fulfilled') {
      const questData = results[0].value;
      set({ claimableQuests: questData.claimableQuests });
    }

    // Claimable battle pass tiers
    if (results[1].status === 'fulfilled') {
      const progress = results[1].value;
      if (progress) {
        // Unclaimed tiers up to currentTier for free track
        const unclaimedFree = Array.from(
          { length: progress.currentTier },
          (_, i) => i + 1,
        ).filter((t) => !progress.claimedFreeTiers.includes(t)).length;

        // Unclaimed tiers for premium track (only if premium)
        const unclaimedPremium = progress.hasPremium
          ? Array.from(
              { length: progress.currentTier },
              (_, i) => i + 1,
            ).filter((t) => !progress.claimedPremiumTiers.includes(t)).length
          : 0;

        set({ claimableBattlePass: unclaimedFree + unclaimedPremium });
      } else {
        set({ claimableBattlePass: 0 });
      }
    }

    // Pending friend requests
    if (results[2].status === 'fulfilled') {
      const pending = results[2].value;
      set({ pendingFriendRequests: pending.incoming.length });
    }

    // Set error if all API calls failed
    if (results.every((r) => r.status === 'rejected')) {
      set({ error: 'Failed to load notifications' });
    }

    set({ isLoading: false, lastFetched: Date.now() });
  },
}));
