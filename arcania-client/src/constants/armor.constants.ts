// ARCANIA - Armor Asset Mapping Configuration
// Maps game armor sets to LPC sprite assets

import { Class, ItemSpriteInfo } from '@/types/game.types';

// ==================== ARMOR TYPES ====================

export enum ArmorType {
  HEAVY_PLATE = 'HEAVY_PLATE',
  MEDIUM_LEATHER = 'MEDIUM_LEATHER',
  LIGHT_CLOTH = 'LIGHT_CLOTH',
}

export enum ArmorSlot {
  HEAD = 'HEAD',
  CHEST = 'CHEST',
  LEGS = 'LEGS',
  BOOTS = 'BOOTS',
  GLOVES = 'GLOVES',
  BRACERS = 'BRACERS',
  SHOULDERS = 'SHOULDERS',
  CAPE = 'CAPE',
}

// ==================== LPC SPRITE PATHS ====================

const LPC_BASE = '/assets/sprites';

export const LPC_PATHS = {
  // Torso/Chest armor
  TORSO_PLATE: `${LPC_BASE}/torso/armour/plate`,
  TORSO_LEATHER: `${LPC_BASE}/torso/armour/leather`,
  TORSO_LEGION: `${LPC_BASE}/torso/armour/legion`,
  TORSO_CHAINMAIL: `${LPC_BASE}/torso/chainmail`,

  // Leg armor
  LEGS_PLATE: `${LPC_BASE}/legs/armour/plate`,
  LEGS_PANTS: `${LPC_BASE}/legs/pants`,

  // Boots
  BOOTS_BASIC: `${LPC_BASE}/feet/boots/basic`,

  // Gloves (gauntlets)
  GLOVES: `${LPC_BASE}/arms/gloves`,

  // Arm armour (plate arm protection)
  ARM_ARMOUR: `${LPC_BASE}/arms/armour/plate`,

  // Bracers (wrist/forearm protection for light/medium armor)
  BRACERS: `${LPC_BASE}/arms/bracers`,

  // Helmets (various styles)
  HELMET_CLOSE: `${LPC_BASE}/equipment/armor/cloth/helmet/close`,
  HELMET_FLATTOP: `${LPC_BASE}/equipment/armor/cloth/helmet/flattop`,
  HELMET_BASCINET: `${LPC_BASE}/equipment/armor/cloth/helmet/bascinet`,
  HELMET_GREATHELM: `${LPC_BASE}/equipment/armor/cloth/helmet/greathelm`,
  HELMET_BARBUTA: `${LPC_BASE}/equipment/armor/cloth/helmet/barbuta`,

  // Hats/Headwear (alternative headgear)
  HAT_LEATHER_CAP: `${LPC_BASE}/hat/cloth/leather_cap`,
  HAT_HEADBAND: `${LPC_BASE}/hat/headband/thick`,
  HAT_HEADBAND_TIED: `${LPC_BASE}/hat/headband/tied`,
  HAT_BANDANA: `${LPC_BASE}/hat/pirate/bandana`,
  HAT_MAIL: `${LPC_BASE}/hat/helmet/mail`,
  HAT_SPANGENHELM: `${LPC_BASE}/hat/helmet/spangenhelm`,
  HAT_CROWN: `${LPC_BASE}/hat/formal/crown`,
  HAT_CAVALIER: `${LPC_BASE}/hat/pirate/cavalier`,
  HAT_BICORNE: `${LPC_BASE}/hat/pirate/bicorne/foreaft`,

  // Torso - Jackets
  TORSO_TABARD: `${LPC_BASE}/torso/jacket/tabard`,

  // Hoods
  HOOD: `${LPC_BASE}/hat/cloth/hood/adult`,
  HOOD_SACK: `${LPC_BASE}/equipment/armor/cloth/cloth/hood_sack/adult`,

  // Leather armor
  LEATHER_COLLARED: `${LPC_BASE}/equipment/armor/leather/collared`,
  LEATHER_FROCK: `${LPC_BASE}/equipment/armor/leather/frock`,

  // Cloth armor
  CLOTH_BLOUSE: `${LPC_BASE}/equipment/armor/cloth/blouse`,
  CLOTH_LONGSLEEVE: `${LPC_BASE}/equipment/armor/cloth/longsleeve/longsleeve2`,
  CLOTH_CORSET: `${LPC_BASE}/equipment/armor/cloth/corset`,

  // Shoulders
  SHOULDERS_PLATE: `${LPC_BASE}/shoulders/plate`,
  SHOULDERS_LEATHER: `${LPC_BASE}/shoulders/leather`,
  SHOULDERS_LEGION: `${LPC_BASE}/shoulders/legion`,
  SHOULDERS_MANTAL: `${LPC_BASE}/shoulders/mantal`,
  SHOULDERS_EPAULETS: `${LPC_BASE}/shoulders/epaulets`,

  // Headwear - Magic hats
  HAT_WIZARD: `${LPC_BASE}/hat/magic/wizard/base/adult`,
  HAT_CELESTIAL: `${LPC_BASE}/hat/magic/celestial/adult`,
  HAT_CELESTIAL_MOON: `${LPC_BASE}/hat/magic/celestial_moon/adult`,
  HAT_TIARA: `${LPC_BASE}/hat/formal/tiara/adult`,
  HAT_BANDANA2: `${LPC_BASE}/hat/cloth/bandana2/adult`,

  // Torso - Vest (per-animation)
  TORSO_VEST: `${LPC_BASE}/torso/clothes/vest`,

  // Torso - Longsleeve (per-animation)
  TORSO_LONGSLEEVE: `${LPC_BASE}/torso/clothes/longsleeve/longsleeve`,
  TORSO_LONGSLEEVE2: `${LPC_BASE}/torso/clothes/longsleeve/longsleeve2`,

  // Torso - Jackets (leather, universal)
  TORSO_COLLARED: `${LPC_BASE}/equipment/armor/leather/collared`,
  TORSO_FROCK: `${LPC_BASE}/equipment/armor/leather/frock`,
  TORSO_TRENCH: `${LPC_BASE}/equipment/armor/leather/trench`,

  // Cape
  CAPE_SOLID: `${LPC_BASE}/cape/solid`,
  CAPE_BEHIND: `${LPC_BASE}/cape/solid_behind`,
} as const;

// ==================== COLOR MAPPINGS ====================

// Metal colors available in LPC plate armor
export const METAL_COLORS = ['iron', 'steel', 'gold', 'silver', 'brass', 'bronze', 'copper', 'ceramic'] as const;
export type MetalColor = typeof METAL_COLORS[number];

// Cloth/leather colors available in LPC
export const CLOTH_COLORS = [
  'black', 'blue', 'bluegray', 'brown', 'charcoal', 'forest', 'gray', 'green',
  'lavender', 'leather', 'maroon', 'navy', 'orange', 'pink', 'purple', 'red',
  'rose', 'sky', 'slate', 'tan', 'teal', 'walnut', 'white', 'yellow'
] as const;
export type ClothColor = typeof CLOTH_COLORS[number];

// ==================== ARMOR SET DEFINITIONS ====================

export interface ArmorPieceAsset {
  path: string;           // Base path to the asset folder
  color: string;          // Color variant to use
  hasAnimations: boolean; // Whether it has per-animation folders
}

export interface ArmorSetDefinition {
  id: string;
  name: string;
  displayName: string;
  armorType: ArmorType;
  requiredLevel: number;
  pieces: {
    [ArmorSlot.HEAD]?: ArmorPieceAsset;
    [ArmorSlot.CHEST]?: ArmorPieceAsset;
    [ArmorSlot.LEGS]?: ArmorPieceAsset;
    [ArmorSlot.BOOTS]?: ArmorPieceAsset;
    [ArmorSlot.GLOVES]?: ArmorPieceAsset;
    [ArmorSlot.BRACERS]?: ArmorPieceAsset;
    [ArmorSlot.SHOULDERS]?: ArmorPieceAsset;
    [ArmorSlot.CAPE]?: ArmorPieceAsset;
  };
}

// ==================== PALADIN ARMOR SETS (Heavy Plate) ====================

export const PALADIN_ARMOR_SETS: ArmorSetDefinition[] = [
  {
    id: 'paladin_black_iron',
    name: 'black_iron',
    displayName: 'Black Iron',
    armorType: ArmorType.HEAVY_PLATE,
    requiredLevel: 1,
    pieces: {
      [ArmorSlot.HEAD]: { path: `${LPC_BASE}/equipment/armor/cloth/helmet/sugarloaf`, color: 'iron', hasAnimations: false },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_PLATE, color: 'iron', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PLATE, color: 'iron', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'iron', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'iron', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'iron', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_PLATE, color: 'iron', hasAnimations: true },
    },
  },
  {
    id: 'paladin_silver_guardian',
    name: 'silver_guardian',
    displayName: 'Silver Guardian',
    armorType: ArmorType.HEAVY_PLATE,
    requiredLevel: 20,
    pieces: {
      [ArmorSlot.HEAD]: { path: `${LPC_BASE}/equipment/armor/cloth/helmet/nasal`, color: 'silver', hasAnimations: false },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_PLATE, color: 'silver', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PLATE, color: 'silver', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'silver', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'silver', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'silver', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_PLATE, color: 'silver', hasAnimations: true },
    },
  },
  {
    id: 'paladin_immortal_plate',
    name: 'immortal_plate',
    displayName: 'Immortal Plate',
    armorType: ArmorType.HEAVY_PLATE,
    requiredLevel: 40,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HELMET_FLATTOP, color: 'steel', hasAnimations: false },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_PLATE, color: 'steel', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PLATE, color: 'steel', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'steel', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'steel', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'steel', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_PLATE, color: 'steel', hasAnimations: true },
    },
  },
  {
    id: 'paladin_great_crusader',
    name: 'great_crusader',
    displayName: 'Great Crusader',
    armorType: ArmorType.HEAVY_PLATE,
    requiredLevel: 60,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HELMET_GREATHELM, color: 'gold', hasAnimations: false },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_PLATE, color: 'gold', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PLATE, color: 'gold', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'gold', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'gold', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'gold', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_PLATE, color: 'gold', hasAnimations: true },
    },
  },
  {
    id: 'paladin_eternal_titan',
    name: 'eternal_titan',
    displayName: 'Eternal Titan',
    armorType: ArmorType.HEAVY_PLATE,
    requiredLevel: 80,
    pieces: {
      [ArmorSlot.HEAD]: { path: `${LPC_BASE}/equipment/armor/cloth/helmet/armet`, color: 'ceramic', hasAnimations: false },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_PLATE, color: 'ceramic', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PLATE, color: 'ceramic', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'ceramic', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'ceramic', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'ceramic', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_PLATE, color: 'ceramic', hasAnimations: true },
    },
  },
];

// ==================== FIGHTER ARMOR SETS (Heavy Plate) ====================

export const FIGHTER_ARMOR_SETS: ArmorSetDefinition[] = [
  {
    id: 'fighter_mercenary',
    name: 'mercenary',
    displayName: 'Mercenary',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 1,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_HEADBAND_TIED, color: 'brown', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEATHER, color: 'brown', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'charcoal', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'brown', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'brown', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'iron', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_LEATHER, color: 'brown', hasAnimations: true },
    },
  },
  {
    id: 'fighter_gladiator',
    name: 'gladiator',
    displayName: 'Gladiator',
    armorType: ArmorType.HEAVY_PLATE,
    requiredLevel: 20,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_HEADBAND, color: 'maroon', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEGION, color: 'bronze', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'maroon', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'brown', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'brown', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'bronze', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_LEGION, color: 'bronze', hasAnimations: true },
    },
  },
  {
    id: 'fighter_noble_knight',
    name: 'noble_knight',
    displayName: 'Noble Knight',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 40,
    pieces: {
      [ArmorSlot.HEAD]: { path: `${LPC_BASE}/hat/pirate/kerchief`, color: 'blue', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_TABARD, color: 'blue', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'navy', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'brown', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'brown', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'gold', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_LEATHER, color: 'blue', hasAnimations: true },
    },
  },
  {
    id: 'fighter_berserker',
    name: 'berserker',
    displayName: 'Berserker',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 60,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_BANDANA, color: 'maroon', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEATHER, color: 'maroon', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'black', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'maroon', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'maroon', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'copper', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_LEATHER, color: 'maroon', hasAnimations: true },
    },
  },
  {
    id: 'fighter_dreadlord',
    name: 'dreadlord',
    displayName: 'Dreadlord',
    armorType: ArmorType.HEAVY_PLATE,
    requiredLevel: 80,
    pieces: {
      [ArmorSlot.HEAD]: { path: `${LPC_BASE}/hat/helmet/horned`, color: 'brass', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEGION, color: 'brass', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'black', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'black', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'black', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.ARM_ARMOUR, color: 'brass', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_LEGION, color: 'brass', hasAnimations: true },
    },
  },
];

// ==================== RANGER ARMOR SETS (Medium Leather) ====================

export const RANGER_ARMOR_SETS: ArmorSetDefinition[] = [
  {
    id: 'ranger_leather_scout',
    name: 'leather_scout',
    displayName: 'Leather Scout',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 1,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_HEADBAND_TIED, color: 'brown', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEATHER, color: 'brown', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'brown', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'brown', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'brown', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'bronze', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'brown', hasAnimations: true },
    },
  },
  {
    id: 'ranger_elite_hunter',
    name: 'elite_hunter',
    displayName: 'Elite Hunter',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 20,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_LEATHER_CAP, color: 'brown', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEATHER, color: 'forest', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'forest', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'forest', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'forest', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'bronze', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'forest', hasAnimations: true },
    },
  },
  {
    id: 'ranger_black_ambition',
    name: 'black_ambition',
    displayName: 'Black Ambition',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 40,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_BANDANA, color: 'black', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEATHER, color: 'black', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'charcoal', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'black', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'black', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'iron', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'charcoal', hasAnimations: true },
    },
  },
  {
    id: 'ranger_venom',
    name: 'venom',
    displayName: 'Venom',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 60,
    pieces: {
      [ArmorSlot.HEAD]: { path: `${LPC_BASE}/hat/pirate/kerchief`, color: 'purple', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEATHER, color: 'purple', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'purple', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'purple', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'purple', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'copper', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'purple', hasAnimations: true },
    },
  },
  {
    id: 'ranger_phantom',
    name: 'phantom',
    displayName: 'Phantom',
    armorType: ArmorType.MEDIUM_LEATHER,
    requiredLevel: 80,
    pieces: {
      // No headwear - mysterious look
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LEATHER, color: 'gray', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'gray', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'gray', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'gray', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'steel', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'gray', hasAnimations: true },
    },
  },
];

// ==================== CLERIC ARMOR SETS (Light Cloth) ====================

export const CLERIC_ARMOR_SETS: ArmorSetDefinition[] = [
  {
    id: 'cleric_swift_silk',
    name: 'swift_silk',
    displayName: 'Swift Silk',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 1,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_TIARA, color: 'silver', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'white', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'white', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'white', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'white', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'silver', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'gray', hasAnimations: true },
    },
  },
  {
    id: 'cleric_spirit',
    name: 'spirit',
    displayName: 'Spirit',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 20,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_BANDANA2, color: 'lavender', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'lavender', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'lavender', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'lavender', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'lavender', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'silver', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'lavender', hasAnimations: true },
    },
  },
  {
    id: 'cleric_silver_wing',
    name: 'silver_wing',
    displayName: 'Silver Wing',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 40,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_TIARA, color: 'silver', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'gray', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'gray', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'silver', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'silver', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'silver', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'gray', hasAnimations: true },
    },
  },
  {
    id: 'cleric_manticore',
    name: 'manticore',
    displayName: 'Manticore',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 60,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HOOD, color: 'maroon', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'maroon', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'maroon', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'maroon', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'maroon', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'bronze', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'maroon', hasAnimations: true },
    },
  },
  {
    id: 'cleric_white_oracle',
    name: 'white_oracle',
    displayName: 'White Oracle',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 80,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HOOD, color: 'white', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'white', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'white', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'gold', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'gold', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'gold', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_EPAULETS, color: 'gold', hasAnimations: true },
    },
  },
];

// ==================== MAGE ARMOR SETS (Light Cloth) ====================

export const MAGE_ARMOR_SETS: ArmorSetDefinition[] = [
  {
    id: 'mage_mystic',
    name: 'mystic',
    displayName: 'Mystic',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 1,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_WIZARD, color: 'blue', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'blue', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'blue', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'blue', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'blue', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'silver', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'blue', hasAnimations: true },
    },
  },
  {
    id: 'mage_arcane',
    name: 'arcane',
    displayName: 'Arcane',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 20,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_WIZARD, color: 'purple', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'purple', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'purple', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'purple', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'purple', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'silver', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'purple', hasAnimations: true },
    },
  },
  {
    id: 'mage_eclipse',
    name: 'eclipse',
    displayName: 'Eclipse',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 40,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_WIZARD, color: 'black', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'black', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'black', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'black', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'black', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'iron', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'black', hasAnimations: true },
    },
  },
  {
    id: 'mage_moonlight',
    name: 'moonlight',
    displayName: 'Moonlight',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 60,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_WIZARD, color: 'sky', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'gray', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'gray', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'silver', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'silver', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'silver', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'sky', hasAnimations: true },
    },
  },
  {
    id: 'mage_void',
    name: 'void',
    displayName: 'Void',
    armorType: ArmorType.LIGHT_CLOTH,
    requiredLevel: 80,
    pieces: {
      [ArmorSlot.HEAD]: { path: LPC_PATHS.HAT_WIZARD, color: 'charcoal', hasAnimations: true },
      [ArmorSlot.CHEST]: { path: LPC_PATHS.TORSO_LONGSLEEVE2, color: 'charcoal', hasAnimations: true },
      [ArmorSlot.LEGS]: { path: LPC_PATHS.LEGS_PANTS, color: 'charcoal', hasAnimations: true },
      [ArmorSlot.BOOTS]: { path: LPC_PATHS.BOOTS_BASIC, color: 'charcoal', hasAnimations: true },
      [ArmorSlot.GLOVES]: { path: LPC_PATHS.GLOVES, color: 'charcoal', hasAnimations: true },
      [ArmorSlot.BRACERS]: { path: LPC_PATHS.BRACERS, color: 'steel', hasAnimations: true },
      [ArmorSlot.SHOULDERS]: { path: LPC_PATHS.SHOULDERS_MANTAL, color: 'charcoal', hasAnimations: true },
    },
  },
];

// ==================== CLASS TO ARMOR SETS MAPPING ====================

export const CLASS_ARMOR_SETS: Record<Class, ArmorSetDefinition[]> = {
  [Class.PALADIN]: PALADIN_ARMOR_SETS,
  [Class.FIGHTER]: FIGHTER_ARMOR_SETS,
  [Class.RANGER]: RANGER_ARMOR_SETS,
  [Class.CLERIC]: CLERIC_ARMOR_SETS,
  [Class.MAGE]: MAGE_ARMOR_SETS,
};

// ==================== HELPER FUNCTIONS ====================

export function getArmorSetForClass(characterClass: Class, level: number): ArmorSetDefinition {
  const sets = CLASS_ARMOR_SETS[characterClass];
  // Find highest level set the character qualifies for
  const qualifiedSets = sets.filter(set => set.requiredLevel <= level);
  return qualifiedSets[qualifiedSets.length - 1] || sets[0];
}

export function getArmorPiecePath(
  piece: ArmorPieceAsset,
  gender: 'male' | 'female',
  animation?: string
): string {
  if (piece.hasAnimations && animation) {
    // Path with animation folder: /path/gender/animation/color.png
    return `${piece.path}/${gender}/${animation}/${piece.color}.png`;
  }
  // Universal spritesheet: /path/gender/color.png
  return `${piece.path}/${gender}/${piece.color}.png`;
}

export function getAllArmorSets(): ArmorSetDefinition[] {
  return [
    ...PALADIN_ARMOR_SETS,
    ...FIGHTER_ARMOR_SETS,
    ...RANGER_ARMOR_SETS,
    ...CLERIC_ARMOR_SETS,
    ...MAGE_ARMOR_SETS,
  ];
}

export function getArmorSetById(id: string): ArmorSetDefinition | undefined {
  return getAllArmorSets().find(set => set.id === id);
}

// ==================== EQUIPMENT PREVIEW PROPS HELPER ====================

// This interface matches the equipment props expected by EquipmentPreview component
export interface EquipmentPreviewArmorProps {
  torso?: string;
  torsoMaterial?: string;
  legs?: string;
  legsMaterial?: string;
  boots?: string;
  bootsMaterial?: string;
  arms?: string;        // gloves (gauntlets)
  armsMaterial?: string;
  bracers?: string;     // arm armour (plate arm protection)
  bracersMaterial?: string;
  helmet?: string;
  helmetMaterial?: string;
  shoulders?: string;
  shouldersMaterial?: string;
  cape?: string;
  capeColor?: string;
}

/**
 * Converts an armor set definition to props compatible with EquipmentPreview
 * Maps our armor paths back to the format expected by the component
 */
export function getArmorPropsFromSet(set: ArmorSetDefinition): EquipmentPreviewArmorProps {
  const props: EquipmentPreviewArmorProps = {};

  // Extract equipment type from path
  // e.g., '/assets/sprites/torso/armour/plate' -> 'plate'
  const extractType = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  // CHEST - torso armor
  if (set.pieces[ArmorSlot.CHEST]) {
    const chest = set.pieces[ArmorSlot.CHEST];
    const chestPath = chest.path;
    // Handle different torso types
    if (chestPath.includes('/torso/clothes/vest')) {
      props.torso = 'vest';
    } else if (chestPath.includes('/torso/clothes/longsleeve/longsleeve2')) {
      props.torso = 'longsleeve2';
    } else if (chestPath.includes('/torso/clothes/longsleeve/longsleeve')) {
      props.torso = 'longsleeve';
    } else if (chestPath.includes('/equipment/armor/leather/collared')) {
      props.torso = 'collared';
    } else if (chestPath.includes('/equipment/armor/leather/frock')) {
      props.torso = 'frock';
    } else if (chestPath.includes('/equipment/armor/leather/trench')) {
      props.torso = 'trench';
    } else if (chestPath.includes('/equipment/armor/cloth/longsleeve/longsleeve2')) {
      props.torso = 'longsleeve2_universal';
    } else {
      props.torso = extractType(chestPath);
    }
    props.torsoMaterial = chest.color;
  }

  // LEGS - leg armor
  if (set.pieces[ArmorSlot.LEGS]) {
    const legs = set.pieces[ArmorSlot.LEGS];
    props.legs = extractType(legs.path);
    props.legsMaterial = legs.color;
  }

  // BOOTS - foot armor
  if (set.pieces[ArmorSlot.BOOTS]) {
    const boots = set.pieces[ArmorSlot.BOOTS];
    // EquipmentPreview now handles 'basic' specially to use /feet/boots/basic path
    props.boots = 'basic';
    props.bootsMaterial = boots.color;
  }

  // GLOVES - arm armor
  if (set.pieces[ArmorSlot.GLOVES]) {
    const gloves = set.pieces[ArmorSlot.GLOVES];
    // EquipmentPreview now handles 'gloves' specially to use /arms/gloves path
    props.arms = 'gloves';
    props.armsMaterial = gloves.color;
  }

  // HELMET - head armor
  if (set.pieces[ArmorSlot.HEAD]) {
    const helmet = set.pieces[ArmorSlot.HEAD];
    // Helmets have various types - extract the helmet type from path
    const helmPath = helmet.path;
    if (helmPath.includes('hood')) {
      props.helmet = 'hood';
    } else if (helmPath.includes('/helmet/')) {
      // Extract helmet type from path like .../helmet/sugarloaf or .../helmet/close
      const match = helmPath.match(/\/helmet\/([^\/]+)$/);
      if (match) {
        props.helmet = match[1];
      }
    } else if (helmPath.includes('/hat/cloth/leather_cap')) {
      props.helmet = 'leather_cap';
    } else if (helmPath.includes('/hat/headband/tied')) {
      props.helmet = 'headband_tied';
    } else if (helmPath.includes('/hat/headband/thick')) {
      props.helmet = 'headband';
    } else if (helmPath.includes('/hat/pirate/bandana')) {
      props.helmet = 'bandana';
    } else if (helmPath.includes('/hat/helmet/mail')) {
      props.helmet = 'mail';
    } else if (helmPath.includes('/hat/helmet/spangenhelm')) {
      props.helmet = 'spangenhelm';
    } else if (helmPath.includes('/hat/formal/crown')) {
      props.helmet = 'crown';
    } else if (helmPath.includes('/hat/pirate/cavalier')) {
      props.helmet = 'cavalier';
    } else if (helmPath.includes('/hat/pirate/bicorne')) {
      props.helmet = 'bicorne';
    } else if (helmPath.includes('/hat/pirate/kerchief')) {
      props.helmet = 'kerchief';
    } else if (helmPath.includes('/hat/helmet/horned')) {
      props.helmet = 'horned';
    } else if (helmPath.includes('/hat/magic/wizard')) {
      props.helmet = 'wizard';
    } else if (helmPath.includes('/hat/magic/celestial_moon')) {
      props.helmet = 'celestial_moon';
    } else if (helmPath.includes('/hat/magic/celestial')) {
      props.helmet = 'celestial';
    } else if (helmPath.includes('/hat/formal/tiara')) {
      props.helmet = 'tiara';
    } else if (helmPath.includes('/hat/cloth/bandana2')) {
      props.helmet = 'bandana2';
    }
    props.helmetMaterial = helmet.color;
  }

  // ARM ARMOUR - plate arm protection
  if (set.pieces[ArmorSlot.BRACERS]) {
    const armArmour = set.pieces[ArmorSlot.BRACERS];
    // Arm armour path format: just use 'plate' as the type
    props.bracers = 'plate';
    props.bracersMaterial = armArmour.color;
  }

  // SHOULDERS - shoulder armor
  if (set.pieces[ArmorSlot.SHOULDERS]) {
    const shoulders = set.pieces[ArmorSlot.SHOULDERS];
    // Extract shoulder type from path like .../shoulders/plate
    props.shoulders = extractType(shoulders.path);
    props.shouldersMaterial = shoulders.color;
  }

  // CAPE
  if (set.pieces[ArmorSlot.CAPE]) {
    const cape = set.pieces[ArmorSlot.CAPE];
    const capePath = cape.path;
    if (capePath.includes('/cape/solid')) {
      props.cape = 'solid';
    }
    props.capeColor = cape.color;
  }

  return props;
}

/**
 * Get armor props for a character based on class and level
 */
export function getArmorPropsForCharacter(
  characterClass: Class,
  level: number
): EquipmentPreviewArmorProps {
  const set = getArmorSetForClass(characterClass, level);
  return getArmorPropsFromSet(set);
}

/**
 * Get all available armor sets for a given class
 */
export function getArmorSetsForClass(characterClass: Class): ArmorSetDefinition[] {
  return CLASS_ARMOR_SETS[characterClass] || [];
}

// ==================== SPRITE INFO EXTRACTION ====================

/**
 * Extract per-slot ItemSpriteInfo from EquipmentPreviewArmorProps.
 * Each armor piece only needs the fields relevant to its slot.
 */
export function extractSpriteInfoForSlot(
  armorProps: EquipmentPreviewArmorProps,
  slot: ArmorSlot,
): ItemSpriteInfo {
  switch (slot) {
    case ArmorSlot.HEAD:
      return { helmetType: armorProps.helmet, helmetMaterial: armorProps.helmetMaterial };
    case ArmorSlot.CHEST:
      return { torsoType: armorProps.torso, torsoMaterial: armorProps.torsoMaterial };
    case ArmorSlot.LEGS:
      return { legsType: armorProps.legs, legsMaterial: armorProps.legsMaterial };
    case ArmorSlot.BOOTS:
      return { bootsType: armorProps.boots, bootsMaterial: armorProps.bootsMaterial };
    case ArmorSlot.GLOVES:
      return {
        armsType: armorProps.arms,
        armsMaterial: armorProps.armsMaterial,
        bracersType: armorProps.bracers,
        bracersMaterial: armorProps.bracersMaterial,
        shouldersType: armorProps.shoulders,
        shouldersMaterial: armorProps.shouldersMaterial,
      };
    case ArmorSlot.BRACERS:
      return { bracersType: armorProps.bracers, bracersMaterial: armorProps.bracersMaterial };
    case ArmorSlot.SHOULDERS:
      return { shouldersType: armorProps.shoulders, shouldersMaterial: armorProps.shouldersMaterial };
    case ArmorSlot.CAPE:
      return { capeType: armorProps.cape, capeColor: armorProps.capeColor };
    default:
      return {};
  }
}
