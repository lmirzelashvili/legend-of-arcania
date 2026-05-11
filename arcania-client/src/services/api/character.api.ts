import { api } from './client';
import { Character, Race, Class, StatBlock, DerivedStats, Ability } from '@/types/game.types';

export const characterAPI = {
  create: (name: string, race: Race, characterClass: Class, gender: 'male' | 'female' = 'male'): Promise<Character> =>
    api.post('/characters', { name, race, class: characterClass, gender }).then(r => r.data),

  getAll: (): Promise<Character[]> =>
    api.get<{ data: Character[] }>('/characters').then(r => r.data.data),

  getById: (id: string): Promise<Character> =>
    api.get(`/characters/${id}`).then(r => r.data),

  getStats: (id: string): Promise<{ primaryStats: StatBlock; derivedStats: DerivedStats; unspentStatPoints: number }> =>
    api.get(`/characters/${id}/stats`).then(r => r.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/characters/${id}`).then(() => undefined),

  updateStats: (id: string, stats: Partial<StatBlock>): Promise<Character> =>
    api.put(`/characters/${id}/stats`, stats).then(r => r.data),

  respecStats: (id: string): Promise<Character> =>
    api.post(`/characters/${id}/respec`).then(r => r.data),

  equipItem: (characterId: string, itemId: string, slot: string): Promise<Character> =>
    api.post(`/characters/${characterId}/equip`, { itemId, slot }).then(r => r.data),

  unequipItem: (characterId: string, slot: string): Promise<Character> =>
    api.post(`/characters/${characterId}/unequip`, { slot }).then(r => r.data),

  moveInventoryItem: (characterId: string, itemId: string, fromSlot: number, toSlot: number): Promise<Character> =>
    api.put(`/characters/${characterId}/inventory/move`, { itemId, fromSlot, toSlot }).then(r => r.data),

  getAvailableAbilities: (characterId: string): Promise<Ability[]> =>
    api.get(`/characters/${characterId}/abilities`).then(r => r.data),

  learnAbility: (characterId: string, abilityId: string): Promise<Character> =>
    api.post(`/characters/${characterId}/abilities/learn`, { abilityId }).then(r => r.data),

  upgradeAbility: (characterId: string, abilityId: string): Promise<Character> =>
    api.post(`/characters/${characterId}/abilities/upgrade`, { abilityId }).then(r => r.data),

  useConsumable: (characterId: string, inventoryItemId: string): Promise<{
    character: Character;
    effect: {
      itemName: string;
      hpRestored: number;
      manaRestored: number;
      newHp: number;
      newMana: number;
    };
  }> =>
    api.post(`/characters/${characterId}/consumable`, { inventoryItemId }).then(r => r.data),

  enhanceItem: (characterId: string, targetItemId: string, crystalItemId: string): Promise<{
    success: boolean;
    newLevel: number;
    failureResult: string | null;
    itemDestroyed: boolean;
    updatedCharacter: Character;
    message: string;
  }> =>
    api.post(`/characters/${characterId}/enhance`, { targetItemId, crystalItemId }).then(r => r.data),

  socketGem: (characterId: string, targetItemId: string, gemItemId: string, socketIndex: number): Promise<{
    success: boolean;
    message: string;
    updatedCharacter: Character;
  }> =>
    api.post(`/characters/${characterId}/socket`, { targetItemId, gemItemId, socketIndex }).then(r => r.data),

  unsocketGem: (characterId: string, targetItemId: string, socketIndex: number): Promise<{
    success: boolean;
    message: string;
    updatedCharacter: Character;
  }> =>
    api.post(`/characters/${characterId}/unsocket`, { targetItemId, socketIndex }).then(r => r.data),

  openBox: (characterId: string, inventoryItemId: string): Promise<{
    success: boolean;
    boxName: string;
    rewards: { name: string; type: string; rarity: string }[];
    rewardCount: number;
    updatedCharacter: Character;
  }> =>
    api.post(`/characters/${characterId}/open-box`, { inventoryItemId }).then(r => r.data),

  useScroll: (characterId: string, inventoryItemId: string): Promise<{
    success: boolean;
    message: string;
    character: Character;
  }> =>
    api.post(`/characters/${characterId}/use-scroll`, { inventoryItemId }).then(r => r.data),

  sellItem: (characterId: string, inventoryItemId: string, quantity?: number): Promise<{ goldReceived: number; character: Character }> =>
    api.post(`/characters/${characterId}/sell`, { inventoryItemId, quantity: quantity || 1 }).then(r => r.data),
};
