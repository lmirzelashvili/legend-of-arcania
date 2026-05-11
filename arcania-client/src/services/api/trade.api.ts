import { api } from './client';
import { Character } from '@/types/game.types';

export interface TradeOfferItem {
  inventoryItemId: string;
  quantity: number;
}

export interface TradeOffer {
  id: string;
  tradeId: string;
  userId: string;
  items: TradeOfferItem[];
  goldAmount: number;
  isLocked: boolean;
}

export interface Trade {
  id: string;
  initiatorId: string;
  receiverId: string;
  status: 'PENDING' | 'ACTIVE' | 'LOCKED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  offers: TradeOffer[];
  initiator: { id: string; username: string };
  receiver: { id: string; username: string };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface TradeConfirmResult {
  success: boolean;
  message: string;
  updatedCharacter: Character;
}

export const tradeAPI = {
  getActiveTrades: (): Promise<Trade[]> =>
    api.get('/trades').then(r => r.data),

  getTrade: (tradeId: string): Promise<Trade> =>
    api.get(`/trades/${tradeId}`).then(r => r.data),

  createTrade: (receiverUsername: string, characterId: string): Promise<Trade> =>
    api.post('/trades', { receiverUsername, characterId }).then(r => r.data),

  acceptTrade: (tradeId: string): Promise<Trade> =>
    api.post(`/trades/${tradeId}/accept`).then(r => r.data),

  updateOffer: (tradeId: string, characterId: string, items: TradeOfferItem[], goldAmount: number): Promise<Trade> =>
    api.put(`/trades/${tradeId}/offer`, { characterId, items, goldAmount }).then(r => r.data),

  lockOffer: (tradeId: string): Promise<Trade> =>
    api.post(`/trades/${tradeId}/lock`).then(r => r.data),

  confirmTrade: (tradeId: string, characterId: string): Promise<TradeConfirmResult> =>
    api.post(`/trades/${tradeId}/confirm`, { characterId }).then(r => r.data),

  cancelTrade: (tradeId: string): Promise<{ success: boolean; message: string }> =>
    api.post(`/trades/${tradeId}/cancel`).then(r => r.data),
};
