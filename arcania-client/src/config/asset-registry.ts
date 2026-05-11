/**
 * Centralized Asset Registry
 * Single source of truth for item icons and paperdoll sprite properties.
 *
 * Icons  → displayed in inventory, marketplace, vault, tooltips
 * Sprites → displayed on the layered paperdoll character preview
 */

import { EquipmentSlot, ItemSpriteInfo } from '@/types/game.types';
import {
  PALADIN_ARMOR_SETS,
  FIGHTER_ARMOR_SETS,
  RANGER_ARMOR_SETS,
  CLERIC_ARMOR_SETS,
  MAGE_ARMOR_SETS,
  ArmorSetDefinition,
  ArmorSlot,
  getArmorPropsFromSet,
  extractSpriteInfoForSlot,
} from '@/constants/armor.constants';
import {
  CAPE_ITEMS,
  WING_ITEMS,
  PENDANT_ITEMS,
  RING_ITEMS,
  SHIELD_ITEMS,
} from '@/constants/equipment.constants';
import {
  PALADIN_WEAPONS,
  FIGHTER_WEAPONS,
  RANGER_WEAPONS,
  CLERIC_WEAPONS,
  MAGE_WEAPONS,
  WeaponSetDefinition,
  getWeaponPropsFromSet,
  OffHandType,
} from '@/constants/weapon.constants';
// ==================== INTERFACES ====================

export type { ItemSpriteInfo } from '@/types/game.types';

export interface AssetRegistryEntry {
  icon: string;
  sprite: ItemSpriteInfo;
  equipmentSlot: EquipmentSlot;
}

// ==================== PLACEHOLDER ICONS ====================

const SLOT_ICONS: Record<string, string> = {
  head: '/assets/icons/items/armor/helm.svg',
  chest: '/assets/icons/items/armor/chestplate.svg',
  legs: '/assets/icons/items/armor/leggings.svg',
  boots: '/assets/icons/items/armor/boots.svg',
  gloves: '/assets/icons/items/armor/gauntlets.svg',
  weapon: '/assets/icons/items/weapons/sword.svg',
  shield: '/assets/icons/items/shields/shield-round.svg',
  cape: '/assets/icons/items/accessories/sentinel_cape.png',
  wings: '/assets/icons/items/accessories/sentinel_wings.png',
  ring: '/assets/icons/items/accessories/ring_vharun.png',
  neck: '/assets/icons/items/accessories/pendant_vharun.png',
  consumable_hp: '/assets/icons/items/consumables/health_elixir_sm.png',
  consumable_mana: '/assets/icons/items/consumables/mana_elixir_sm.png',
  consumable_power: '/assets/icons/items/consumables/power_elixir_sm.png',
  scroll_teleport: '/assets/icons/items/consumables/scroll_of_meridia.png',
  scroll_resurrect: '/assets/icons/items/consumables/scroll_of_ressurection.png',
  scroll_buff: '/assets/icons/items/consumables/scroll_of_empowerement.png',
  material: '/assets/icons/items/materials/hand_of_blacksmith.png',
  crystal: '/assets/icons/items/crystals/crystal_of_spirit.png',
  gem: '/assets/icons/items/gems/gem_of_anguish.png',
  unknown: '/assets/icons/items/armor/chestplate.svg',
};

// ==================== NAME GENERATION (matches seed-items.ts) ====================

const SLOT_NAMES: Record<ArmorSlot, string> = {
  [ArmorSlot.HEAD]: 'Helm',
  [ArmorSlot.CHEST]: 'Chestplate',
  [ArmorSlot.LEGS]: 'Leggings',
  [ArmorSlot.BOOTS]: 'Boots',
  [ArmorSlot.GLOVES]: 'Gauntlets',
  [ArmorSlot.BRACERS]: 'Bracers',
  [ArmorSlot.SHOULDERS]: 'Pauldrons',
  [ArmorSlot.CAPE]: 'Cape',
};

const ARMOR_SLOT_TO_EQUIPMENT_SLOT: Partial<Record<ArmorSlot, EquipmentSlot>> = {
  [ArmorSlot.HEAD]: EquipmentSlot.HEAD,
  [ArmorSlot.CHEST]: EquipmentSlot.CHEST,
  [ArmorSlot.LEGS]: EquipmentSlot.LEGS,
  [ArmorSlot.BOOTS]: EquipmentSlot.BOOTS,
  [ArmorSlot.GLOVES]: EquipmentSlot.GLOVES,
  [ArmorSlot.BRACERS]: EquipmentSlot.GLOVES, // Bracers map to gloves slot now
  [ArmorSlot.SHOULDERS]: EquipmentSlot.CHEST, // Shoulders map to chest slot now
  [ArmorSlot.CAPE]: EquipmentSlot.CAPE,
};

const ARMOR_SLOT_TO_ICON_KEY: Record<ArmorSlot, string> = {
  [ArmorSlot.HEAD]: 'head',
  [ArmorSlot.CHEST]: 'chest',
  [ArmorSlot.LEGS]: 'legs',
  [ArmorSlot.BOOTS]: 'boots',
  [ArmorSlot.GLOVES]: 'gloves',
  [ArmorSlot.BRACERS]: 'gloves',
  [ArmorSlot.SHOULDERS]: 'chest',
  [ArmorSlot.CAPE]: 'cape',
};

// ==================== REGISTRY BUILDERS ====================

function buildArmorEntries(): Record<string, AssetRegistryEntry> {
  const entries: Record<string, AssetRegistryEntry> = {};

  const classSets: { sets: ArmorSetDefinition[] }[] = [
    { sets: PALADIN_ARMOR_SETS },
    { sets: FIGHTER_ARMOR_SETS },
    { sets: RANGER_ARMOR_SETS },
    { sets: CLERIC_ARMOR_SETS },
    { sets: MAGE_ARMOR_SETS },
  ];

  classSets.forEach(({ sets }) => {
    sets.forEach((set) => {
      const armorProps = getArmorPropsFromSet(set);

      Object.entries(set.pieces).forEach(([slotKey]) => {
        const slot = slotKey as ArmorSlot;
        const itemName = `${set.displayName} ${SLOT_NAMES[slot]}`;
        const iconKey = ARMOR_SLOT_TO_ICON_KEY[slot];

        const eqSlot = ARMOR_SLOT_TO_EQUIPMENT_SLOT[slot];
        if (!eqSlot) return; // Skip unmapped slots

        entries[itemName] = {
          icon: SLOT_ICONS[iconKey] || SLOT_ICONS.unknown,
          sprite: extractSpriteInfoForSlot(armorProps, slot),
          equipmentSlot: eqSlot,
        };
      });
    });
  });

  return entries;
}

function buildWeaponEntries(): Record<string, AssetRegistryEntry> {
  const entries: Record<string, AssetRegistryEntry> = {};

  const allWeapons: WeaponSetDefinition[] = [
    ...PALADIN_WEAPONS,
    ...FIGHTER_WEAPONS,
    ...RANGER_WEAPONS,
    ...CLERIC_WEAPONS,
    ...MAGE_WEAPONS,
  ];

  allWeapons.forEach((weaponSet) => {
    const weaponProps = getWeaponPropsFromSet(weaponSet);

    // Main hand weapon
    entries[weaponSet.displayName] = {
      icon: SLOT_ICONS.weapon,
      sprite: {
        weaponType: weaponProps.weapon,
        weaponColor: weaponProps.weaponColor,
      },
      equipmentSlot: EquipmentSlot.WEAPON,
    };

    // Off-hand shield (if applicable)
    if (weaponSet.offHand && weaponSet.offHandType === OffHandType.SHIELD) {
      // Shield is associated with the weapon set, not a separate item here
      // Shields from equipment.constants are handled separately below
    }
  });

  return entries;
}

function buildEquipmentEntries(): Record<string, AssetRegistryEntry> {
  const entries: Record<string, AssetRegistryEntry> = {};

  // Capes
  const CAPE_ICON_FILES = ['sentinel_cape.png', 'honor_cape.png', 'warlord_cape.png', 'infernal_cape.png', 'eternal_cape.png'];
  CAPE_ITEMS.forEach((cape, i) => {
    entries[cape.name] = {
      icon: `/assets/icons/items/accessories/${CAPE_ICON_FILES[i]}`,
      sprite: { capeType: 'solid', capeColor: cape.spriteColor },
      equipmentSlot: EquipmentSlot.CAPE,
    };
  });

  // Wings
  const WING_ICON_FILES = ['sentinel_wings.png', 'guardian_wings.png', 'draconic_wings.png', 'nightfall_wings.png', 'celestial_wings.png'];
  WING_ITEMS.forEach((wing, i) => {
    const wingType = wing.spritePath.split('/').pop() || '';
    entries[wing.name] = {
      icon: `/assets/icons/items/accessories/${WING_ICON_FILES[i]}`,
      sprite: { wingsType: wingType, wingsColor: wing.spriteColor },
      equipmentSlot: EquipmentSlot.WINGS,
    };
  });

  // Shields
  SHIELD_ITEMS.forEach((shield) => {
    // Extract shield type from spritePath
    const pathParts = shield.spritePath.split('/');
    const shieldType = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';

    // Determine EquipmentPreview-compatible shield type and variant
    let spriteShieldType = shieldType;
    let spriteShieldVariant = shield.spriteColor;

    if (shield.spritePath.includes('round_universal')) {
      spriteShieldType = 'round_universal';
      spriteShieldVariant = shield.spriteColor;
    } else if (shield.spritePath.includes('/kite')) {
      spriteShieldType = 'kite';
      spriteShieldVariant = shield.spriteColor;
    } else if (shield.spritePath.includes('/heater')) {
      spriteShieldType = 'heater';
    } else if (shield.spritePath.includes('/plus')) {
      spriteShieldType = 'plus';
    } else if (shield.spritePath.includes('/spartan')) {
      spriteShieldType = 'spartan';
    } else if (shield.spritePath.includes('/crusader')) {
      spriteShieldType = 'crusader';
    }

    entries[shield.name] = {
      icon: SLOT_ICONS.shield,
      sprite: { shieldType: spriteShieldType, shieldVariant: spriteShieldVariant },
      equipmentSlot: EquipmentSlot.OFF_HAND,
    };
  });

  // Pendants
  PENDANT_ITEMS.forEach((pendant) => {
    entries[pendant.name] = {
      icon: SLOT_ICONS.neck,
      sprite: {},
      equipmentSlot: EquipmentSlot.PENDANT,
    };
  });

  // Rings
  RING_ITEMS.forEach((ring) => {
    entries[ring.name] = {
      icon: SLOT_ICONS.ring,
      sprite: {},
      equipmentSlot: EquipmentSlot.RING_1,
    };
  });

  return entries;
}

function buildConsumableEntries(): Record<string, AssetRegistryEntry> {
  return {
    // Current elixir names (match server + item-templates.ts)
    'Elixir of Life (SM)': { icon: '/assets/icons/items/consumables/health_elixir_sm.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Life (MD)': { icon: '/assets/icons/items/consumables/health_elixir_md.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Life (LG)': { icon: '/assets/icons/items/consumables/health_elixir_lg.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Life (XL)': { icon: '/assets/icons/items/consumables/health_elixir_xl.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Mana (SM)': { icon: '/assets/icons/items/consumables/mana_elixir_sm.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Mana (MD)': { icon: '/assets/icons/items/consumables/mana_elixir_md.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Mana (LG)': { icon: '/assets/icons/items/consumables/mana_elixir_lg.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Mana (XL)': { icon: '/assets/icons/items/consumables/mana_elixir_xl.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Power (SM)': { icon: '/assets/icons/items/consumables/power_elixir_sm.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Power (MD)': { icon: '/assets/icons/items/consumables/power_elixir_md.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Power (LG)': { icon: '/assets/icons/items/consumables/power_elixir_lg.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Elixir of Power (XL)': { icon: '/assets/icons/items/consumables/power_elixir_xl.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    // Scrolls
    'Scroll of Resurrection': { icon: '/assets/icons/items/consumables/scroll_of_ressurection.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Empowerment': { icon: '/assets/icons/items/consumables/scroll_of_empowerement.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Meridia': { icon: '/assets/icons/items/consumables/scroll_of_meridia.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Lumeria': { icon: '/assets/icons/items/consumables/scroll_of_lumeria.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Lythora': { icon: '/assets/icons/items/consumables/scroll_of_lythora.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Redmire': { icon: '/assets/icons/items/consumables/scroll_of_redmire.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Valoryn': { icon: '/assets/icons/items/consumables/scroll_of_valoryn.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Dreadmar': { icon: '/assets/icons/items/consumables/scroll_of_dreadmar.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Whispers': { icon: '/assets/icons/items/consumables/scroll_of_whispers.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Stonegrave': { icon: '/assets/icons/items/consumables/scroll_of_stonegrave.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Eclipse': { icon: '/assets/icons/items/consumables/scroll_of_eclipse.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of the Fallen': { icon: '/assets/icons/items/consumables/scroll_of_fallen.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Scroll of Atlas': { icon: '/assets/icons/items/consumables/scroll_of_atlas.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    // Legacy potion names (existing vault/marketplace items)
    'Small HP Potion': { icon: SLOT_ICONS.consumable_hp, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Medium HP Potion': { icon: SLOT_ICONS.consumable_hp, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Large HP Potion': { icon: SLOT_ICONS.consumable_hp, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Greater HP Potion': { icon: SLOT_ICONS.consumable_hp, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Small Mana Potion': { icon: SLOT_ICONS.consumable_mana, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Medium Mana Potion': { icon: SLOT_ICONS.consumable_mana, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Large Mana Potion': { icon: SLOT_ICONS.consumable_mana, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Greater Mana Potion': { icon: SLOT_ICONS.consumable_mana, sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
  };
}

function buildMaterialEntries(): Record<string, AssetRegistryEntry> {
  return {
    // Materials
    'Feather of Roc': { icon: '/assets/icons/items/materials/feather_of_roc.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Thread of Silkworm': { icon: '/assets/icons/items/materials/thread_of_silkworm.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Finger of Titan': { icon: '/assets/icons/items/materials/finger_of_titan.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Fang of Griffin': { icon: '/assets/icons/items/materials/fang_of_griffin.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Hand of Blacksmith': { icon: '/assets/icons/items/materials/hand_of_blacksmith.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Hand of Forgemaster': { icon: '/assets/icons/items/materials/hand_of_forgemaster.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    // Crystals
    'Crystal of Spirit': { icon: '/assets/icons/items/crystals/crystal_of_spirit.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Crystal of Dominion': { icon: '/assets/icons/items/crystals/crystal_of_dominion.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Crystal of Creation': { icon: '/assets/icons/items/crystals/crystal_of_creation.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    // Gems
    'Gem of Anguish': { icon: '/assets/icons/items/gems/gem_of_anguish.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Gem of Void': { icon: '/assets/icons/items/gems/gem_of_void.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
    'Gem of Light': { icon: '/assets/icons/items/gems/gem_of_light.png', sprite: {}, equipmentSlot: EquipmentSlot.WEAPON },
  };
}

/**
 * Build legacy name aliases so old ITEM_SPRITE_MAP names still resolve.
 * Maps the old naming convention to the new seed-items naming convention.
 */
function buildLegacyAliases(): Record<string, AssetRegistryEntry> {
  const aliases: Record<string, AssetRegistryEntry> = {};

  // Paladin old names → new names
  const paladinLegacyMap: [string, string][] = [
    // Black Iron set (old: Recruit, new: Black Iron)
    ['Recruit Helmet', 'Black Iron Helm'],
    ['Prestige Recruit Helmet', 'Black Iron Helm'],
    ['Recruit Chestplate', 'Black Iron Chestplate'],
    ['Prestige Recruit Chestplate', 'Black Iron Chestplate'],
    ['Recruit Leggings', 'Black Iron Leggings'],
    ['Prestige Recruit Leggings', 'Black Iron Leggings'],
    ['Recruit Gauntlets', 'Black Iron Gauntlets'],
    ['Prestige Recruit Gauntlets', 'Black Iron Gauntlets'],
    ['Recruit Boots', 'Black Iron Boots'],
    ['Prestige Recruit Boots', 'Black Iron Boots'],
    // Silver Guardian set (old: Knight, new: Silver Guardian)
    ['Knight Helmet', 'Silver Guardian Helm'],
    ['Prestige Knight Helmet', 'Silver Guardian Helm'],
    ['Knight Chestplate', 'Silver Guardian Chestplate'],
    ['Prestige Knight Chestplate', 'Silver Guardian Chestplate'],
    ['Knight Leggings', 'Silver Guardian Leggings'],
    ['Prestige Knight Leggings', 'Silver Guardian Leggings'],
    ['Knight Gauntlets', 'Silver Guardian Gauntlets'],
    ['Prestige Knight Gauntlets', 'Silver Guardian Gauntlets'],
    ['Knight Boots', 'Silver Guardian Boots'],
    ['Prestige Knight Boots', 'Silver Guardian Boots'],
    // Immortal Plate set (old: Crusader, new: Immortal Plate)
    ['Crusader Helmet', 'Immortal Plate Helm'],
    ['Prestige Crusader Helmet', 'Immortal Plate Helm'],
    ['Crusader Chestplate', 'Immortal Plate Chestplate'],
    ['Prestige Crusader Chestplate', 'Immortal Plate Chestplate'],
    ['Crusader Leggings', 'Immortal Plate Leggings'],
    ['Prestige Crusader Leggings', 'Immortal Plate Leggings'],
    ['Crusader Gauntlets', 'Immortal Plate Gauntlets'],
    ['Prestige Crusader Gauntlets', 'Immortal Plate Gauntlets'],
    ['Crusader Boots', 'Immortal Plate Boots'],
    ['Prestige Crusader Boots', 'Immortal Plate Boots'],
    // Great Crusader set (old: Guardian, new: Great Crusader)
    ['Guardian Helmet', 'Great Crusader Helm'],
    ['Prestige Guardian Helmet', 'Great Crusader Helm'],
    ['Guardian Chestplate', 'Great Crusader Chestplate'],
    ['Prestige Guardian Chestplate', 'Great Crusader Chestplate'],
    ['Guardian Leggings', 'Great Crusader Leggings'],
    ['Prestige Guardian Leggings', 'Great Crusader Leggings'],
    ['Guardian Gauntlets', 'Great Crusader Gauntlets'],
    ['Prestige Guardian Gauntlets', 'Great Crusader Gauntlets'],
    ['Guardian Boots', 'Great Crusader Boots'],
    ['Prestige Guardian Boots', 'Great Crusader Boots'],
    // Eternal Titan set (old: Divine, new: Eternal Titan)
    ['Divine Helmet', 'Eternal Titan Helm'],
    ['Prestige Divine Helmet', 'Eternal Titan Helm'],
    ['Divine Chestplate', 'Eternal Titan Chestplate'],
    ['Prestige Divine Chestplate', 'Eternal Titan Chestplate'],
    ['Divine Leggings', 'Eternal Titan Leggings'],
    ['Prestige Divine Leggings', 'Eternal Titan Leggings'],
    ['Divine Gauntlets', 'Eternal Titan Gauntlets'],
    ['Prestige Divine Gauntlets', 'Eternal Titan Gauntlets'],
    ['Divine Boots', 'Eternal Titan Boots'],
    ['Prestige Divine Boots', 'Eternal Titan Boots'],
  ];

  // Fighter old names → new names
  const fighterLegacyMap: [string, string][] = [
    ['Trainee Helmet', 'Mercenary Helm'],
    ['Prestige Trainee Helmet', 'Mercenary Helm'],
    ['Trainee Chestplate', 'Mercenary Chestplate'],
    ['Prestige Trainee Chestplate', 'Mercenary Chestplate'],
    ['Trainee Leggings', 'Mercenary Leggings'],
    ['Prestige Trainee Leggings', 'Mercenary Leggings'],
    ['Trainee Gauntlets', 'Mercenary Gauntlets'],
    ['Prestige Trainee Gauntlets', 'Mercenary Gauntlets'],
    ['Trainee Boots', 'Mercenary Boots'],
    ['Prestige Trainee Boots', 'Mercenary Boots'],
    ['Warrior Helmet', 'Gladiator Helm'],
    ['Prestige Warrior Helmet', 'Gladiator Helm'],
    ['Warrior Chestplate', 'Gladiator Chestplate'],
    ['Prestige Warrior Chestplate', 'Gladiator Chestplate'],
    ['Warrior Leggings', 'Gladiator Leggings'],
    ['Prestige Warrior Leggings', 'Gladiator Leggings'],
    ['Warrior Gauntlets', 'Gladiator Gauntlets'],
    ['Prestige Warrior Gauntlets', 'Gladiator Gauntlets'],
    ['Warrior Boots', 'Gladiator Boots'],
    ['Prestige Warrior Boots', 'Gladiator Boots'],
    ['Berserker Helmet', 'Noble Knight Helm'],
    ['Prestige Berserker Helmet', 'Noble Knight Helm'],
    ['Berserker Chestplate', 'Noble Knight Chestplate'],
    ['Prestige Berserker Chestplate', 'Noble Knight Chestplate'],
    ['Berserker Leggings', 'Noble Knight Leggings'],
    ['Prestige Berserker Leggings', 'Noble Knight Leggings'],
    ['Berserker Gauntlets', 'Noble Knight Gauntlets'],
    ['Prestige Berserker Gauntlets', 'Noble Knight Gauntlets'],
    ['Berserker Boots', 'Noble Knight Boots'],
    ['Prestige Berserker Boots', 'Noble Knight Boots'],
    ['Champion Helmet', 'Berserker Helm'],
    ['Prestige Champion Helmet', 'Berserker Helm'],
    ['Champion Chestplate', 'Berserker Chestplate'],
    ['Prestige Champion Chestplate', 'Berserker Chestplate'],
    ['Champion Leggings', 'Berserker Leggings'],
    ['Prestige Champion Leggings', 'Berserker Leggings'],
    ['Champion Gauntlets', 'Berserker Gauntlets'],
    ['Prestige Champion Gauntlets', 'Berserker Gauntlets'],
    ['Champion Boots', 'Berserker Boots'],
    ['Prestige Champion Boots', 'Berserker Boots'],
    ['Warlord Helmet', 'Dreadlord Helm'],
    ['Prestige Warlord Helmet', 'Dreadlord Helm'],
    ['Warlord Chestplate', 'Dreadlord Chestplate'],
    ['Prestige Warlord Chestplate', 'Dreadlord Chestplate'],
    ['Warlord Leggings', 'Dreadlord Leggings'],
    ['Prestige Warlord Leggings', 'Dreadlord Leggings'],
    ['Warlord Gauntlets', 'Dreadlord Gauntlets'],
    ['Prestige Warlord Gauntlets', 'Dreadlord Gauntlets'],
    ['Warlord Boots', 'Dreadlord Boots'],
    ['Prestige Warlord Boots', 'Dreadlord Boots'],
  ];

  // Weapon legacy names
  const weaponLegacyMap: [string, string][] = [
    ['Recruit Mace', 'Iron Mace'],
    ['Prestige Recruit Mace', 'Iron Mace'],
    ['Knight Mace', 'Guardian Mace'],
    ['Prestige Knight Mace', 'Guardian Mace'],
    ['Crusader Mace', 'Noble Flail'],
    ['Prestige Crusader Mace', 'Noble Flail'],
    ['Guardian Hammer', 'Colossus Maul'],
    ['Prestige Guardian Hammer', 'Colossus Maul'],
    ['Divine Hammer', 'Dawn Breaker'],
    ['Prestige Divine Hammer', 'Dawn Breaker'],
    ['Trainee Sword', 'Iron Sword'],
    ['Prestige Trainee Sword', 'Iron Sword'],
    ['Warrior Sword', 'Battle Spear'],
    ['Prestige Warrior Sword', 'Battle Spear'],
    ['Berserker Axe', 'Flame Sword'],
    ['Prestige Berserker Axe', 'Flame Sword'],
    ['Champion Blade', 'Dark Scythe'],
    ['Prestige Champion Blade', 'Dark Scythe'],
    ['Warlord Greatsword', 'Executioner'],
    ['Prestige Warlord Greatsword', 'Executioner'],
  ];

  // Shield legacy names
  const shieldLegacyMap: [string, string][] = [
    ['Recruit Shield', 'Iron Shield'],
    ['Prestige Recruit Shield', 'Iron Shield'],
    ['Knight Shield', 'Bastion Shield'],
    ['Prestige Knight Shield', 'Bastion Shield'],
    ['Crusader Shield', 'Golden Bulwark'],
    ['Prestige Crusader Shield', 'Golden Bulwark'],
    ['Guardian Shield', 'Glorious Shield'],
    ['Prestige Guardian Shield', 'Glorious Shield'],
    ['Divine Shield', "Titan's Aegis"],
    ['Prestige Divine Shield', "Titan's Aegis"],
  ];

  const allMaps = [
    ...paladinLegacyMap,
    ...fighterLegacyMap,
    ...weaponLegacyMap,
    ...shieldLegacyMap,
  ];

  allMaps.forEach(([oldName, newName]) => {
    const entry = ASSET_REGISTRY[newName];
    if (entry) {
      aliases[oldName] = entry;
    }
  });

  return aliases;
}

// ==================== BUILD THE REGISTRY ====================

const _armorEntries = buildArmorEntries();
const _weaponEntries = buildWeaponEntries();
const _equipmentEntries = buildEquipmentEntries();
const _consumableEntries = buildConsumableEntries();
const _materialEntries = buildMaterialEntries();

export const ASSET_REGISTRY: Record<string, AssetRegistryEntry> = {
  ..._armorEntries,
  ..._weaponEntries,
  ..._equipmentEntries,
  ..._consumableEntries,
  ..._materialEntries,
};

// Add legacy aliases (must be done after ASSET_REGISTRY is built)
const _legacyAliases = buildLegacyAliases();
Object.assign(ASSET_REGISTRY, _legacyAliases);

// ==================== LOOKUP FUNCTIONS ====================

/**
 * Get the inventory icon path for an item by name.
 * Falls back to a generic 'unknown' placeholder.
 */
export function getItemIcon(itemName: string): string {
  const entry = ASSET_REGISTRY[itemName];
  if (entry) return entry.icon;
  return SLOT_ICONS.unknown;
}

/**
 * Get the icon path for a given equipment slot.
 */
export function getSlotIcon(slot: EquipmentSlot): string {
  const slotToIcon: Record<EquipmentSlot, string> = {
    [EquipmentSlot.HEAD]: SLOT_ICONS.head,
    [EquipmentSlot.CHEST]: SLOT_ICONS.chest,
    [EquipmentSlot.LEGS]: SLOT_ICONS.legs,
    [EquipmentSlot.BOOTS]: SLOT_ICONS.boots,
    [EquipmentSlot.GLOVES]: SLOT_ICONS.gloves,
    // BRACERS and SHOULDERS removed from equipment slots
    [EquipmentSlot.WEAPON]: SLOT_ICONS.weapon,
    [EquipmentSlot.OFF_HAND]: SLOT_ICONS.shield,
    [EquipmentSlot.CAPE]: SLOT_ICONS.cape,
    [EquipmentSlot.WINGS]: SLOT_ICONS.wings,
    [EquipmentSlot.PENDANT]: SLOT_ICONS.neck,
    [EquipmentSlot.RING_1]: SLOT_ICONS.ring,
    [EquipmentSlot.RING_2]: SLOT_ICONS.ring,
  };
  return slotToIcon[slot] || SLOT_ICONS.unknown;
}

/**
 * Get paperdoll sprite properties for an item by name.
 */
export function getItemSprite(itemName: string): ItemSpriteInfo | null {
  return ASSET_REGISTRY[itemName]?.sprite || null;
}

/**
 * Get the full asset registry entry for an item by name.
 */
export function getAssetEntry(itemName: string): AssetRegistryEntry | null {
  return ASSET_REGISTRY[itemName] || null;
}
