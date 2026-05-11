// ==================== SHARED ENUMS (re-exported from arcania-shared) ====================

export {
  Race,
  CharacterClass,
  Gender,
  ItemType,
  ItemRarity,
  EquipmentSlot,
  ZoneType,
  VaultTier,
} from '@shared/enums';

// Prisma enums re-exported under distinct names for direct Prisma usage
export {
  Race as PrismaRace,
  CharacterClass as PrismaCharacterClass,
  Gender as PrismaGender,
} from '@prisma/client';

// ==================== SHARED TYPES (re-exported from arcania-shared) ====================

export type {
  StatBlock,
  StatBonuses,
  DerivedStats,
  DerivedStatKey,
  RandomStat,
  ItemSpriteInfo,
  SocketSlot,
  RolledStat,
  ItemData,
  ItemInstance,
  InventoryItemData,
  EquipmentData,
  CharacterResources,
  CharacterPosition,
  AbilityEffect,
  AbilityData,
  CharacterAbilityData,
  VaultItemData,
  VaultData,
  AccountWallet,
  SpinRewardType,
  SpinReward,
  ListingCurrency,
  ListingSource,
  MarketplaceListingData,
  ListingFilters,
  ListingSortOption,
  CreateListingRequest,
  PaginatedListings,
  TransferDirection,
  TransferRequest,
  QuestReward,
  QuestDefinitionData,
  QuestStatus,
  PlayerQuestData,
  QuestDataResponse,
  LoginStreakResponse,
  ReferralStatsResponse,
  VendorId,
  VendorCurrency,
  VendorItemData,
  VendorDefinitionData,
  AuthResponseData,
} from '@shared/types';

// CharacterData is the server name for CharacterFull
export type { CharacterFull as CharacterData } from '@shared/types';

export { LEGACY_SLOT_MAP } from '@shared/types';

// ==================== SHARED CONSTANTS (re-exported from arcania-shared) ====================

export {
  VAULT_TIER_CONFIG,
  BAG_CAPACITY_CONFIG,
  calculateBagCapacity,
} from '@shared/constants';

// ==================== EXPRESS EXTENSIONS (server-only) ====================

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      requestId?: string;
    }
  }
}
