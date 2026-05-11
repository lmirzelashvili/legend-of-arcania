/**
 * Maps item names to their LPC sprite information
 * This allows us to render equipped items on character sprites
 */

import type { ItemSpriteInfo } from '@/types/game.types';

export type { ItemSpriteInfo } from '@/types/game.types';

/**
 * Map item names to their sprite information
 * Names should match the item names in the database
 */
export const ITEM_SPRITE_MAP: Record<string, ItemSpriteInfo> = {
  // ==================== PALADIN ARMOR (plate, iron→silver→steel→gold→ceramic) ====================
  // T1 — Black Iron
  'Black Iron Helm':       { helmetType: 'sugarloaf', helmetMaterial: 'iron' },
  'Black Iron Chestplate': { torsoType: 'plate', torsoMaterial: 'iron' },
  'Black Iron Leggings':   { legsType: 'plate', legsMaterial: 'iron' },
  'Black Iron Boots':      { bootsType: 'basic', bootsMaterial: 'iron' },
  'Black Iron Gauntlets':  { armsType: 'gloves', armsMaterial: 'iron', shouldersType: 'plate', shouldersMaterial: 'iron', bracersType: 'plate', bracersMaterial: 'iron' },
  // T2 — Silver Guardian
  'Silver Guardian Helm':       { helmetType: 'nasal', helmetMaterial: 'silver' },
  'Silver Guardian Chestplate': { torsoType: 'plate', torsoMaterial: 'silver' },
  'Silver Guardian Leggings':   { legsType: 'plate', legsMaterial: 'silver' },
  'Silver Guardian Boots':      { bootsType: 'basic', bootsMaterial: 'silver' },
  'Silver Guardian Gauntlets':  { armsType: 'gloves', armsMaterial: 'silver', shouldersType: 'plate', shouldersMaterial: 'silver', bracersType: 'plate', bracersMaterial: 'silver' },
  // T3 — Immortal Plate
  'Immortal Plate Helm':       { helmetType: 'flattop', helmetMaterial: 'steel' },
  'Immortal Plate Chestplate': { torsoType: 'plate', torsoMaterial: 'steel' },
  'Immortal Plate Leggings':   { legsType: 'plate', legsMaterial: 'steel' },
  'Immortal Plate Boots':      { bootsType: 'basic', bootsMaterial: 'steel' },
  'Immortal Plate Gauntlets':  { armsType: 'gloves', armsMaterial: 'steel', shouldersType: 'plate', shouldersMaterial: 'steel', bracersType: 'plate', bracersMaterial: 'steel' },
  // T4 — Great Crusader
  'Great Crusader Helm':       { helmetType: 'greathelm', helmetMaterial: 'gold' },
  'Great Crusader Chestplate': { torsoType: 'plate', torsoMaterial: 'gold' },
  'Great Crusader Leggings':   { legsType: 'plate', legsMaterial: 'gold' },
  'Great Crusader Boots':      { bootsType: 'basic', bootsMaterial: 'gold' },
  'Great Crusader Gauntlets':  { armsType: 'gloves', armsMaterial: 'gold', shouldersType: 'plate', shouldersMaterial: 'gold', bracersType: 'plate', bracersMaterial: 'gold' },
  // T5 — Eternal Titan
  'Eternal Titan Helm':       { helmetType: 'armet', helmetMaterial: 'ceramic' },
  'Eternal Titan Chestplate': { torsoType: 'plate', torsoMaterial: 'ceramic' },
  'Eternal Titan Leggings':   { legsType: 'plate', legsMaterial: 'ceramic' },
  'Eternal Titan Boots':      { bootsType: 'basic', bootsMaterial: 'ceramic' },
  'Eternal Titan Gauntlets':  { armsType: 'gloves', armsMaterial: 'ceramic', shouldersType: 'plate', shouldersMaterial: 'ceramic', bracersType: 'plate', bracersMaterial: 'ceramic' },

  // ==================== PALADIN WEAPONS ====================
  'Iron Mace':      { weaponType: 'arming', weaponColor: 'iron' },
  'Guardian Mace':  { weaponType: 'mace', weaponColor: 'mace' },
  'Noble Flail':    { weaponType: 'flail', weaponColor: 'flail' },
  'Colossus Maul':  { weaponType: 'waraxe', weaponColor: 'waraxe' },
  'Dawn Breaker':   { weaponType: 'smash', weaponColor: 'hammer' },

  // ==================== PALADIN SHIELDS ====================
  'Iron Shield':      { shieldType: 'scutum' },
  'Bastion Shield':   { shieldType: 'kite', shieldVariant: 'kite_gray_blue' },
  'Golden Bulwark':   { shieldType: 'heater' },
  'Glorious Shield':  { shieldType: 'crusader' },
  "Titan's Aegis":    { shieldType: 'spartan' },

  // ==================== FIGHTER ARMOR (medium leather, brown→bronze→blue→maroon→brass) ====================
  // T1 — Mercenary
  'Mercenary Helm':       { helmetType: 'headband_tied', helmetMaterial: 'brown' },
  'Mercenary Chestplate': { torsoType: 'leather', torsoMaterial: 'brown' },
  'Mercenary Leggings':   { legsType: 'pants', legsMaterial: 'charcoal' },
  'Mercenary Boots':      { bootsType: 'basic', bootsMaterial: 'brown' },
  'Mercenary Gauntlets':  { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'leather', shouldersMaterial: 'brown', bracersType: 'plate', bracersMaterial: 'iron' },
  // T2 — Gladiator
  'Gladiator Helm':       { helmetType: 'headband', helmetMaterial: 'maroon' },
  'Gladiator Chestplate': { torsoType: 'legion', torsoMaterial: 'bronze' },
  'Gladiator Leggings':   { legsType: 'pants', legsMaterial: 'maroon' },
  'Gladiator Boots':      { bootsType: 'basic', bootsMaterial: 'brown' },
  'Gladiator Gauntlets':  { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'legion', shouldersMaterial: 'bronze', bracersType: 'plate', bracersMaterial: 'bronze' },
  // T3 — Noble Knight
  'Noble Knight Helm':       { helmetType: 'kerchief', helmetMaterial: 'blue' },
  'Noble Knight Chestplate': { torsoType: 'tabard', torsoMaterial: 'blue' },
  'Noble Knight Leggings':   { legsType: 'pants', legsMaterial: 'navy' },
  'Noble Knight Boots':      { bootsType: 'basic', bootsMaterial: 'brown' },
  'Noble Knight Gauntlets':  { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'leather', shouldersMaterial: 'blue', bracersType: 'plate', bracersMaterial: 'gold' },
  // T4 — Berserker
  'Berserker Helm':       { helmetType: 'bandana', helmetMaterial: 'maroon' },
  'Berserker Chestplate': { torsoType: 'leather', torsoMaterial: 'maroon' },
  'Berserker Leggings':   { legsType: 'pants', legsMaterial: 'black' },
  'Berserker Boots':      { bootsType: 'basic', bootsMaterial: 'maroon' },
  'Berserker Gauntlets':  { armsType: 'gloves', armsMaterial: 'maroon', shouldersType: 'leather', shouldersMaterial: 'maroon', bracersType: 'plate', bracersMaterial: 'copper' },
  // T5 — Dreadlord
  'Dreadlord Helm':       { helmetType: 'horned', helmetMaterial: 'brass' },
  'Dreadlord Chestplate': { torsoType: 'legion', torsoMaterial: 'brass' },
  'Dreadlord Leggings':   { legsType: 'pants', legsMaterial: 'black' },
  'Dreadlord Boots':      { bootsType: 'basic', bootsMaterial: 'black' },
  'Dreadlord Gauntlets':  { armsType: 'gloves', armsMaterial: 'black', shouldersType: 'legion', shouldersMaterial: 'brass', bracersType: 'plate', bracersMaterial: 'brass' },

  // ==================== FIGHTER WEAPONS ====================
  'Iron Sword':     { weaponType: 'arming', weaponColor: 'iron' },
  'Gladius':        { weaponType: 'longsword', weaponColor: 'iron' },
  'Noble Blade':    { weaponType: 'longsword', weaponColor: 'gold' },
  'Berserker Axe':  { weaponType: 'waraxe', weaponColor: 'copper' },
  'Doom Blade':     { weaponType: 'longsword', weaponColor: 'longsword' },

  // ==================== FIGHTER OFFHAND DAGGERS ====================
  'Iron Dagger':      { weaponType: 'dagger' },
  'Parrying Dagger':  { weaponType: 'dagger' },
  'Assassin Blade':   { weaponType: 'dagger' },
  'Soul Ripper':      { weaponType: 'dagger' },
  'Void Fang':        { weaponType: 'dagger' },

  // ==================== RANGER ARMOR (leather, cloth colors) ====================
  // T1 — Leather Scout
  'Leather Scout Helm':       { helmetType: 'headband_tied', helmetMaterial: 'brown' },
  'Leather Scout Chestplate': { torsoType: 'leather', torsoMaterial: 'brown' },
  'Leather Scout Leggings':   { legsType: 'pants', legsMaterial: 'brown' },
  'Leather Scout Boots':      { bootsType: 'basic', bootsMaterial: 'brown' },
  'Leather Scout Gauntlets':  { armsType: 'gloves', armsMaterial: 'brown', shouldersType: 'mantal', shouldersMaterial: 'brown', bracersType: 'plate', bracersMaterial: 'bronze' },
  // T2 — Elite Hunter
  'Elite Hunter Helm':       { helmetType: 'leather_cap', helmetMaterial: 'brown' },
  'Elite Hunter Chestplate': { torsoType: 'leather', torsoMaterial: 'forest' },
  'Elite Hunter Leggings':   { legsType: 'pants', legsMaterial: 'forest' },
  'Elite Hunter Boots':      { bootsType: 'basic', bootsMaterial: 'forest' },
  'Elite Hunter Gauntlets':  { armsType: 'gloves', armsMaterial: 'forest', shouldersType: 'mantal', shouldersMaterial: 'forest', bracersType: 'plate', bracersMaterial: 'bronze' },
  // T3 — Black Ambition
  'Black Ambition Helm':       { helmetType: 'bandana', helmetMaterial: 'black' },
  'Black Ambition Chestplate': { torsoType: 'leather', torsoMaterial: 'black' },
  'Black Ambition Leggings':   { legsType: 'pants', legsMaterial: 'charcoal' },
  'Black Ambition Boots':      { bootsType: 'basic', bootsMaterial: 'black' },
  'Black Ambition Gauntlets':  { armsType: 'gloves', armsMaterial: 'black', shouldersType: 'mantal', shouldersMaterial: 'charcoal', bracersType: 'plate', bracersMaterial: 'iron' },
  // T4 — Venom
  'Venom Helm':       { helmetType: 'kerchief', helmetMaterial: 'purple' },
  'Venom Chestplate': { torsoType: 'leather', torsoMaterial: 'purple' },
  'Venom Leggings':   { legsType: 'pants', legsMaterial: 'purple' },
  'Venom Boots':      { bootsType: 'basic', bootsMaterial: 'purple' },
  'Venom Gauntlets':  { armsType: 'gloves', armsMaterial: 'purple', shouldersType: 'mantal', shouldersMaterial: 'purple', bracersType: 'plate', bracersMaterial: 'copper' },
  // T5 — Phantom (no headwear)
  'Phantom Chestplate': { torsoType: 'leather', torsoMaterial: 'gray' },
  'Phantom Leggings':   { legsType: 'pants', legsMaterial: 'gray' },
  'Phantom Boots':      { bootsType: 'basic', bootsMaterial: 'gray' },
  'Phantom Gauntlets':  { armsType: 'gloves', armsMaterial: 'gray', shouldersType: 'mantal', shouldersMaterial: 'gray', bracersType: 'plate', bracersMaterial: 'steel' },

  // ==================== RANGER WEAPONS ====================
  'Short Bow':    { weaponType: 'shortbow', weaponColor: 'light' },
  "Hunter's Bow": { weaponType: 'shortbow', weaponColor: 'dark' },
  'Black Bow':    { weaponType: 'shortbow' },
  'Venom Bow':    { weaponType: 'shortbow' },
  'Phantom Bow':  { weaponType: 'shortbow' },

  // ==================== CLERIC ARMOR (cloth longsleeve2) ====================
  // T1 — Swift Silk
  'Swift Silk Helm':       { helmetType: 'tiara', helmetMaterial: 'silver' },
  'Swift Silk Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'white' },
  'Swift Silk Leggings':   { legsType: 'pants', legsMaterial: 'white' },
  'Swift Silk Boots':      { bootsType: 'basic', bootsMaterial: 'white' },
  'Swift Silk Gauntlets':  { armsType: 'gloves', armsMaterial: 'white', shouldersType: 'mantal', shouldersMaterial: 'gray', bracersType: 'plate', bracersMaterial: 'silver' },
  // T2 — Spirit
  'Spirit Helm':       { helmetType: 'bandana2', helmetMaterial: 'lavender' },
  'Spirit Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'lavender' },
  'Spirit Leggings':   { legsType: 'pants', legsMaterial: 'lavender' },
  'Spirit Boots':      { bootsType: 'basic', bootsMaterial: 'lavender' },
  'Spirit Gauntlets':  { armsType: 'gloves', armsMaterial: 'lavender', shouldersType: 'mantal', shouldersMaterial: 'lavender', bracersType: 'plate', bracersMaterial: 'silver' },
  // T3 — Silver Wing
  'Silver Wing Helm':       { helmetType: 'tiara', helmetMaterial: 'silver' },
  'Silver Wing Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'gray' },
  'Silver Wing Leggings':   { legsType: 'pants', legsMaterial: 'gray' },
  'Silver Wing Boots':      { bootsType: 'basic', bootsMaterial: 'silver' },
  'Silver Wing Gauntlets':  { armsType: 'gloves', armsMaterial: 'silver', shouldersType: 'mantal', shouldersMaterial: 'gray', bracersType: 'plate', bracersMaterial: 'silver' },
  // T4 — Manticore
  'Manticore Helm':       { helmetType: 'hood', helmetMaterial: 'maroon' },
  'Manticore Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'maroon' },
  'Manticore Leggings':   { legsType: 'pants', legsMaterial: 'maroon' },
  'Manticore Boots':      { bootsType: 'basic', bootsMaterial: 'maroon' },
  'Manticore Gauntlets':  { armsType: 'gloves', armsMaterial: 'maroon', shouldersType: 'mantal', shouldersMaterial: 'maroon', bracersType: 'plate', bracersMaterial: 'bronze' },
  // T5 — White Oracle
  'White Oracle Helm':       { helmetType: 'hood', helmetMaterial: 'white' },
  'White Oracle Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'white' },
  'White Oracle Leggings':   { legsType: 'pants', legsMaterial: 'white' },
  'White Oracle Boots':      { bootsType: 'basic', bootsMaterial: 'gold' },
  'White Oracle Gauntlets':  { armsType: 'gloves', armsMaterial: 'gold', shouldersType: 'epaulets', shouldersMaterial: 'gold', bracersType: 'plate', bracersMaterial: 'gold' },

  // ==================== CLERIC WEAPONS ====================
  'Wooden Staff':    { weaponType: 'gnarled', weaponColor: 'light' },
  'Spirit Staff':    { weaponType: 'loop', weaponColor: 'light' },
  'Silver Staff':    { weaponType: 'diamond', weaponColor: 'gold' },
  'Manticore Staff': { weaponType: 'crystal', weaponColor: 'yellow' },
  'Oracle Staff':    { weaponType: 'diamond', weaponColor: 'ceramic' },

  // ==================== MAGE ARMOR (cloth longsleeve2 + wizard hat) ====================
  // T1 — Mystic
  'Mystic Helm':       { helmetType: 'wizard', helmetMaterial: 'blue' },
  'Mystic Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'blue' },
  'Mystic Leggings':   { legsType: 'pants', legsMaterial: 'blue' },
  'Mystic Boots':      { bootsType: 'basic', bootsMaterial: 'blue' },
  'Mystic Gauntlets':  { armsType: 'gloves', armsMaterial: 'blue', shouldersType: 'mantal', shouldersMaterial: 'blue', bracersType: 'plate', bracersMaterial: 'silver' },
  // T2 — Arcane
  'Arcane Helm':       { helmetType: 'wizard', helmetMaterial: 'purple' },
  'Arcane Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'purple' },
  'Arcane Leggings':   { legsType: 'pants', legsMaterial: 'purple' },
  'Arcane Boots':      { bootsType: 'basic', bootsMaterial: 'purple' },
  'Arcane Gauntlets':  { armsType: 'gloves', armsMaterial: 'purple', shouldersType: 'mantal', shouldersMaterial: 'purple', bracersType: 'plate', bracersMaterial: 'silver' },
  // T3 — Eclipse
  'Eclipse Helm':       { helmetType: 'wizard', helmetMaterial: 'black' },
  'Eclipse Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'black' },
  'Eclipse Leggings':   { legsType: 'pants', legsMaterial: 'black' },
  'Eclipse Boots':      { bootsType: 'basic', bootsMaterial: 'black' },
  'Eclipse Gauntlets':  { armsType: 'gloves', armsMaterial: 'black', shouldersType: 'mantal', shouldersMaterial: 'black', bracersType: 'plate', bracersMaterial: 'iron' },
  // T4 — Moonlight
  'Moonlight Helm':       { helmetType: 'wizard', helmetMaterial: 'sky' },
  'Moonlight Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'gray' },
  'Moonlight Leggings':   { legsType: 'pants', legsMaterial: 'gray' },
  'Moonlight Boots':      { bootsType: 'basic', bootsMaterial: 'silver' },
  'Moonlight Gauntlets':  { armsType: 'gloves', armsMaterial: 'silver', shouldersType: 'mantal', shouldersMaterial: 'sky', bracersType: 'plate', bracersMaterial: 'silver' },
  // T5 — Void
  'Void Helm':       { helmetType: 'wizard', helmetMaterial: 'charcoal' },
  'Void Chestplate': { torsoType: 'longsleeve2', torsoMaterial: 'charcoal' },
  'Void Leggings':   { legsType: 'pants', legsMaterial: 'charcoal' },
  'Void Boots':      { bootsType: 'basic', bootsMaterial: 'charcoal' },
  'Void Gauntlets':  { armsType: 'gloves', armsMaterial: 'charcoal', shouldersType: 'mantal', shouldersMaterial: 'charcoal', bracersType: 'plate', bracersMaterial: 'steel' },

  // ==================== MAGE WEAPONS ====================
  'Apprentice Staff': { weaponType: 'simple', weaponColor: 'medium' },
  'Crystal Staff':    { weaponType: 'crystal', weaponColor: 'blue' },
  'Flame Staff':      { weaponType: 'diamond', weaponColor: 'silver' },
  'Void Staff':       { weaponType: 'crystal', weaponColor: 'purple' },
  'Archmage Staff':   { weaponType: 'crystal', weaponColor: 'red' },

  // ==================== WINGS ====================
  'Sentinel Wings':   { wingsType: 'bat', wingsColor: 'black' },
  'Guardian Wings':   { wingsType: 'feathered', wingsColor: 'gold' },
  'Draconic Wings':   { wingsType: 'bat', wingsColor: 'red' },
  'Nightfall Wings':  { wingsType: 'bat', wingsColor: 'black' },
  'Celestial Wings':  { wingsType: 'feathered', wingsColor: 'gold' },

  // ==================== CAPES ====================
  'Sentinel Cape':          { capeType: 'solid', capeColor: 'brown' },
  'Honor Cape':             { capeType: 'solid', capeColor: 'white' },
  'Warlord Cape':           { capeType: 'solid', capeColor: 'red' },
  'Infernal Cape':          { capeType: 'solid', capeColor: 'maroon' },
  'Eternal Cape':           { capeType: 'solid', capeColor: 'black' },
};

/**
 * Helper function to get sprite info for an item by name
 */
export function getItemSpriteInfo(itemName: string): ItemSpriteInfo | null {
  // Strip enhancement suffix (e.g., "Knight Helmet +3" → "Knight Helmet")
  const baseName = itemName.replace(/\s*\+\d+$/, '');
  return ITEM_SPRITE_MAP[baseName] || null;
}

/** Merged equipment sprite result used by EquipmentPreview */
export interface EquipmentSpriteResult {
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
  offHandWeaponType?: string;
  offHandWeaponColor?: string;
}

/**
 * Helper function to merge sprite info from multiple equipped items
 */
export function mergeEquipmentSpriteInfo(
  helmet?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  chest?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  legs?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  arms?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  boots?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  shoulders?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  cape?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  wings?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  weapon?: { name: string; spriteInfo?: ItemSpriteInfo } | null,
  shield?: { name: string; spriteInfo?: ItemSpriteInfo } | null
): EquipmentSpriteResult {
  const result: EquipmentSpriteResult = {};

  if (helmet) {
    const info = getItemSpriteInfo(helmet.name) || helmet.spriteInfo;
    if (info?.helmetType) result.helmetType = info.helmetType;
    if (info?.helmetMaterial) result.helmetMaterial = info.helmetMaterial;
  }

  if (chest) {
    const info = getItemSpriteInfo(chest.name) || chest.spriteInfo;
    if (info?.torsoType) result.torsoType = info.torsoType;
    if (info?.torsoMaterial) result.torsoMaterial = info.torsoMaterial;
  }

  if (legs) {
    const info = getItemSpriteInfo(legs.name) || legs.spriteInfo;
    if (info?.legsType) result.legsType = info.legsType;
    if (info?.legsMaterial) result.legsMaterial = info.legsMaterial;
  }

  if (arms) {
    const info = getItemSpriteInfo(arms.name) || arms.spriteInfo;
    if (info?.armsType) result.armsType = info.armsType;
    if (info?.armsMaterial) result.armsMaterial = info.armsMaterial;
    // Shoulders + bracers are visually driven by the gloves item
    if (info?.shouldersType) result.shouldersType = info.shouldersType;
    if (info?.shouldersMaterial) result.shouldersMaterial = info.shouldersMaterial;
    if (info?.bracersType) result.bracersType = info.bracersType;
    if (info?.bracersMaterial) result.bracersMaterial = info.bracersMaterial;
  }

  if (boots) {
    const info = getItemSpriteInfo(boots.name) || boots.spriteInfo;
    if (info?.bootsType) result.bootsType = info.bootsType;
    if (info?.bootsMaterial) result.bootsMaterial = info.bootsMaterial;
  }

  if (shoulders) {
    const info = getItemSpriteInfo(shoulders.name) || shoulders.spriteInfo;
    if (info?.shouldersType) result.shouldersType = info.shouldersType;
    if (info?.shouldersMaterial) result.shouldersMaterial = info.shouldersMaterial;
  }

  if (cape) {
    const info = getItemSpriteInfo(cape.name) || cape.spriteInfo;
    if (info?.capeType) result.capeType = info.capeType;
    if (info?.capeColor) result.capeColor = info.capeColor;
  }

  if (wings) {
    const info = getItemSpriteInfo(wings.name) || wings.spriteInfo;
    if (info?.wingsType) result.wingsType = info.wingsType;
    if (info?.wingsColor) result.wingsColor = info.wingsColor;
  }

  if (weapon) {
    const info = getItemSpriteInfo(weapon.name) || weapon.spriteInfo;
    if (info?.weaponType) result.weaponType = info.weaponType;
    if (info?.weaponColor) result.weaponColor = info.weaponColor;
  }

  if (shield) {
    const info = getItemSpriteInfo(shield.name) || shield.spriteInfo;
    if (info?.shieldType) result.shieldType = info.shieldType;
    if (info?.shieldVariant) result.shieldVariant = info.shieldVariant;
    // Offhand weapons (e.g., Fighter daggers)
    if (info?.weaponType) result.offHandWeaponType = info.weaponType;
    if (info?.weaponColor) result.offHandWeaponColor = info.weaponColor;
  }

  // Auto-derive bracers from gloves if not explicitly set
  if (result.armsType && !result.bracersType) {
    result.bracersType = 'plate';
    result.bracersMaterial = result.armsMaterial;
  }

  // Auto-derive shoulders from gloves/chest if not explicitly set
  if ((result.armsType || result.torsoType) && !result.shouldersType) {
    if (result.torsoType === 'plate') {
      result.shouldersType = 'plate';
    } else if (result.torsoType === 'legion') {
      result.shouldersType = 'legion';
    } else if (result.torsoType === 'leather' || result.torsoType === 'tabard') {
      result.shouldersType = 'leather';
    } else {
      result.shouldersType = 'mantal';
    }
    result.shouldersMaterial = result.armsMaterial || result.torsoMaterial;
  }

  return result;
}
