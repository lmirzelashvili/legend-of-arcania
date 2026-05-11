// ==================== SHARED TYPE DEFINITIONS ====================
// Canonical interfaces for the API contract between client and server.
// Server types (with required fields) are the authoritative source.

import {
  Race,
  CharacterClass,
  Gender,
  ItemType,
  ItemRarity,
  EquipmentSlot,
  ZoneType,
  VaultTier,
} from './enums.js';

// ==================== STAT INTERFACES ====================

export interface StatBlock {
  strength: number;
  agility: number;
  intelligence: number;
  vitality: number;
  spirit: number;
}

/** Alias used for stat bonus records (same shape as StatBlock) */
export type StatBonuses = StatBlock;

export interface DerivedStats {
  maxHp: number;
  maxMana: number;
  physicalAttack: number;
  magicAttack: number;
  physicalDefense: number;
  magicResistance: number;
  criticalChance: number;
  criticalDamage: number;
  attackSpeed: number;
  armorPenetration: number;
  magicPenetration: number;
  dodgeChance: number;
  blockChance: number;
  hpRegen: number;
  manaRegen: number;
  movementSpeed: number;
  prestigeDamage: number;
}

/** Union of valid keys on DerivedStats (matches the interface exactly) */
export type DerivedStatKey =
  | 'maxHp' | 'maxMana'
  | 'physicalAttack' | 'magicAttack'
  | 'physicalDefense' | 'magicResistance'
  | 'criticalChance' | 'criticalDamage'
  | 'attackSpeed'
  | 'armorPenetration' | 'magicPenetration'
  | 'dodgeChance' | 'blockChance'
  | 'hpRegen' | 'manaRegen'
  | 'movementSpeed' | 'prestigeDamage';

// ==================== ITEM INTERFACES ====================

export interface RandomStat {
  stat: string;
  value: number;
}

export interface ItemSpriteInfo {
  helmetType?: string;
  helmetMaterial?: string;
  torsoType?: string;
  torsoMaterial?: string;
  legsType?: string;
  legsMaterial?: string;
  armsType?: string;
  armsMaterial?: string;
  bootsType?: string;
  bootsMaterial?: string;
  shouldersType?: string;
  shouldersMaterial?: string;
  bracersType?: string;
  bracersMaterial?: string;
  capeType?: string;
  capeColor?: string;
  wingsType?: string;
  wingsColor?: string;
  weaponType?: string;
  weaponColor?: string;
  shieldType?: string;
  shieldVariant?: string;
  offHandWeapon?: string;
  offHandWeaponColor?: string;
}

export interface SocketSlot {
  gemId: string | null;
  gemName?: string;
  gemStat?: DerivedStatKey;
  gemValue?: number;
}

export interface RolledStat {
  stat: DerivedStatKey;
  value: number;
}

/**
 * ItemData — the template/definition of an item.
 * This is the server's canonical `ItemData` interface.
 * (The client previously called this `Item`.)
 */
export interface ItemData {
  id: string;
  name: string;
  description?: string;
  type: ItemType;
  rarity: ItemRarity;
  isPrestige?: boolean;
  requiredLevel: number;
  requiredClass?: CharacterClass;
  equipmentSlot?: EquipmentSlot;

  // Combat stats
  physicalAttack?: number;
  magicAttack?: number;
  physicalDefense?: number;
  magicResistance?: number;

  // Consumable effects
  maxHp?: number;
  maxMana?: number;

  // Primary stat bonuses
  strength?: number;
  agility?: number;
  intelligence?: number;
  vitality?: number;
  spirit?: number;

  // Derived stat bonuses
  criticalChance?: number;
  criticalDamage?: number;
  attackSpeed?: number;
  armorPenetration?: number;
  magicPenetration?: number;
  hpRegen?: number;
  manaRegen?: number;
  movementSpeed?: number;

  // Excellent Bonus (MU Online style)
  excellentBonus?: number;
  excellentType?: 'DAMAGE' | 'DEFENSE' | 'HP';

  // Random Additional Stats
  randomStats?: RandomStat[];

  // Enhancement
  enhancementLevel?: number;
  maxEnhancement?: number;

  // Gem data
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

/**
 * ItemInstance — a specific drop/copy of an item with rolled stats,
 * enhancement level, sockets, etc.
 */
export interface ItemInstance {
  instanceId: string;
  templateId: string;
  name: string;
  description?: string;
  type: ItemType;
  slot?: EquipmentSlot;
  tier: number;
  requiredLevel: number;
  requiredClass?: CharacterClass;

  baseStat: number;
  baseStatType?: 'defense' | 'damage';

  identityStat?: DerivedStatKey;
  identityValue?: number;

  bonusStats: RolledStat[];

  isPrestige: boolean;
  prestigeStat?: DerivedStatKey;
  prestigeValue?: number;

  sockets: SocketSlot[];

  enhancementLevel: number;

  setId?: string;

  stackable: boolean;
  maxStack: number;
  sellPrice: number;
  icon?: string;
  spriteInfo?: ItemSpriteInfo;

  effectiveStats: Partial<Record<DerivedStatKey, number>>;
}

// ==================== INVENTORY & EQUIPMENT ====================

export interface InventoryItemData {
  id: string;
  item: ItemData;
  quantity: number;
  gridX: number;
  gridY: number;
}

export interface EquipmentData {
  id: string;
  characterId: string;
  weapon?: ItemData;
  offHand?: ItemData;
  head?: ItemData;
  chest?: ItemData;
  legs?: ItemData;
  boots?: ItemData;
  gloves?: ItemData;
  cape?: ItemData;
  wings?: ItemData;
  pendant?: ItemData;
  ring1?: ItemData;
  ring2?: ItemData;
}

// ==================== CHARACTER INTERFACES ====================

export interface CharacterResources {
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  gold: number;
  arcanite: number;
}

export interface CharacterPosition {
  x: number;
  y: number;
  mapId: string;
  zoneType?: ZoneType;
}

/** Minimal character info for list endpoints */
export interface CharacterSummary {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  gender: Gender;
  level: number;
}

/** Full character data for detail endpoints */
export interface CharacterFull {
  id: string;
  name: string;
  race: Race;
  class: CharacterClass;
  gender: Gender;
  level: number;
  experience: number;
  primaryStats: StatBlock;
  derivedStats: DerivedStats;
  resources: CharacterResources;
  position?: CharacterPosition;
  inventory: {
    id: string;
    characterId: string;
    items: InventoryItemData[];
    maxSlots: number;
  };
  equipment: EquipmentData;
  abilities: CharacterAbilityData[];
  unspentStatPoints: number;
  abilityPoints: number;
  hasBattlePass: boolean;
  createdAt: string;
  lastLoginAt: string;
}

// ==================== ABILITY INTERFACES ====================

export interface AbilityEffect {
  type: string;
  value: number;
  duration?: number;
  description: string;
}

export interface AbilityData {
  id: string;
  name: string;
  class: CharacterClass;
  description: string;
  cooldown: number;
  manaCost: number;
  isUltimate: boolean;
  unlockLevel: number;
  effects: AbilityEffect[];
  icon?: string;
}

export interface CharacterAbilityData {
  id: string;
  ability: AbilityData;
  level: number;
}

// ==================== VAULT ====================

export interface VaultItemData {
  id: string;
  item: ItemData;
  quantity: number;
  depositedAt: string;
  depositedBy: string;
}

export interface VaultData {
  id: string;
  userId: string;
  tier: VaultTier;
  items: VaultItemData[];
  maxSlots: number;
  gold: number;
  arcanite: number;
  purchasedExpandedAt?: string;
  purchasedPremiumAt?: string;
}

// ==================== ACCOUNT WALLET ====================

export interface AccountWallet {
  gold: number;
  creationTokens: number;
  spinsRemaining: number;
  lastSpinReset: string;
}

export type SpinRewardType = 'gold' | 'arcanite' | 'creation_token';

export interface SpinReward {
  type: SpinRewardType;
  gold?: number;
  arcanite?: number;
  goldDeposited?: number;
  arcaniteDeposited?: number;
  weight: number;
}

// ==================== MARKETPLACE ====================

export type ListingCurrency = 'gold' | 'arcanite';
export type ListingSource = 'npc' | 'player' | 'mock_player';

export interface MarketplaceListingData {
  id: string;
  item: ItemData;
  quantity: number;
  price: number;
  currency: ListingCurrency;
  sellerId: string;
  sellerName: string;
  listedAt: string;
  source: ListingSource;
}

export interface ListingFilters {
  type?: ItemType;
  rarity?: ItemRarity;
  minLevel?: number;
  maxLevel?: number;
  class?: CharacterClass;
  currency?: ListingCurrency;
  minPrice?: number;
  maxPrice?: number;
  minEnhancement?: number;
  maxEnhancement?: number;
  search?: string;
  source?: ListingSource;
}

export type ListingSortOption = 'price_asc' | 'price_desc' | 'recent' | 'relevant';

export interface CreateListingRequest {
  characterId?: string;
  inventoryItemId?: string;
  vaultItemId?: string;
  itemSource: 'bag' | 'vault';
  price: number;
  currency: ListingCurrency;
  quantity: number;
}

export interface PaginatedListings {
  listings: MarketplaceListingData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== TRANSFER OPERATIONS ====================

export type TransferDirection = 'BAG_TO_VAULT' | 'VAULT_TO_BAG';

export interface TransferRequest {
  characterId: string;
  itemId: string;
  quantity: number;
  direction: TransferDirection;
}

// ==================== QUEST ====================

export interface QuestReward {
  gold?: number;
  arcanite?: number;
  xp?: number;
  item?: string;
  booster?: string;
  commissionPercent?: number;
  commissionDays?: number;
}

export interface QuestDefinitionData {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  targetProgress: number;
  reward: QuestReward;
  unlockLevel?: number;
  prerequisiteQuestId?: string;
  isRepeatable: boolean;
  resetPeriod?: 'daily' | 'weekly';
  trackingKey: string;
}

export type QuestStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'CLAIMABLE' | 'COMPLETED';

export interface PlayerQuestData {
  id: string;
  questId: string;
  status: QuestStatus;
  progress: number;
  completedAt: string | null;
  claimedAt: string | null;
  quest: QuestDefinitionData;
}

export interface QuestDataResponse {
  quests: {
    social: PlayerQuestData[];
    achievement: PlayerQuestData[];
    daily: PlayerQuestData[];
    weekly: PlayerQuestData[];
    referral: PlayerQuestData[];
  };
  totalQuests: number;
  completedQuests: number;
  claimableQuests: number;
}

export interface LoginStreakResponse {
  streakDay: number;
  reward: QuestReward;
  isNewDay: boolean;
}

export interface ReferralStatsResponse {
  code: string | null;
  totalReferrals: number;
  commissionEarned: number;
}

// ==================== VENDOR ====================

export type VendorId = 'blacksmith' | 'alchemist' | 'arcanist';
export type VendorCurrency = 'gold' | 'arcanite';

export interface VendorItemData {
  id: string;
  templateId?: string;
  gemTemplateId?: string;
  item?: ItemData;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: VendorCurrency;
  requiredLevel?: number;
  stock: 'unlimited' | number;
  isComingSoon?: boolean;
  specialAction?: string;
  specialData?: Record<string, any>;
}

export interface VendorDefinitionData {
  id: VendorId;
  name: string;
  title: string;
  description: string;
  currency: VendorCurrency;
  categories: string[];
  items: VendorItemData[];
}

// ==================== AUTH ====================

export interface AuthResponseData {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}

// ==================== LEGACY MAPPINGS ====================

export const LEGACY_SLOT_MAP: Record<string, EquipmentSlot> = {
  'BRACERS': EquipmentSlot.GLOVES,
  'SHOULDERS': EquipmentSlot.CHEST,
  'NECK': EquipmentSlot.PENDANT,
};

// ==================== API RESPONSE ENVELOPE ====================

export interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
