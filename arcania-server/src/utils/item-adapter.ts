import type { ItemData, ItemInstance } from '../types/index.js';
import { ItemRarity } from '../types/index.js';

/** Convert an ItemInstance to the ItemData shape stored in DB inventory. */
export function itemInstanceToItemData(inst: ItemInstance): ItemData {
  return {
    id: inst.instanceId,
    name: inst.enhancementLevel > 0 ? `${inst.name} +${inst.enhancementLevel}` : inst.name,
    description: inst.description,
    type: inst.type,
    rarity: inst.isPrestige ? ItemRarity.PRESTIGE : ItemRarity.REGULAR,
    isPrestige: inst.isPrestige,
    requiredLevel: inst.requiredLevel,
    requiredClass: inst.requiredClass,
    equipmentSlot: inst.slot,
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
    stackable: inst.stackable,
    maxStack: inst.maxStack,
    sellPrice: inst.sellPrice,
    icon: inst.icon,
    spriteInfo: inst.spriteInfo,
  };
}
