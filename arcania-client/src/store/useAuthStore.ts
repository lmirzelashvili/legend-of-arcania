import { create } from 'zustand';
import { User } from '@/types/game.types';
import { useCharacterStore } from './useCharacterStore';
import { useWalletStore } from './useWalletStore';
import { useVaultStore } from './useVaultStore';
import { useNotificationStore } from './useNotificationStore';
import { useUIStore } from './useUIStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    useCharacterStore.getState().reset();
    useWalletStore.getState().reset();
    useVaultStore.getState().reset();
    useNotificationStore.getState().reset();
    useUIStore.getState().reset();
  },
}));
