import { create } from 'zustand';
import { ZoneType } from '@/types/game.types';

interface UIState {
  showInventory: boolean;
  showCharacterSheet: boolean;
  showChat: boolean;
  currentZone: ZoneType;
  toggleInventory: () => void;
  toggleCharacterSheet: () => void;
  toggleChat: () => void;
  setCurrentZone: (zone: ZoneType) => void;
  reset: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  showInventory: false,
  showCharacterSheet: false,
  showChat: true,
  currentZone: ZoneType.SAFE,

  toggleInventory: () => set((state) => ({ showInventory: !state.showInventory })),
  toggleCharacterSheet: () => set((state) => ({ showCharacterSheet: !state.showCharacterSheet })),
  toggleChat: () => set((state) => ({ showChat: !state.showChat })),
  setCurrentZone: (zone) => set({ currentZone: zone }),
  reset: () => set({
    showInventory: false,
    showCharacterSheet: false,
    showChat: true,
    currentZone: ZoneType.SAFE,
  }),
}));
