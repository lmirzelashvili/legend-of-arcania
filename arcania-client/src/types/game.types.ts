// Game Types - imports shared enums/types and adds client-only types

// ==================== IMPORTS FROM SHARED ====================

import {
  Race,
  CharacterClass,
  Gender,
  ItemType,
  ItemRarity,
  EquipmentSlot,
  ZoneType,
  VaultTier,
  AnimationType,
} from '@shared/enums';

import type {
  StatBlock,
  DerivedStats,
  CharacterResources,
  CharacterPosition,
  RandomStat,
  ItemSpriteInfo,
  ItemInstance as SharedItemInstance,
  ListingCurrency,
  ListingSource,
  VendorCurrency,
  VendorId,
} from '@shared/types';

// ==================== RE-EXPORTS FROM SHARED (enums as values) ====================

export {
  Race,
  CharacterClass,
  CharacterClass as Class,
  Gender,
  ItemType,
  ItemRarity,
  EquipmentSlot,
  ZoneType,
  VaultTier,
  AnimationType,
};

// ==================== RE-EXPORTS FROM SHARED (types) ====================

export type {
  StatBlock,
  StatBonuses,
  DerivedStats,
  DerivedStatKey,
  RandomStat,
  ItemSpriteInfo,
  SocketSlot,
  RolledStat,
  ItemInstance,
  InventoryItemData,
  EquipmentData,
  CharacterResources,
  CharacterPosition,
  CharacterSummary,
  CharacterFull,
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
  VendorId,
  VendorCurrency,
  VendorItemData,
  VendorDefinitionData,
  AuthResponseData,
} from '@shared/types';

export { LEGACY_SLOT_MAP } from '@shared/types';

// Constants that were previously defined locally in this file — now from shared
export {
  SPIN_REWARDS,
  VAULT_TIER_CONFIG,
  BAG_CAPACITY_CONFIG,
} from '@shared/constants';

// ==================== CLIENT-ONLY TYPES ====================
// These types use the client's `Item` interface (not shared `ItemData`)
// to maintain backward compatibility with existing component code.

// Make Class an alias type for backward compat — value re-export above covers enum usage
type Class = CharacterClass;

// ==================== ITEMS & INVENTORY ====================

export interface Item {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
  rarity: ItemRarity;
  isPrestige?: boolean;
  requiredLevel: number;
  requiredClass?: Class;
  equipmentSlot?: EquipmentSlot;

  // Stats
  physicalAttack?: number;
  magicAttack?: number;
  physicalDefense?: number;
  magicResistance?: number;

  // Consumable effects
  maxHp?: number;
  maxMana?: number;

  // Stat bonuses (primary stats - equipment can boost these)
  strength?: number;
  agility?: number;
  intelligence?: number;
  vitality?: number;
  spirit?: number;

  // Derived stat bonuses from equipment
  criticalChance?: number;
  criticalDamage?: number;
  attackSpeed?: number;
  armorPenetration?: number;
  magicPenetration?: number;
  hpRegen?: number;
  manaRegen?: number;
  movementSpeed?: number;

  // Excellent Bonus (MU Online style - 1 main prestige stat)
  excellentBonus?: number;
  excellentType?: 'DAMAGE' | 'DEFENSE' | 'HP';

  // Random Additional Stats (1-4 random options on drop)
  randomStats?: RandomStat[];

  // Enhancement
  enhancementLevel?: number;
  maxEnhancement?: number;

  // Gem data (for inventory gems)
  gemTemplateId?: string;
  gemStat?: string;
  gemValue?: number;

  // Set & socket data
  setId?: string;
  sockets?: { gemId: string | null; gemName?: string; gemStat?: string; gemValue?: number }[];

  // Sprite display
  spriteInfo?: ItemSpriteInfo;

  // Metadata
  stackable: boolean;
  maxStack: number;
  sellPrice: number;
  icon?: string;
}

// Legacy Item type alias
export type LegacyItem = Item;

export interface InventoryItem {
  id: string;
  item: Item;
  quantity: number;
  gridX: number;
  gridY: number;
  slot?: number; // Deprecated - calculated from gridX/gridY
}

export interface Inventory {
  id: string;
  characterId: string;
  items: InventoryItem[];
  maxSlots?: number;
}

export interface Equipment {
  id: string;
  characterId: string;
  weapon?: Item;
  offHand?: Item;
  head?: Item;
  chest?: Item;
  legs?: Item;
  boots?: Item;
  gloves?: Item;
  cape?: Item;
  wings?: Item;
  pendant?: Item;
  ring1?: Item;
  ring2?: Item;
}

// ==================== ABILITIES ====================

export interface AbilityEffect {
  type: string;
  value: number;
  duration?: number;
  description: string;
}

export interface Ability {
  id: string;
  name: string;
  class: Class;
  description: string;
  cooldown: number;
  manaCost: number;
  isUltimate: boolean;
  unlockLevel: number;
  effects: AbilityEffect[];
  icon?: string;
}

export interface CharacterAbility {
  id: string;
  ability: Ability;
  level: number;
}

// ==================== CHARACTER ====================

export interface Character {
  id: string;
  name: string;
  race: Race;
  class: Class;
  gender: 'male' | 'female';
  level: number;
  experience?: number;
  primaryStats?: StatBlock;
  derivedStats?: DerivedStats;
  resources?: CharacterResources;
  position?: CharacterPosition;
  inventory?: Inventory;
  equipment?: Equipment;
  abilities?: CharacterAbility[];
  unspentStatPoints?: number;
  abilityPoints?: number;
  hasBattlePass?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  characters?: Character[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PlayerData {
  characterId: string;
  userId: string;
  socketId: string;
  position: { x: number; y: number };
  mapId: string;
}

export interface ChatMessage {
  characterId: string;
  message: string;
  timestamp: number;
  characterName?: string;
}

// ==================== VAULT SYSTEM ====================

export interface VaultItem {
  id: string;
  item: Item;
  quantity: number;
  depositedAt: string;
  depositedBy: string;
}

export interface Vault {
  id: string;
  userId: string;
  tier: VaultTier;
  items: VaultItem[];
  maxSlots: number;
  gold: number;
  arcanite: number;
  purchasedExpandedAt?: string;
  purchasedPremiumAt?: string;
}

// ==================== TRANSFER OPERATIONS ====================

export interface TransferResult {
  success: boolean;
  message: string;
  updatedVault?: Vault;
  updatedCharacter?: Character;
}

export interface CanTransferResult {
  allowed: boolean;
  reason?: string;
  zoneType: ZoneType;
}

// ==================== MARKETPLACE / AUCTION HOUSE ====================

export interface MarketplaceListing {
  id: string;
  item: Item;
  quantity: number;
  price: number;
  currency: ListingCurrency;
  sellerId: string;
  sellerName: string;
  listedAt: string;
  source: ListingSource;
}

export interface CreateListingResult {
  success: boolean;
  message: string;
  listing?: MarketplaceListing;
  updatedCharacter?: Character;
  updatedVault?: Vault;
}

export interface PurchaseListingResult {
  success: boolean;
  message: string;
  updatedCharacter?: Character;
  purchasedItem?: Item;
}

export interface CancelListingResult {
  success: boolean;
  message: string;
  updatedCharacter?: Character;
  updatedVault?: Vault;
}

// ==================== VENDORS ====================

export interface VendorItem {
  id: string;
  templateId?: string;
  gemTemplateId?: string;
  item?: Item;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: VendorCurrency;
  requiredLevel?: number;
  stock: 'unlimited' | number;
  isComingSoon?: boolean;
  specialAction?: string;
  specialData?: Record<string, unknown>;
}

export interface VendorDefinition {
  id: VendorId;
  name: string;
  title: string;
  description: string;
  currency: VendorCurrency;
  categories: string[];
  items: VendorItem[];
}

export interface VendorPurchaseResult {
  success: boolean;
  message: string;
  updatedCharacter?: Character;
  updatedVault?: Vault;
}

// ==================== ITEM INSTANCE ↔ LEGACY ADAPTER ====================

/** Convert an ItemInstance to a legacy Item for backward-compatible UI rendering */
export function itemInstanceToLegacy(inst: SharedItemInstance): Item {
  const slot = inst.slot === EquipmentSlot.PENDANT ? EquipmentSlot.PENDANT : inst.slot;
  return {
    id: inst.instanceId,
    name: inst.enhancementLevel > 0 ? `${inst.name} +${inst.enhancementLevel}` : inst.name,
    description: inst.description,
    type: inst.type === ItemType.SHIELD ? ItemType.ARMOR : inst.type,
    rarity: inst.isPrestige ? ItemRarity.PRESTIGE : ItemRarity.REGULAR,
    isPrestige: inst.isPrestige,
    requiredLevel: inst.requiredLevel,
    requiredClass: inst.requiredClass,
    equipmentSlot: slot,
    physicalAttack: inst.effectiveStats.physicalAttack,
    magicAttack: inst.effectiveStats.magicAttack,
    physicalDefense: inst.effectiveStats.physicalDefense,
    magicResistance: inst.effectiveStats.magicResistance,
    maxHp: inst.effectiveStats.maxHp,
    maxMana: inst.effectiveStats.maxMana,
    criticalChance: inst.effectiveStats.criticalChance,
    criticalDamage: inst.effectiveStats.criticalDamage,
    attackSpeed: inst.effectiveStats.attackSpeed,
    armorPenetration: inst.effectiveStats.armorPenetration,
    magicPenetration: inst.effectiveStats.magicPenetration,
    hpRegen: inst.effectiveStats.hpRegen,
    manaRegen: inst.effectiveStats.manaRegen,
    movementSpeed: inst.effectiveStats.movementSpeed,
    enhancementLevel: inst.enhancementLevel,
    maxEnhancement: 15,
    setId: inst.setId,
    sockets: inst.sockets,
    spriteInfo: inst.spriteInfo,
    stackable: inst.stackable,
    maxStack: inst.maxStack,
    sellPrice: inst.sellPrice,
    icon: inst.icon,
  };
}
