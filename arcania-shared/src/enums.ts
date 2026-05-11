// ==================== CORE ENUMS ====================
// Single source of truth for all game enums.
// Both client and server import from here.

export enum Race {
  HUMAN = 'HUMAN',
  LUMINAR = 'LUMINAR',
  LILIN = 'LILIN',
  DARKAN = 'DARKAN',
}

export enum CharacterClass {
  PALADIN = 'PALADIN',
  FIGHTER = 'FIGHTER',
  RANGER = 'RANGER',
  CLERIC = 'CLERIC',
  MAGE = 'MAGE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

// ==================== ITEM ENUMS ====================

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  SHIELD = 'SHIELD',
  ACCESSORY = 'ACCESSORY',
  CONSUMABLE = 'CONSUMABLE',
  MATERIAL = 'MATERIAL',
  GEM = 'GEM',
  CRYSTAL = 'CRYSTAL',
  QUEST = 'QUEST',
}

export enum ItemRarity {
  REGULAR = 'REGULAR',
  PRESTIGE = 'PRESTIGE',
}

export enum EquipmentSlot {
  WEAPON = 'WEAPON',
  OFF_HAND = 'OFF_HAND',
  HEAD = 'HEAD',
  CHEST = 'CHEST',
  LEGS = 'LEGS',
  BOOTS = 'BOOTS',
  GLOVES = 'GLOVES',
  CAPE = 'CAPE',
  WINGS = 'WINGS',
  PENDANT = 'PENDANT',
  RING_1 = 'RING_1',
  RING_2 = 'RING_2',
}

// ==================== ZONE & VAULT ENUMS ====================

export enum ZoneType {
  SAFE = 'SAFE',
  PVE = 'PVE',
  PVP = 'PVP',
}

export enum VaultTier {
  BASE = 'BASE',
  EXPANDED = 'EXPANDED',
  PREMIUM = 'PREMIUM',
}

// ==================== ANIMATION ENUM ====================

export enum AnimationType {
  WALK = 'walk',
  RUN = 'run',
  IDLE = 'idle',
  COMBAT_IDLE = 'combat_idle',
  SLASH = 'slash',
  BACKSLASH = 'backslash',
  HALFSLASH = 'halfslash',
  THRUST = 'thrust',
  SHOOT = 'shoot',
  SPELLCAST = 'spellcast',
  HURT = 'hurt',
  SIT = 'sit',
  CLIMB = 'climb',
  JUMP = 'jump',
  EMOTE = 'emote',
}
