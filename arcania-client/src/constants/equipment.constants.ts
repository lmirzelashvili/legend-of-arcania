// ARCANIA - Equipment Constants
// Capes, Wings, and Class Equipment Restrictions

import { Class, EquipmentSlot, ItemType, ItemRarity } from '@/types/game.types';

// ==================== CLASS EQUIPMENT RESTRICTIONS ====================

// Which classes can equip capes and wings
export const CLASS_CAPE_ACCESS: Class[] = [Class.RANGER, Class.CLERIC, Class.MAGE];
export const CLASS_WINGS_ACCESS: Class[] = [Class.PALADIN, Class.FIGHTER];

export function canEquipCape(characterClass: Class): boolean {
  return CLASS_CAPE_ACCESS.includes(characterClass);
}

export function canEquipWings(characterClass: Class): boolean {
  return CLASS_WINGS_ACCESS.includes(characterClass);
}

// ==================== EQUIPMENT ITEM INTERFACE ====================

export interface EquipmentItemDefinition {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  requiredLevel: number;
  equipmentSlot: EquipmentSlot;
  allowedClasses: Class[];

  // Stats
  physicalDefense?: number;
  magicResistance?: number;
  strength?: number;
  agility?: number;
  intelligence?: number;
  vitality?: number;
  spirit?: number;
  // endurance removed — only 5 primary stats per game docs

  // Derived stats
  maxHp?: number;
  maxMana?: number;
  criticalChance?: number;
  dodgeChance?: number;
  hpRegen?: number;
  manaRegen?: number;
  attackSpeed?: number;

  // Visual
  spritePath: string;
  spriteColor: string;
}

// ==================== CAPE DEFINITIONS ====================
// For: Ranger, Cleric, Mage
// Focus: Magic Resistance, Spirit, Intelligence, Mana, Dodge

export const CAPE_ITEMS: EquipmentItemDefinition[] = [
  {
    id: 'cape_sentinel',
    name: 'Sentinel Cape',
    description: 'A simple but sturdy cape worn by those who stand watch over Arcania. Provides basic protection against the elements and minor magical threats.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 1,
    equipmentSlot: EquipmentSlot.CAPE,
    allowedClasses: CLASS_CAPE_ACCESS,
    magicResistance: 5,
    spirit: 2,
    dodgeChance: 1,
    spritePath: '/assets/sprites/cape/solid',
    spriteColor: 'brown',
  },
  {
    id: 'cape_honor',
    name: 'Honor Cape',
    description: 'A pristine white cape worn by those who uphold the ancient codes of honor. Its pure fabric symbolizes unwavering dedication to noble causes.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 20,
    equipmentSlot: EquipmentSlot.CAPE,
    allowedClasses: CLASS_CAPE_ACCESS,
    magicResistance: 12,
    spirit: 5,
    intelligence: 3,
    manaRegen: 1,
    dodgeChance: 2,
    spritePath: '/assets/sprites/cape/solid',
    spriteColor: 'white',
  },
  {
    id: 'cape_warlord',
    name: 'Warlord Cape',
    description: 'A blood-red cape that billows with the fury of countless battles. Worn by commanders who lead from the front lines, it strikes fear into enemies.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 40,
    equipmentSlot: EquipmentSlot.CAPE,
    allowedClasses: CLASS_CAPE_ACCESS,
    magicResistance: 22,
    agility: 8,
    spirit: 6,
    dodgeChance: 5,
    manaRegen: 2,
    spritePath: '/assets/sprites/cape/solid',
    spriteColor: 'red',
  },
  {
    id: 'cape_infernal',
    name: 'Infernal Cape',
    description: 'Forged in the depths of the Abyssal Forge, this dark cape emanates an aura of dread. Its shadowy threads absorb hostile magic like a void.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.PRESTIGE,
    requiredLevel: 60,
    equipmentSlot: EquipmentSlot.CAPE,
    allowedClasses: CLASS_CAPE_ACCESS,
    magicResistance: 35,
    intelligence: 12,
    spirit: 10,
    maxMana: 80,
    manaRegen: 4,
    dodgeChance: 6,
    spritePath: '/assets/sprites/cape/solid',
    spriteColor: 'maroon',
  },
  {
    id: 'cape_eternal',
    name: 'Eternal Cape',
    description: 'A cape woven from the essence of the void itself. Its darkness is absolute, absorbing all light and magic that dares approach its wearer.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.PRESTIGE,
    requiredLevel: 80,
    equipmentSlot: EquipmentSlot.CAPE,
    allowedClasses: CLASS_CAPE_ACCESS,
    magicResistance: 50,
    intelligence: 18,
    spirit: 15,
    agility: 10,
    maxMana: 150,
    manaRegen: 6,
    dodgeChance: 8,
    spritePath: '/assets/sprites/cape/solid',
    spriteColor: 'black',
  },
];

// ==================== WING DEFINITIONS ====================
// For: Paladin, Fighter
// Focus: Physical Defense, Vitality, Strength, HP, Critical

export const WING_ITEMS: EquipmentItemDefinition[] = [
  {
    id: 'wings_sentinel',
    name: 'Sentinel Wings',
    description: 'Ethereal wings granted to aspiring warriors who take their first oath to protect the realm. A symbol of vigilance and duty.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 1,
    equipmentSlot: EquipmentSlot.WINGS,
    allowedClasses: CLASS_WINGS_ACCESS,
    physicalDefense: 5,
    vitality: 2,
    maxHp: 20,
    spritePath: '/assets/sprites/wings/bat',
    spriteColor: '',
  },
  {
    id: 'wings_guardian',
    name: 'Guardian Wings',
    description: 'Blessed wings bestowed upon protectors of the realm. Their divine shimmer inspires allies and intimidates foes on the battlefield.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 20,
    equipmentSlot: EquipmentSlot.WINGS,
    allowedClasses: CLASS_WINGS_ACCESS,
    physicalDefense: 12,
    vitality: 5,
    strength: 3,
    maxHp: 60,
    hpRegen: 1,
    spritePath: '/assets/sprites/wings/feathered',
    spriteColor: '',
  },
  {
    id: 'wings_draconic',
    name: 'Draconic Wings',
    description: 'Infused with the essence of ancient dragons, these mighty wings radiate primal power. Their scales are harder than the finest steel.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 40,
    equipmentSlot: EquipmentSlot.WINGS,
    allowedClasses: CLASS_WINGS_ACCESS,
    physicalDefense: 22,
    strength: 8,
    vitality: 6,
    maxHp: 120,
    criticalChance: 3,
    hpRegen: 2,
    spritePath: '/assets/sprites/wings/bat',
    spriteColor: 'red',
  },
  {
    id: 'wings_nightfall',
    name: 'Nightfall Wings',
    description: 'Born from the void between dusk and dawn, these shadowy wings grant their bearer power over darkness itself. Fear follows in their wake.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.PRESTIGE,
    requiredLevel: 60,
    equipmentSlot: EquipmentSlot.WINGS,
    allowedClasses: CLASS_WINGS_ACCESS,
    physicalDefense: 35,
    strength: 12,
    vitality: 10,
    // endurance removed
    maxHp: 200,
    criticalChance: 5,
    hpRegen: 4,
    attackSpeed: 5,
    spritePath: '/assets/sprites/wings/bat',
    spriteColor: 'black',
  },
  {
    id: 'wings_celestial',
    name: 'Celestial Wings',
    description: 'The ultimate symbol of martial transcendence. These divine wings are said to be fragments of the gods themselves, granting their bearer power beyond mortal limits.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.PRESTIGE,
    requiredLevel: 80,
    equipmentSlot: EquipmentSlot.WINGS,
    allowedClasses: CLASS_WINGS_ACCESS,
    physicalDefense: 50,
    strength: 18,
    vitality: 15,
    // endurance removed
    agility: 10,
    maxHp: 350,
    criticalChance: 8,
    hpRegen: 6,
    attackSpeed: 8,
    spritePath: '/assets/sprites/wings/feathered',
    spriteColor: 'gold',
  },
];

// ==================== PENDANT DEFINITIONS ====================
// For: All Classes
// Focus: Magic Resistance, Intelligence, Spirit, Mana
// Visual: Necklace on neck (neck/necklace) - types: simple, beaded_small, chain, beaded_large

export const PENDANT_ITEMS: EquipmentItemDefinition[] = [
  {
    id: 'pendant_vharun',
    name: 'Pendant of Vharun',
    description: 'A pendant inscribed with the sigil of Vharun. Grants cunning and resilience.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 1,
    equipmentSlot: EquipmentSlot.PENDANT,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    magicResistance: 3,
    spirit: 1,
    spritePath: '/assets/sprites/neck/necklace/simple',
    spriteColor: '',
  },
  {
    id: 'pendant_saelistra',
    name: 'Pendant of Saelistra',
    description: 'A pendant imbued with the grace of Saelistra. Provides strength and endurance.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 11,
    equipmentSlot: EquipmentSlot.PENDANT,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    magicResistance: 8,
    spirit: 3,
    intelligence: 2,
    maxMana: 20,
    spritePath: '/assets/sprites/neck/necklace/beaded_small',
    spriteColor: '',
  },
  {
    id: 'pendant_kharagul',
    name: 'Pendant of Kharagul',
    description: 'A pendant forged with the fury of Kharagul. Ancient power flows through it.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 26,
    equipmentSlot: EquipmentSlot.PENDANT,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    magicResistance: 15,
    spirit: 5,
    intelligence: 4,
    maxMana: 50,
    manaRegen: 1,
    spritePath: '/assets/sprites/neck/necklace/chain',
    spriteColor: '',
  },
  {
    id: 'pendant_morgathis',
    name: 'Pendant of Morgathis',
    description: 'A pendant blessed by the shadow of Morgathis. Its dark power empowers the wearer.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 41,
    equipmentSlot: EquipmentSlot.PENDANT,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    magicResistance: 25,
    spirit: 8,
    intelligence: 7,
    maxMana: 100,
    manaRegen: 3,
    spritePath: '/assets/sprites/neck/necklace/beaded_large',
    spriteColor: '',
  },
  {
    id: 'pendant_cassian',
    name: 'Pendant of Cassian',
    description: 'A legendary pendant containing the essence of Cassian. Its power is beyond mortal comprehension.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 56,
    equipmentSlot: EquipmentSlot.PENDANT,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    magicResistance: 40,
    spirit: 12,
    intelligence: 10,
    maxMana: 180,
    manaRegen: 5,
    spritePath: '/assets/sprites/neck/necklace/beaded_large',
    spriteColor: '',
  },
];

// ==================== RING DEFINITIONS ====================
// For: All Classes
// Focus: Varied stats - can be physical or magical
// Visual: Ring on hand (arms/hands/ring/stud) - colors: blue, green, orange, purple, red, yellow

export const RING_ITEMS: EquipmentItemDefinition[] = [
  {
    id: 'ring_vharun',
    name: 'Ring of Vharun',
    description: 'A ring inscribed with the mark of Vharun. Grants swiftness and resilience.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 1,
    equipmentSlot: EquipmentSlot.RING_1,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    physicalDefense: 2,
    vitality: 1,
    spritePath: '/assets/sprites/arms/hands/ring/stud',
    spriteColor: 'blue',
  },
  {
    id: 'ring_saelistra',
    name: 'Ring of Saelistra',
    description: 'A ring imbued with the light of Saelistra. Channels unyielding strength.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 11,
    equipmentSlot: EquipmentSlot.RING_1,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    physicalDefense: 5,
    magicResistance: 5,
    vitality: 2,
    maxHp: 30,
    spritePath: '/assets/sprites/arms/hands/ring/stud',
    spriteColor: 'green',
  },
  {
    id: 'ring_kharagul',
    name: 'Ring of Kharagul',
    description: 'A ring forged in the fires of Kharagul. Shimmers with ancient power.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 26,
    equipmentSlot: EquipmentSlot.RING_1,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    strength: 4,
    agility: 4,
    criticalChance: 2,
    attackSpeed: 3,
    spritePath: '/assets/sprites/arms/hands/ring/stud',
    spriteColor: 'red',
  },
  {
    id: 'ring_morgathis',
    name: 'Ring of Morgathis',
    description: 'A ring touched by the shadow of Morgathis. Dark energy flows through its wearer.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 41,
    equipmentSlot: EquipmentSlot.RING_1,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    intelligence: 6,
    spirit: 6,
    maxMana: 60,
    manaRegen: 2,
    spritePath: '/assets/sprites/arms/hands/ring/stud',
    spriteColor: 'orange',
  },
  {
    id: 'ring_cassian',
    name: 'Ring of Cassian',
    description: 'A ring containing the essence of Cassian. Its power rivals that of the gods themselves.',
    type: ItemType.ACCESSORY,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 56,
    equipmentSlot: EquipmentSlot.RING_1,
    allowedClasses: [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE],
    strength: 8,
    agility: 8,
    intelligence: 8,
    vitality: 8,
    maxHp: 100,
    maxMana: 100,
    criticalChance: 5,
    spritePath: '/assets/sprites/arms/hands/ring/stud',
    spriteColor: 'purple',
  },
];

// ==================== SHIELD DEFINITIONS ====================
// For: Paladin, Fighter
// Focus: Physical Defense, Vitality, HP, Block Chance
// Shields go in OFF_HAND slot

export const SHIELD_ITEMS: EquipmentItemDefinition[] = [
  {
    id: 'shield_iron',
    name: 'Iron Shield',
    description: 'A sturdy round shield forged from iron. The mark of a warrior beginning their journey.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 1,
    equipmentSlot: EquipmentSlot.OFF_HAND,
    allowedClasses: [Class.PALADIN, Class.FIGHTER],
    physicalDefense: 8,
    vitality: 2,
    maxHp: 15,
    spritePath: '/assets/sprites/shield/round_universal',
    spriteColor: 'round_black',
  },
  {
    id: 'shield_bastion',
    name: 'Bastion Shield',
    description: 'A kite-shaped shield favored by guardians of the realm. Its design deflects blows with ease.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 20,
    equipmentSlot: EquipmentSlot.OFF_HAND,
    allowedClasses: [Class.PALADIN, Class.FIGHTER],
    physicalDefense: 18,
    magicResistance: 8,
    vitality: 4,
    maxHp: 40,
    spritePath: '/assets/sprites/shield/kite',
    spriteColor: 'kite_gray_blue',
  },
  {
    id: 'shield_golden_bulwark',
    name: 'Golden Bulwark',
    description: 'A magnificent heater shield gilded with gold. Symbol of nobility and martial excellence.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.REGULAR,
    requiredLevel: 40,
    equipmentSlot: EquipmentSlot.OFF_HAND,
    allowedClasses: [Class.PALADIN, Class.FIGHTER],
    physicalDefense: 32,
    magicResistance: 15,
    vitality: 6,
    strength: 4,
    maxHp: 80,
    spritePath: '/assets/sprites/shield/heater/original/paint',
    spriteColor: 'gold',
  },
  {
    id: 'shield_glorious',
    name: 'Glorious Shield',
    description: 'A plus-shaped shield blessed by the divine. Its holy aura protects against both physical and magical harm.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.PRESTIGE,
    requiredLevel: 60,
    equipmentSlot: EquipmentSlot.OFF_HAND,
    allowedClasses: [Class.PALADIN, Class.FIGHTER],
    physicalDefense: 48,
    magicResistance: 25,
    vitality: 10,
    strength: 6,
    spirit: 5,
    maxHp: 150,
    hpRegen: 2,
    spritePath: '/assets/sprites/shield/plus',
    spriteColor: 'plus',
  },
  {
    id: 'shield_titans_aegis',
    name: "Titan's Aegis",
    description: 'A legendary spartan shield said to have been wielded by titans themselves. Its defensive power is unmatched.',
    type: ItemType.ARMOR,
    rarity: ItemRarity.PRESTIGE,
    requiredLevel: 80,
    equipmentSlot: EquipmentSlot.OFF_HAND,
    allowedClasses: [Class.PALADIN, Class.FIGHTER],
    physicalDefense: 70,
    magicResistance: 40,
    vitality: 15,
    strength: 10,
    // endurance removed
    maxHp: 250,
    hpRegen: 4,
    spritePath: '/assets/sprites/shield/spartan',
    spriteColor: 'spartan',
  },
];

// ==================== HELPER FUNCTIONS ====================

export function getCapeByLevel(level: number): EquipmentItemDefinition {
  const qualified = CAPE_ITEMS.filter(cape => cape.requiredLevel <= level);
  return qualified[qualified.length - 1] || CAPE_ITEMS[0];
}

export function getWingsByLevel(level: number): EquipmentItemDefinition {
  const qualified = WING_ITEMS.filter(wings => wings.requiredLevel <= level);
  return qualified[qualified.length - 1] || WING_ITEMS[0];
}

export function getCapeById(id: string): EquipmentItemDefinition | undefined {
  return CAPE_ITEMS.find(cape => cape.id === id);
}

export function getWingsById(id: string): EquipmentItemDefinition | undefined {
  return WING_ITEMS.find(wings => wings.id === id);
}

export function getAllCapes(): EquipmentItemDefinition[] {
  return CAPE_ITEMS;
}

export function getAllWings(): EquipmentItemDefinition[] {
  return WING_ITEMS;
}

export function getPendantByLevel(level: number): EquipmentItemDefinition {
  const qualified = PENDANT_ITEMS.filter(pendant => pendant.requiredLevel <= level);
  return qualified[qualified.length - 1] || PENDANT_ITEMS[0];
}

export function getRingByLevel(level: number): EquipmentItemDefinition {
  const qualified = RING_ITEMS.filter(ring => ring.requiredLevel <= level);
  return qualified[qualified.length - 1] || RING_ITEMS[0];
}

export function getPendantById(id: string): EquipmentItemDefinition | undefined {
  return PENDANT_ITEMS.find(pendant => pendant.id === id);
}

export function getRingById(id: string): EquipmentItemDefinition | undefined {
  return RING_ITEMS.find(ring => ring.id === id);
}

export function getAllPendants(): EquipmentItemDefinition[] {
  return PENDANT_ITEMS;
}

export function getAllRings(): EquipmentItemDefinition[] {
  return RING_ITEMS;
}

export function getShieldByLevel(level: number): EquipmentItemDefinition {
  const qualified = SHIELD_ITEMS.filter(shield => shield.requiredLevel <= level);
  return qualified[qualified.length - 1] || SHIELD_ITEMS[0];
}

export function getShieldById(id: string): EquipmentItemDefinition | undefined {
  return SHIELD_ITEMS.find(shield => shield.id === id);
}

export function getAllShields(): EquipmentItemDefinition[] {
  return SHIELD_ITEMS;
}

// ==================== EQUIPMENT SLOT RESTRICTIONS BY CLASS ====================

export const CLASS_OPTIONAL_SLOTS: Record<Class, EquipmentSlot[]> = {
  [Class.PALADIN]: [EquipmentSlot.WINGS],
  [Class.FIGHTER]: [EquipmentSlot.WINGS],
  [Class.RANGER]: [EquipmentSlot.CAPE],
  [Class.CLERIC]: [EquipmentSlot.CAPE],
  [Class.MAGE]: [EquipmentSlot.CAPE],
};

export function canClassEquipSlot(characterClass: Class, slot: EquipmentSlot): boolean {
  // Base slots all classes can use
  const baseSlots = [
    EquipmentSlot.WEAPON,
    EquipmentSlot.OFF_HAND,
    EquipmentSlot.HEAD,
    EquipmentSlot.CHEST,
    EquipmentSlot.LEGS,
    EquipmentSlot.BOOTS,
    EquipmentSlot.GLOVES,
    EquipmentSlot.PENDANT,
    EquipmentSlot.RING_1,
    EquipmentSlot.RING_2,
  ];

  if (baseSlots.includes(slot)) {
    return true;
  }

  // Cape and Wings are class-restricted
  if (slot === EquipmentSlot.CAPE) {
    return canEquipCape(characterClass);
  }

  if (slot === EquipmentSlot.WINGS) {
    return canEquipWings(characterClass);
  }

  return false;
}
