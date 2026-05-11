import { api } from './client';
import { Character, Item } from '@/types/game.types';

export interface ForgeRecipeMaterial {
  templateId: string;
  name: string;
  quantity: number;
}

export interface ForgeRecipe {
  id: string;
  name: string;
  description: string;
  tier: number;
  category: 'wings' | 'capes' | 'armor' | 'weapon';
  allowedClasses: string[];
  materials: ForgeRecipeMaterial[];
  resultTemplateId: string | null;
  randomPool?: 'armor' | 'weapon_shield';
  baseSuccessRate: number;
}

export interface ForgeResult {
  success: boolean;
  message: string;
  forgedItem?: Item;
  materialsReturned?: { name: string; quantity: number }[];
  updatedCharacter?: Character;
}

export const forgeAPI = {
  getRecipes: (): Promise<ForgeRecipe[]> =>
    api.get('/forge/recipes').then(r => r.data),

  forge: (
    characterId: string,
    recipeId: string,
    extraCrystals?: { spiritCount?: number; dominionCount?: number },
  ): Promise<ForgeResult> =>
    api.post('/forge', { characterId, recipeId, extraCrystals }).then(r => r.data),
};
