import { api } from './client';
import { VendorId, VendorDefinition, VendorPurchaseResult } from '@/types/game.types';

export const vendorAPI = {
  getVendors: (): Promise<VendorDefinition[]> =>
    api.get('/vendors').then(r => r.data),

  getVendor: (vendorId: VendorId): Promise<VendorDefinition> =>
    api.get(`/vendors/${vendorId}`).then(r => r.data),

  purchaseItem: (characterId: string, vendorId: VendorId, vendorItemId: string, quantity: number = 1): Promise<VendorPurchaseResult> =>
    api.post(`/vendors/${vendorId}/buy`, { characterId, vendorItemId, quantity }).then(r => r.data),
};
