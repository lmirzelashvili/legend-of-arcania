import { api } from './client';
import {
  Character,
  MarketplaceListing, ListingFilters, ListingSortOption, PaginatedListings,
  CreateListingRequest, CreateListingResult, PurchaseListingResult, CancelListingResult,
} from '@/types/game.types';

export const marketplaceAPI = {
  // Paginated auction house listings
  getListings: (filters?: ListingFilters, sort?: ListingSortOption, page?: number, pageSize?: number): Promise<PaginatedListings> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = {};
    if (filters) {
      if (filters.type) params.type = filters.type;
      if (filters.rarity) params.rarity = filters.rarity;
      if (filters.minLevel) params.minLevel = filters.minLevel;
      if (filters.maxLevel) params.maxLevel = filters.maxLevel;
      if (filters.class) params.class = filters.class;
      if (filters.currency) params.currency = filters.currency;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minEnhancement) params.minEnhancement = filters.minEnhancement;
      if (filters.maxEnhancement) params.maxEnhancement = filters.maxEnhancement;
      if (filters.search) params.search = filters.search;
      if (filters.source) params.source = filters.source;
    }
    if (sort) params.sort = sort;
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    return api.get<{ data: MarketplaceListing[]; meta: { total: number; page: number; pageSize: number; totalPages: number } }>('/marketplace/listings', { params }).then(r => ({
      listings: r.data.data,
      total: r.data.meta.total,
      page: r.data.meta.page,
      pageSize: r.data.meta.pageSize,
      totalPages: r.data.meta.totalPages,
    }));
  },

  getMyListings: (): Promise<MarketplaceListing[]> =>
    api.get('/marketplace/my-listings').then(r => r.data),

  createListing: (request: CreateListingRequest): Promise<CreateListingResult> =>
    api.post('/marketplace/listings', request).then(r => r.data),

  cancelListing: (listingId: string, characterId?: string): Promise<CancelListingResult> =>
    api.delete(`/marketplace/listings/${listingId}`, {
      params: characterId ? { characterId } : undefined,
    }).then(r => r.data),

  purchaseListing: (characterId: string, listingId: string): Promise<PurchaseListingResult> =>
    api.post(`/marketplace/listings/${listingId}/buy`, { characterId }).then(r => r.data),

  // Legacy compat
  getItems: (filters?: {
    type?: string;
    rarity?: string;
    minLevel?: number;
    maxLevel?: number;
    class?: string;
    search?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }): Promise<any[]> =>
    api.get('/marketplace/items', { params: filters }).then(r => r.data),

  purchaseItem: (characterId: string, itemId: string, quantity: number = 1): Promise<Character> =>
    api.post(`/marketplace/items/${itemId}/buy`, { characterId, quantity }).then(r => r.data),
};
