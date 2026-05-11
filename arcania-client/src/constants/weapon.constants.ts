// ARCANIA - Weapon Asset Mapping Configuration
// Maps game weapons to LPC sprite assets

import { Class } from '@/types/game.types';

// ==================== WEAPON TYPES ====================

export enum WeaponType {
  MACE = 'MACE',
  SWORD = 'SWORD',
  LANCE = 'LANCE',
  BOW = 'BOW',
  CROSSBOW = 'CROSSBOW',
  STAFF = 'STAFF',
  WAND = 'WAND',
}

export enum WeaponSlot {
  MAIN_HAND = 'MAIN_HAND',
  OFF_HAND = 'OFF_HAND',
  TWO_HAND = 'TWO_HAND',
}

export enum OffHandType {
  SHIELD = 'SHIELD',
  TOME = 'TOME',
  WEAPON = 'WEAPON',  // For dual wielding (Fighter)
  NONE = 'NONE',
}

// ==================== WEAPON PATH HELPERS ====================

const LPC_BASE = '/assets/sprites';
const WS = `${LPC_BASE}/weapon_sets`;

// Per-weapon path: weapon_sets/{class}/{weaponName}/{type}
const wp = (cls: string, name: string, type: string) => `${WS}/${cls}/${name}/${type}`;
// Shield path: weapon_sets/shields/{gameName}/{shieldType}
const sp = (gameName: string, shieldType: string) => `${WS}/shields/${gameName}/${shieldType}`;

// ==================== COLOR MAPPINGS ====================

// Metal colors for weapons
export const WEAPON_METAL_COLORS = ['iron', 'steel', 'gold', 'silver', 'brass', 'bronze', 'copper', 'ceramic'] as const;
export type WeaponMetalColor = typeof WEAPON_METAL_COLORS[number];

// Wood colors for bows/staves
export const WEAPON_WOOD_COLORS = ['light', 'medium', 'dark', 'red'] as const;
export type WeaponWoodColor = typeof WEAPON_WOOD_COLORS[number];

// Crystal/gem colors for magic staves
export const STAFF_GEM_COLORS = ['blue', 'green', 'orange', 'purple', 'red', 'yellow'] as const;
export type StaffGemColor = typeof STAFF_GEM_COLORS[number];

// Glow sword colors
export const GLOW_COLORS = ['blue', 'red'] as const;
export type GlowColor = typeof GLOW_COLORS[number];

// Shield pattern colors
export const SHIELD_COLORS = [
  'black', 'blue', 'bluegray', 'brown', 'charcoal', 'forest', 'gray', 'green',
  'lavender', 'leather', 'maroon', 'navy', 'orange', 'pink', 'purple', 'red',
  'rose', 'sky', 'slate', 'tan', 'teal', 'walnut', 'white', 'yellow', 'gold', 'silver'
] as const;
export type ShieldColor = typeof SHIELD_COLORS[number];

// ==================== WEAPON DEFINITIONS ====================

export interface WeaponAsset {
  path: string;
  color: string;
  hasLayers: boolean;       // Has foreground/background layers
  hasAnimations: boolean;   // Has per-animation folders
  animationType?: 'slash' | 'thrust' | 'shoot' | 'universal';
}

export interface ShieldAsset {
  path: string;
  pattern?: string;         // For heater shields with patterns
  color: string;
  hasLayers: boolean;
}

export interface WeaponSetDefinition {
  id: string;
  name: string;
  displayName: string;
  weaponType: WeaponType;
  weaponSlot: WeaponSlot;
  requiredLevel: number;
  mainHand: WeaponAsset;
  offHand?: ShieldAsset | WeaponAsset;
  offHandType: OffHandType;
}

// ==================== PALADIN WEAPONS (Mace + Shield) ====================
// Weapons: Iron Mace → Azure Mace → Noble Mace → Colossus Mace → Dawn Breaker
// Shields: Iron Shield → Bastion Shield → Golden Bulwark → Glorious Shield → Titan's Aegis

export const PALADIN_WEAPONS: WeaponSetDefinition[] = [
  {
    id: 'paladin_iron_mace',
    name: 'iron_mace',
    displayName: 'Iron Mace',
    weaponType: WeaponType.MACE,
    weaponSlot: WeaponSlot.MAIN_HAND,
    requiredLevel: 1,
    mainHand: {
      path: wp('paladin', 'iron_mace', 'mace'),
      color: 'iron_mace',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHand: {
      path: sp('iron_shield', 'round'),
      color: 'black',
      hasLayers: false,
    },
    offHandType: OffHandType.SHIELD,
  },
  {
    id: 'paladin_azure_mace',
    name: 'azure_mace',
    displayName: 'Azure Mace',
    weaponType: WeaponType.MACE,
    weaponSlot: WeaponSlot.MAIN_HAND,
    requiredLevel: 20,
    mainHand: {
      path: wp('paladin', 'azure_mace', 'mace'),
      color: 'azure_mace',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHand: {
      path: sp('bastion_shield', 'kite'),
      color: 'kite_gray_blue',
      hasLayers: false,
    },
    offHandType: OffHandType.SHIELD,
  },
  {
    id: 'paladin_noble_mace',
    name: 'noble_mace',
    displayName: 'Noble Mace',
    weaponType: WeaponType.MACE,
    weaponSlot: WeaponSlot.MAIN_HAND,
    requiredLevel: 40,
    mainHand: {
      path: wp('paladin', 'noble_mace', 'mace'),
      color: 'noble_mace',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHand: {
      path: sp('golden_bulwark', 'heater'),
      pattern: 'original/paint',
      color: 'gold',
      hasLayers: true,
    },
    offHandType: OffHandType.SHIELD,
  },
  {
    id: 'paladin_colossus_mace',
    name: 'colossus_mace',
    displayName: 'Colossus Mace',
    weaponType: WeaponType.MACE,
    weaponSlot: WeaponSlot.MAIN_HAND,
    requiredLevel: 60,
    mainHand: {
      path: wp('paladin', 'colossus_mace', 'mace'),
      color: 'colossus_mace',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHand: {
      path: sp('glorious_shield', 'crusader'),
      color: 'crusader',
      hasLayers: true,
    },
    offHandType: OffHandType.SHIELD,
  },
  {
    id: 'paladin_dawn_breaker',
    name: 'dawn_breaker',
    displayName: 'Dawn Breaker',
    weaponType: WeaponType.MACE,
    weaponSlot: WeaponSlot.MAIN_HAND,
    requiredLevel: 80,
    mainHand: {
      path: wp('paladin', 'dawn_breaker', 'mace'),
      color: 'dawn_breaker',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHand: {
      path: sp('titans_aegis', 'spartan'),
      color: 'spartan',
      hasLayers: true,
    },
    offHandType: OffHandType.SHIELD,
  },
];

// ==================== FIGHTER WEAPONS (Sword/Lance) ====================

export const FIGHTER_WEAPONS: WeaponSetDefinition[] = [
  {
    id: 'fighter_iron_sword',
    name: 'iron_sword',
    displayName: 'Iron Sword',
    weaponType: WeaponType.SWORD,
    weaponSlot: WeaponSlot.MAIN_HAND,
    requiredLevel: 1,
    mainHand: {
      path: wp('fighter', 'iron_sword', 'arming'),
      color: 'iron',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHandType: OffHandType.NONE,
  },
  {
    id: 'fighter_battle_spear',
    name: 'battle_spear',
    displayName: 'Battle Spear',
    weaponType: WeaponType.LANCE,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 20,
    mainHand: {
      path: wp('fighter', 'battle_spear', 'halberd'),
      color: 'halberd',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHandType: OffHandType.NONE,
  },
  {
    id: 'fighter_flame_sword',
    name: 'flame_sword',
    displayName: 'Flame Sword',
    weaponType: WeaponType.SWORD,
    weaponSlot: WeaponSlot.MAIN_HAND,
    requiredLevel: 40,
    mainHand: {
      path: wp('fighter', 'flame_sword', 'glowsword'),
      color: 'red',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHand: {
      path: wp('fighter', 'flame_sword', 'glowsword'),
      color: 'red',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHandType: OffHandType.WEAPON,
  },
  {
    id: 'fighter_dark_scythe',
    name: 'dark_scythe',
    displayName: 'Dark Scythe',
    weaponType: WeaponType.LANCE,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 60,
    mainHand: {
      path: wp('fighter', 'dark_scythe', 'scythe'),
      color: 'scythe',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHandType: OffHandType.NONE,
  },
  {
    id: 'fighter_executioner',
    name: 'executioner',
    displayName: 'Executioner',
    weaponType: WeaponType.SWORD,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 80,
    mainHand: {
      path: wp('fighter', 'executioner', 'longsword'),
      color: 'longsword',
      hasLayers: false,
      hasAnimations: true,
      animationType: 'slash',
    },
    offHandType: OffHandType.NONE,
  },
];

// ==================== RANGER WEAPONS (Bows) ====================

export const RANGER_WEAPONS: WeaponSetDefinition[] = [
  {
    id: 'ranger_short_bow',
    name: 'short_bow',
    displayName: 'Short Bow',
    weaponType: WeaponType.BOW,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 1,
    mainHand: {
      path: wp('ranger', 'short_bow', 'normal'),
      color: 'light',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'universal',
    },
    offHandType: OffHandType.NONE,
  },
  {
    id: 'ranger_hunters_bow',
    name: 'hunters_bow',
    displayName: 'Hunters Bow',
    weaponType: WeaponType.BOW,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 20,
    mainHand: {
      path: wp('ranger', 'hunters_bow', 'normal'),
      color: 'dark',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'universal',
    },
    offHandType: OffHandType.NONE,
  },
  {
    id: 'ranger_golden_crossbow',
    name: 'golden_crossbow',
    displayName: 'Golden Recurve',
    weaponType: WeaponType.BOW,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 40,
    mainHand: {
      path: wp('ranger', 'golden_crossbow', 'recurve'),
      color: 'gold',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'universal',
    },
    offHandType: OffHandType.NONE,
  },
  {
    id: 'ranger_legendary_bow',
    name: 'legendary_bow',
    displayName: 'Legendary Bow',
    weaponType: WeaponType.BOW,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 60,
    mainHand: {
      path: wp('ranger', 'legendary_bow', 'recurve'),
      color: 'red',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'universal',
    },
    offHandType: OffHandType.NONE,
  },
  {
    id: 'ranger_titan_bow',
    name: 'titan_bow',
    displayName: 'Titan Bow',
    weaponType: WeaponType.BOW,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 80,
    mainHand: {
      path: wp('ranger', 'titan_bow', 'great'),
      color: 'gold',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'universal',
    },
    offHandType: OffHandType.NONE,
  },
];

// ==================== CLERIC WEAPONS (Staves - Healing Focus) ====================

export const CLERIC_WEAPONS: WeaponSetDefinition[] = [
  {
    id: 'cleric_oak_staff',
    name: 'oak_staff',
    displayName: 'Oak Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 1,
    mainHand: {
      path: wp('cleric', 'oak_staff', 'gnarled'),
      color: 'light',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'cleric_healing_staff',
    name: 'healing_staff',
    displayName: 'Healing Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 20,
    mainHand: {
      path: wp('cleric', 'healing_staff', 'loop'),
      color: 'light',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'cleric_anias_staff',
    name: 'anias_staff',
    displayName: 'Anias Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 40,
    mainHand: {
      path: wp('cleric', 'anias_staff', 'diamond'),
      color: 'gold',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'cleric_angel_wing',
    name: 'angel_wing',
    displayName: 'Angel Wing',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 60,
    mainHand: {
      path: wp('cleric', 'angel_wing', 'crystal'),
      color: 'yellow',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'cleric_archangel',
    name: 'archangel',
    displayName: 'Archangel',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 80,
    mainHand: {
      path: wp('cleric', 'archangel', 'diamond'),
      color: 'ceramic',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
];

// ==================== MAGE WEAPONS (Staves - Damage Focus) ====================

export const MAGE_WEAPONS: WeaponSetDefinition[] = [
  {
    id: 'mage_oak_staff',
    name: 'oak_staff',
    displayName: 'Oak Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 1,
    mainHand: {
      path: wp('mage', 'oak_staff', 'simple'),
      color: 'simple',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'mage_healing_staff',
    name: 'healing_staff',
    displayName: 'Arcane Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 20,
    mainHand: {
      path: wp('mage', 'healing_staff', 'crystal'),
      color: 'blue',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'mage_anias_staff',
    name: 'anias_staff',
    displayName: 'Anias Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 40,
    mainHand: {
      path: wp('mage', 'anias_staff', 'diamond'),
      color: 'silver',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'mage_angel_wing',
    name: 'angel_wing',
    displayName: 'Eclipse Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 60,
    mainHand: {
      path: wp('mage', 'angel_wing', 'crystal'),
      color: 'purple',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
  {
    id: 'mage_archangel',
    name: 'archangel',
    displayName: 'Void Staff',
    weaponType: WeaponType.STAFF,
    weaponSlot: WeaponSlot.TWO_HAND,
    requiredLevel: 80,
    mainHand: {
      path: wp('mage', 'archangel', 'crystal'),
      color: 'red',
      hasLayers: true,
      hasAnimations: true,
      animationType: 'thrust',
    },
    offHandType: OffHandType.TOME,
  },
];

// ==================== CLASS TO WEAPON SETS MAPPING ====================

export const CLASS_WEAPON_SETS: Record<Class, WeaponSetDefinition[]> = {
  [Class.PALADIN]: PALADIN_WEAPONS,
  [Class.FIGHTER]: FIGHTER_WEAPONS,
  [Class.RANGER]: RANGER_WEAPONS,
  [Class.CLERIC]: CLERIC_WEAPONS,
  [Class.MAGE]: MAGE_WEAPONS,
};

// ==================== ANIMATION MAPPINGS ====================

// Map game animations to LPC weapon animation folders
export const WEAPON_ANIMATION_MAP: Record<string, string> = {
  // Idle animations - use universal
  idle: 'universal',

  // Movement - use universal or walk
  walk: 'walk',
  run: 'walk',

  // Attack animations
  attack: 'attack_slash',
  slash: 'attack_slash',
  backslash: 'attack_backslash',
  halfslash: 'attack_halfslash',
  thrust: 'thrust',
  shoot: 'thrust',

  // Spell casting - use thrust
  cast: 'thrust',
  spellcast: 'thrust',

  // Other
  hurt: 'hurt',
  death: 'hurt',
};

// Get the appropriate animation folder for a weapon
export function getWeaponAnimationFolder(
  animation: string,
  weapon: WeaponAsset
): string {
  const mapped = WEAPON_ANIMATION_MAP[animation] || 'universal';

  // For thrust-type weapons, prefer thrust animation
  if (weapon.animationType === 'thrust' && mapped === 'attack_slash') {
    return 'thrust';
  }

  // For shoot-type weapons
  if (weapon.animationType === 'shoot' && mapped === 'attack_slash') {
    return 'thrust';
  }

  return mapped;
}

// ==================== HELPER FUNCTIONS ====================

export function getWeaponSetForClass(characterClass: Class, level: number): WeaponSetDefinition {
  const sets = CLASS_WEAPON_SETS[characterClass];
  // Find highest level set the character qualifies for
  const qualifiedSets = sets.filter(set => set.requiredLevel <= level);
  return qualifiedSets[qualifiedSets.length - 1] || sets[0];
}

export function getWeaponPath(
  weapon: WeaponAsset,
  animation: string = 'universal'
): { foreground?: string; background?: string; single?: string } {
  const animFolder = getWeaponAnimationFolder(animation, weapon);

  if (weapon.hasLayers) {
    return {
      foreground: `${weapon.path}/${animFolder}/foreground/${weapon.color}.png`,
      background: `${weapon.path}/${animFolder}/background/${weapon.color}.png`,
    };
  }

  // Single sprite weapons
  if (weapon.hasAnimations) {
    return {
      single: `${weapon.path}/${animFolder}/${weapon.color}.png`,
    };
  }

  return {
    single: `${weapon.path}/${weapon.color}.png`,
  };
}

export function getShieldPath(
  shield: ShieldAsset,
  gender: 'male' | 'female' = 'male'
): { foreground?: string; background?: string; single?: string } {
  const path = shield.path;

  // Crusader shield: /crusader/fg/male/crusader.png, /crusader/bg/crusader.png
  if (path.includes('crusader')) {
    return {
      foreground: `${path}/fg/${gender}/${shield.color}.png`,
      background: `${path}/bg/${shield.color}.png`,
    };
  }

  // Spartan shield: /spartan/fg/male/spartan.png, /spartan/bg/spartan.png
  if (path.includes('spartan')) {
    return {
      foreground: `${path}/fg/${gender}/${shield.color}.png`,
      background: `${path}/bg/${shield.color}.png`,
    };
  }

  // Scutum shield: /scutum/paint/fg/male/scutum.png, /scutum/paint/bg/scutum.png
  if (path.includes('scutum')) {
    return {
      foreground: `${path}/paint/fg/${gender}/scutum.png`,
      background: `${path}/paint/bg/scutum.png`,
    };
  }

  // Kite shield: /kite/male/kite_gray.png (single file, no layers)
  if (path.includes('kite')) {
    return {
      single: `${path}/${gender}/${shield.color}.png`,
    };
  }

  // Heater shield: /heater/pattern/universal/cross/color.png
  if (path.includes('heater') && shield.pattern) {
    return {
      single: `${path}/pattern/universal/${shield.pattern}/${shield.color}.png`,
    };
  }

  // Default: fg/bg layer structure
  if (shield.hasLayers) {
    return {
      foreground: `${path}/fg/${gender}/${shield.color}.png`,
      background: `${path}/bg/${shield.color}.png`,
    };
  }

  // Simple shields (gender-specific)
  return {
    single: `${path}/${gender}/${shield.color}.png`,
  };
}

export function getAllWeaponSets(): WeaponSetDefinition[] {
  return [
    ...PALADIN_WEAPONS,
    ...FIGHTER_WEAPONS,
    ...RANGER_WEAPONS,
    ...CLERIC_WEAPONS,
    ...MAGE_WEAPONS,
  ];
}

export function getWeaponSetById(id: string): WeaponSetDefinition | undefined {
  return getAllWeaponSets().find(set => set.id === id);
}

// ==================== EQUIPMENT PREVIEW PROPS HELPER ====================

export interface EquipmentPreviewWeaponProps {
  weapon?: string;
  weaponColor?: string;
  weaponType?: WeaponType;
  weaponPath?: string;
  shield?: string;
  shieldColor?: string;
  shieldPattern?: string;
  shieldPath?: string;
}

/**
 * Converts a weapon set definition to props compatible with EquipmentPreview
 */
export function getWeaponPropsFromSet(set: WeaponSetDefinition): EquipmentPreviewWeaponProps {
  const props: EquipmentPreviewWeaponProps = {};

  // Extract weapon type from path
  const extractType = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1];
  };

  // Main hand weapon
  props.weapon = extractType(set.mainHand.path);
  props.weaponColor = set.mainHand.color;
  props.weaponType = set.weaponType;
  props.weaponPath = set.mainHand.path;

  // Off hand (shield or dual-wield weapon)
  if (set.offHand && set.offHandType === OffHandType.SHIELD) {
    const shield = set.offHand as ShieldAsset;
    props.shield = extractType(shield.path);
    props.shieldColor = shield.color;
    props.shieldPath = shield.path;
    if (shield.pattern) {
      props.shieldPattern = shield.pattern;
    }
  }

  return props;
}

/**
 * Get weapon props for a character based on class and level
 */
export function getWeaponPropsForCharacter(
  characterClass: Class,
  level: number
): EquipmentPreviewWeaponProps {
  const set = getWeaponSetForClass(characterClass, level);
  return getWeaponPropsFromSet(set);
}

/**
 * Get all available weapon sets for a given class
 */
export function getWeaponSetsForClass(characterClass: Class): WeaponSetDefinition[] {
  return CLASS_WEAPON_SETS[characterClass] || [];
}

// ==================== DUAL WIELDING SUPPORT (Fighter) ====================

export interface DualWieldConfig {
  mainHand: WeaponAsset;
  offHand: WeaponAsset;
}

export function getFighterDualWieldConfig(level: number): DualWieldConfig | null {
  // Fighter can dual wield swords
  const weaponSet = getWeaponSetForClass(Class.FIGHTER, level);

  if (weaponSet.weaponType === WeaponType.SWORD && weaponSet.weaponSlot === WeaponSlot.MAIN_HAND) {
    return {
      mainHand: weaponSet.mainHand,
      offHand: weaponSet.mainHand, // Same sword in off-hand
    };
  }

  return null;
}

// ==================== FIGHTER SHIELD OPTION ====================

// Fighter can also use Paladin shields for Sword + Shield build
export function getFighterShieldOption(level: number): ShieldAsset | undefined {
  // Find the Paladin shield for the same level tier
  const paladinWeapon = getWeaponSetForClass(Class.PALADIN, level);
  if (paladinWeapon.offHand && paladinWeapon.offHandType === OffHandType.SHIELD) {
    return paladinWeapon.offHand as ShieldAsset;
  }
  return undefined;
}
