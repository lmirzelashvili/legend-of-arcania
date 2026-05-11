import { CharacterClass, ItemType, ItemRarity, EquipmentSlot, type ItemData, type InventoryItemData } from '../types/index.js';
import { toJsonInput, type PrismaTransactionClient } from './prisma-json-helpers.js';

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function findEmptySlot(items: { gridX: number; gridY: number }[], maxSlots: number = 40): { x: number; y: number } | null {
  const cols = 8;
  const rows = Math.ceil(maxSlots / cols);
  const occupied = new Set(items.map(i => `${i.gridX},${i.gridY}`));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const slotIndex = y * cols + x;
      if (slotIndex < maxSlots && !occupied.has(`${x},${y}`)) {
        return { x, y };
      }
    }
  }
  return null;
}

export function getStarterWeapon(characterClass: string): ItemData {
  switch (characterClass) {
    case CharacterClass.PALADIN:
      return { id: 'weapon_t1_iron_mace', name: 'Iron Mace', description: 'A sturdy one-handed mace', type: ItemType.WEAPON, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.PALADIN, equipmentSlot: EquipmentSlot.WEAPON, physicalAttack: 5, stackable: false, maxStack: 1, sellPrice: 75 };
    case CharacterClass.FIGHTER:
      return { id: 'weapon_t1_iron_sword', name: 'Iron Sword', description: 'A balanced dual-wield sword', type: ItemType.WEAPON, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.FIGHTER, equipmentSlot: EquipmentSlot.WEAPON, physicalAttack: 5, stackable: false, maxStack: 1, sellPrice: 75 };
    case CharacterClass.RANGER:
      return { id: 'weapon_t1_short_bow', name: 'Short Bow', description: 'A reliable two-handed bow', type: ItemType.WEAPON, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.RANGER, equipmentSlot: EquipmentSlot.WEAPON, physicalAttack: 5, stackable: false, maxStack: 1, sellPrice: 75 };
    case CharacterClass.MAGE:
      return { id: 'weapon_t1_oak_staff', name: 'Oak Staff', description: 'A two-handed staff imbued with arcane energy', type: ItemType.WEAPON, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.MAGE, equipmentSlot: EquipmentSlot.WEAPON, magicAttack: 6, stackable: false, maxStack: 1, sellPrice: 75 };
    case CharacterClass.CLERIC:
      return { id: 'weapon_t1_oak_staff', name: 'Oak Staff', description: 'A two-handed staff blessed with holy light', type: ItemType.WEAPON, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.CLERIC, equipmentSlot: EquipmentSlot.WEAPON, magicAttack: 6, stackable: false, maxStack: 1, sellPrice: 75 };
    default:
      return { id: 'weapon_t1_iron_sword', name: 'Iron Sword', description: 'A balanced dual-wield sword', type: ItemType.WEAPON, rarity: ItemRarity.REGULAR, requiredLevel: 1, equipmentSlot: EquipmentSlot.WEAPON, physicalAttack: 5, stackable: false, maxStack: 1, sellPrice: 75 };
  }
}

export function getStarterChest(characterClass: string): ItemData {
  switch (characterClass) {
    case CharacterClass.PALADIN:
      return { id: 'armor_t1_black_iron_chest', name: 'Black Iron Chestplate', description: 'Heavy plate armor forged for crusaders', type: ItemType.ARMOR, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.PALADIN, equipmentSlot: EquipmentSlot.CHEST, maxHp: 30, stackable: false, maxStack: 1, sellPrice: 50 };
    case CharacterClass.FIGHTER:
      return { id: 'armor_t1_mercenary_chest', name: 'Mercenary Chestplate', description: 'Battle-worn armor favored by mercenaries', type: ItemType.ARMOR, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.FIGHTER, equipmentSlot: EquipmentSlot.CHEST, maxHp: 30, stackable: false, maxStack: 1, sellPrice: 50 };
    case CharacterClass.RANGER:
      return { id: 'armor_t1_leather_scout_chest', name: 'Leather Scout Chestplate', description: 'Lightweight leather armor for swift scouts', type: ItemType.ARMOR, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.RANGER, equipmentSlot: EquipmentSlot.CHEST, maxHp: 30, stackable: false, maxStack: 1, sellPrice: 50 };
    case CharacterClass.MAGE:
      return { id: 'armor_t1_swift_silk_chest', name: 'Swift Silk Chestplate', description: 'A flowing robe woven from enchanted silk', type: ItemType.ARMOR, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.MAGE, equipmentSlot: EquipmentSlot.CHEST, maxHp: 30, stackable: false, maxStack: 1, sellPrice: 50 };
    case CharacterClass.CLERIC:
      return { id: 'armor_t1_swift_silk_chest', name: 'Swift Silk Chestplate', description: 'A flowing robe blessed for holy service', type: ItemType.ARMOR, rarity: ItemRarity.REGULAR, requiredLevel: 1, requiredClass: CharacterClass.CLERIC, equipmentSlot: EquipmentSlot.CHEST, maxHp: 30, stackable: false, maxStack: 1, sellPrice: 50 };
    default:
      return { id: 'armor_t1_mercenary_chest', name: 'Mercenary Chestplate', description: 'Battle-worn armor favored by mercenaries', type: ItemType.ARMOR, rarity: ItemRarity.REGULAR, requiredLevel: 1, equipmentSlot: EquipmentSlot.CHEST, maxHp: 30, stackable: false, maxStack: 1, sellPrice: 50 };
  }
}

export function getStarterItems(characterClass: string): { itemData: ItemData; quantity: number; gridX: number; gridY: number }[] {
  const items: { itemData: ItemData; quantity: number; gridX: number; gridY: number }[] = [];

  items.push({
    itemData: { id: 'elixir_life_sm', name: 'Elixir of Life (SM)', description: 'Restores 150 HP. 10s cooldown.', type: ItemType.CONSUMABLE, rarity: ItemRarity.REGULAR, requiredLevel: 1, maxHp: 150, stackable: true, maxStack: 99, sellPrice: 15 },
    quantity: 10, gridX: 0, gridY: 0,
  });

  items.push({
    itemData: { id: 'elixir_mana_sm', name: 'Elixir of Mana (SM)', description: 'Restores 100 Mana. 10s cooldown.', type: ItemType.CONSUMABLE, rarity: ItemRarity.REGULAR, requiredLevel: 1, maxMana: 100, stackable: true, maxStack: 99, sellPrice: 15 },
    quantity: 10, gridX: 1, gridY: 0,
  });

  items.push({
    itemData: getStarterWeapon(characterClass),
    quantity: 1, gridX: 0, gridY: 1,
  });

  items.push({
    itemData: getStarterChest(characterClass),
    quantity: 1, gridX: 1, gridY: 1,
  });

  return items;
}

// Equipment slot name mapping (frontend sends various formats)
export const EQUIPMENT_SLOT_MAP: Record<string, string> = {
  'weapon': 'WEAPON',
  'off_hand': 'OFF_HAND',
  'offhand': 'OFF_HAND',
  'head': 'HEAD',
  'chest': 'CHEST',
  'legs': 'LEGS',
  'boots': 'BOOTS',
  'gloves': 'GLOVES',
  'bracers': 'GLOVES',
  'shoulders': 'CHEST',
  'cape': 'CAPE',
  'wings': 'WINGS',
  'neck': 'PENDANT',
  'pendant': 'PENDANT',
  'ring_1': 'RING_1',
  'ring_2': 'RING_2',
  'ring1': 'RING_1',
  'ring2': 'RING_2',
  // Also accept uppercase
  'WEAPON': 'WEAPON',
  'OFF_HAND': 'OFF_HAND',
  'HEAD': 'HEAD',
  'CHEST': 'CHEST',
  'LEGS': 'LEGS',
  'BOOTS': 'BOOTS',
  'GLOVES': 'GLOVES',
  'BRACERS': 'GLOVES',
  'SHOULDERS': 'CHEST',
  'CAPE': 'CAPE',
  'WINGS': 'WINGS',
  'NECK': 'PENDANT',
  'PENDANT': 'PENDANT',
  'RING_1': 'RING_1',
  'RING_2': 'RING_2',
};

// Map DB slot names to frontend equipment object keys
export const SLOT_TO_EQUIPMENT_KEY: Record<string, string> = {
  'WEAPON': 'weapon',
  'OFF_HAND': 'offHand',
  'HEAD': 'head',
  'CHEST': 'chest',
  'LEGS': 'legs',
  'BOOTS': 'boots',
  'GLOVES': 'gloves',
  'CAPE': 'cape',
  'WINGS': 'wings',
  'PENDANT': 'pendant',
  'NECK': 'pendant',
  'RING_1': 'ring1',
  'RING_2': 'ring2',
};

// ==================== BATCH INVENTORY HELPERS ====================

/**
 * Returns `count` empty { x, y } slot coordinates given a list of already-occupied items.
 * Returns fewer than `count` entries if the bag does not have enough free space.
 */
export function findEmptySlots(
  existingItems: { gridX: number; gridY: number }[],
  count: number,
  capacity: number,
): { x: number; y: number }[] {
  const cols = 8;
  const rows = Math.ceil(capacity / cols);
  const occupied = new Set(existingItems.map(i => `${i.gridX},${i.gridY}`));
  const slots: { x: number; y: number }[] = [];

  outer: for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const slotIndex = y * cols + x;
      if (slotIndex >= capacity) break outer;
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        slots.push({ x, y });
        occupied.add(key); // prevent duplicate allocation in the same call
        if (slots.length === count) break outer;
      }
    }
  }

  return slots;
}

/**
 * Batch-creates multiple non-stackable inventory items using a single
 * `createMany` call instead of looping individual creates.
 *
 * @param tx      - Prisma transaction client
 * @param characterId - Target character
 * @param items   - Array of { itemId, itemData, quantity } to add
 * @param capacity - Bag capacity used to find empty slots
 *
 * Throws if there is not enough free space for all items.
 * For stackable items prefer using upsert logic directly in the caller.
 */
export async function createManyInventoryItems(
  tx: PrismaTransactionClient,
  characterId: string,
  items: { itemId: string; itemData: ItemData; quantity: number }[],
  capacity: number,
): Promise<void> {
  if (items.length === 0) return;

  const existingItems = await tx.inventoryItem.findMany({
    where: { characterId },
    select: { gridX: true, gridY: true },
  });

  const slots = findEmptySlots(existingItems, items.length, capacity);

  if (slots.length < items.length) {
    throw new Error(`Not enough inventory space: need ${items.length} slots, found ${slots.length}`);
  }

  await tx.inventoryItem.createMany({
    data: items.map((item, idx) => ({
      characterId,
      itemId: item.itemId,
      itemData: toJsonInput(item.itemData),
      quantity: item.quantity,
      gridX: slots[idx].x,
      gridY: slots[idx].y,
    })),
  });
}
