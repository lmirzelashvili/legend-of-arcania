import { api } from './client';
import { Vault, VaultTier, TransferResult, CanTransferResult } from '@/types/game.types';

export const vaultAPI = {
  getVault: (): Promise<Vault> =>
    api.get('/vault').then(r => r.data),

  depositItem: (
    characterId: string,
    inventoryItemId: string,
    quantity: number
  ): Promise<TransferResult> =>
    api.post('/vault/deposit', { characterId, inventoryItemId, quantity }).then(r => r.data),

  withdrawItem: (
    characterId: string,
    vaultItemId: string,
    quantity: number
  ): Promise<TransferResult> =>
    api.post('/vault/withdraw', { characterId, vaultItemId, quantity }).then(r => r.data),

  upgradeVault: (
    tier: VaultTier,
    characterId?: string
  ): Promise<{ success: boolean; vault?: Vault; message?: string }> =>
    api.post('/vault/upgrade', { tier, characterId }).then(r => r.data),

  withdrawCurrency: (
    characterId: string,
    currency: 'gold' | 'arcanite',
    amount: number
  ): Promise<TransferResult> =>
    api.post('/vault/withdraw-currency', { characterId, currency, amount }).then(r => r.data),

  depositCurrency: (
    characterId: string,
    currency: 'gold' | 'arcanite',
    amount: number
  ): Promise<TransferResult> =>
    api.post('/vault/deposit-currency', { characterId, currency, amount }).then(r => r.data),

  canTransfer: (characterId: string): Promise<CanTransferResult> =>
    api.get(`/vault/can-transfer/${characterId}`).then(r => r.data),

  transferAllToVault: (characterId: string): Promise<void> =>
    api.post(`/vault/transfer-all/${characterId}`).then(() => undefined),
};
