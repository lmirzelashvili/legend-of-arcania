import { create } from 'zustand';
import { Character } from '@/types/game.types';

interface CharacterState {
  currentCharacter: Character | null;
  characters: Character[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  setCurrentCharacter: (character: Character | null) => void;
  setCharacters: (characters: Character[]) => void;
  setLastFetched: (ts: number | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  currentCharacter: null,
  characters: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  setCurrentCharacter: (character) => set({ currentCharacter: character }),
  setCharacters: (characters) => set({ characters }),
  setLastFetched: (ts) => set({ lastFetched: ts }),
  setError: (error) => set({ error }),
  reset: () => set({ currentCharacter: null, characters: [], isLoading: false, error: null, lastFetched: null }),
}));
