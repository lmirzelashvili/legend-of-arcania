// Forging Service — Forgemaster Anvil crafting system
// Players combine materials + crystals to forge wings, capes, and random equipment.

import prisma from '../config/db.js';
import { AppError } from '../middleware/errors.js';
import { loadFullCharacter } from '../utils/character-helpers.js';
import { findEmptySlot } from '../utils/inventory-helpers.js';
import { itemInstanceToItemData } from '../utils/item-adapter.js';
import { addItemToInventory } from '../utils/inventory-utils.js';
import type { ItemData, ItemInstance, DerivedStatKey, CharacterData } from '../types/index.js';
import { ItemType, ItemRarity, calculateBagCapacity } from '../types/index.js';
import { toItemData, toJsonInput } from '../utils/prisma-json-helpers.js';
import { getAllItemTemplates, getItemTemplate, ItemTemplate } from '../data/item-templates.js';
import { rollFromTemplate, rollItemInstance } from './item-generator.service.js';
import { randomUUID } from 'crypto';
import {
  TIER_SUCCESS_RATES,
  RANDOM_EQUIP_BASE_RATE,
  CRYSTAL_BONUS,
  RETURNABLE_MATERIAL_IDS,
  MATERIAL_RETURN_MIN,
  MATERIAL_RETURN_MAX,
} from '../config/balance/forging.js';

// ==================== RECIPE DEFINITIONS ====================

export interface RecipeMaterial {
  templateId: string;  // item-template id (e.g. 'material_feather_of_roc')
  name: string;        // display name
  quantity: number;
}

export interface ForgeRecipe {
  id: string;
  name: string;
  description: string;
  tier: number;
  category: 'wings' | 'capes' | 'armor' | 'weapon';
  /** Classes that may use this recipe (empty = all) */
  allowedClasses: string[];
  materials: RecipeMaterial[];
  /** Template id to roll on success — null for random-equipment recipes */
  resultTemplateId: string | null;
  /** For random recipes: what pool to pick from */
  randomPool?: 'armor' | 'weapon_shield';
  baseSuccessRate: number;
}

// On failure, primary materials are eligible for partial return (set built from config)
const RETURNABLE_MATERIALS = new Set(RETURNABLE_MATERIAL_IDS);

function buildRecipes(): ForgeRecipe[] {
  const recipes: ForgeRecipe[] = [];

  // ---------- WINGS (Paladin, Fighter) ----------
  const wingTiers: { tier: number; templateId: string; name: string; feathers: number; creations: number }[] = [
    { tier: 1, templateId: 'wings_t1', name: 'Sentinel Wings',  feathers: 15,  creations: 1 },
    { tier: 2, templateId: 'wings_t2', name: 'Guardian Wings',  feathers: 35,  creations: 2 },
    { tier: 3, templateId: 'wings_t3', name: 'Draconic Wings',  feathers: 70,  creations: 3 },
    { tier: 4, templateId: 'wings_t4', name: 'Nightfall Wings', feathers: 120, creations: 4 },
    { tier: 5, templateId: 'wings_t5', name: 'Celestial Wings', feathers: 250, creations: 6 },
  ];
  for (const w of wingTiers) {
    recipes.push({
      id: `forge_${w.templateId}`,
      name: w.name,
      description: `Forge ${w.name} (Tier ${w.tier}) — for Paladins and Fighters.`,
      tier: w.tier,
      category: 'wings',
      allowedClasses: ['PALADIN', 'FIGHTER'],
      materials: [
        { templateId: 'material_feather_of_roc', name: 'Feather of Roc', quantity: w.feathers },
        { templateId: 'crystal_creation', name: 'Crystal of Creation', quantity: w.creations },
      ],
      resultTemplateId: w.templateId,
      baseSuccessRate: TIER_SUCCESS_RATES[w.tier],
    });
  }

  // ---------- CAPES (Cleric, Mage, Ranger) ----------
  const capeTiers: { tier: number; templateId: string; name: string; threads: number; creations: number }[] = [
    { tier: 1, templateId: 'cape_t1', name: 'Sentinel Cape',  threads: 15,  creations: 1 },
    { tier: 2, templateId: 'cape_t2', name: 'Honor Cape',     threads: 35,  creations: 2 },
    { tier: 3, templateId: 'cape_t3', name: 'Warlord Cape',   threads: 70,  creations: 3 },
    { tier: 4, templateId: 'cape_t4', name: 'Infernal Cape',  threads: 120, creations: 4 },
    { tier: 5, templateId: 'cape_t5', name: 'Eternal Cape',   threads: 250, creations: 6 },
  ];
  for (const c of capeTiers) {
    recipes.push({
      id: `forge_${c.templateId}`,
      name: c.name,
      description: `Forge ${c.name} (Tier ${c.tier}) — for Clerics, Mages, and Rangers.`,
      tier: c.tier,
      category: 'capes',
      allowedClasses: ['CLERIC', 'MAGE', 'RANGER'],
      materials: [
        { templateId: 'material_thread_of_silkworm', name: 'Thread of Silkworm', quantity: c.threads },
        { templateId: 'crystal_creation', name: 'Crystal of Creation', quantity: c.creations },
      ],
      resultTemplateId: c.templateId,
      baseSuccessRate: TIER_SUCCESS_RATES[c.tier],
    });
  }

  // ---------- RANDOM ARMOR (Finger of Titan) ----------
  recipes.push({
    id: 'forge_random_armor',
    name: 'Titan\'s Forge (Random Armor)',
    description: 'Combine 250 Fingers of Titan + 3 Crystals of Creation to forge a random T4 or T5 armor piece for any class.',
    tier: 0,
    category: 'armor',
    allowedClasses: [],
    materials: [
      { templateId: 'material_finger_of_titan', name: 'Finger of Titan', quantity: 250 },
      { templateId: 'crystal_creation', name: 'Crystal of Creation', quantity: 3 },
    ],
    resultTemplateId: null,
    randomPool: 'armor',
    baseSuccessRate: RANDOM_EQUIP_BASE_RATE,
  });

  // ---------- RANDOM WEAPON/SHIELD (Fang of Griffin) ----------
  recipes.push({
    id: 'forge_random_weapon',
    name: 'Griffin\'s Forge (Random Weapon/Shield)',
    description: 'Combine 250 Fangs of Griffin + 3 Crystals of Creation to forge a random T4 or T5 weapon or shield.',
    tier: 0,
    category: 'weapon',
    allowedClasses: [],
    materials: [
      { templateId: 'material_fang_of_griffin', name: 'Fang of Griffin', quantity: 250 },
      { templateId: 'crystal_creation', name: 'Crystal of Creation', quantity: 3 },
    ],
    resultTemplateId: null,
    randomPool: 'weapon_shield',
    baseSuccessRate: RANDOM_EQUIP_BASE_RATE,
  });

  return recipes;
}

let _recipes: ForgeRecipe[] | null = null;

export function getRecipes(): ForgeRecipe[] {
  if (!_recipes) _recipes = buildRecipes();
  return _recipes;
}

export function getRecipe(recipeId: string): ForgeRecipe | undefined {
  return getRecipes().find(r => r.id === recipeId);
}

// ==================== RANDOM EQUIPMENT SELECTION ====================

const ARMOR_SLOTS = ['HEAD', 'CHEST', 'LEGS', 'BOOTS', 'GLOVES'] as const;
const CLASSES = ['PALADIN', 'FIGHTER', 'RANGER', 'CLERIC', 'MAGE'] as const;

function pickRandomArmorTemplate(): ItemTemplate {
  const tier = Math.random() < 0.5 ? 4 : 5;
  const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const slot = ARMOR_SLOTS[Math.floor(Math.random() * ARMOR_SLOTS.length)];
  const id = `${cls.toLowerCase()}_t${tier}_${slot.toLowerCase()}`;
  const template = getItemTemplate(id);
  if (!template) throw new Error(`Armor template not found: ${id}`);
  return template;
}

function pickRandomWeaponOrShieldTemplate(): ItemTemplate {
  const tier = Math.random() < 0.5 ? 4 : 5;
  // Collect all weapon + shield templates at this tier
  const templates = Array.from(getAllItemTemplates().values()).filter(t =>
    t.tier === tier && (t.type === 'WEAPON' || t.type === 'SHIELD')
  );
  if (templates.length === 0) throw new Error(`No weapon/shield templates found for tier ${tier}`);
  return templates[Math.floor(Math.random() * templates.length)];
}

// ==================== FORGING LOGIC ====================

export interface ForgeResult {
  success: boolean;
  message: string;
  forgedItem?: ItemData;
  materialsReturned?: { name: string; quantity: number }[];
  updatedCharacter?: CharacterData;
}

export async function forge(
  userId: string,
  characterId: string,
  recipeId: string,
  extraCrystals?: { spiritCount?: number; dominionCount?: number },
): Promise<ForgeResult> {
  // 1. Load character + validate ownership
  const char = await prisma.character.findFirst({ where: { id: characterId, userId } });
  if (!char) throw new AppError(404, 'Character not found');

  // 2. Resolve recipe
  const recipe = getRecipe(recipeId);
  if (!recipe) throw new AppError(400, `Unknown recipe: ${recipeId}`);

  // 3. Class restriction
  if (recipe.allowedClasses.length > 0 && !recipe.allowedClasses.includes(char.class)) {
    throw new AppError(400, `This recipe is not available for ${char.class} characters.`);
  }

  // 4. Clamp extra crystals to max
  const spiritExtra = Math.min(Math.max(extraCrystals?.spiritCount ?? 0, 0), CRYSTAL_BONUS.crystal_spirit.maxQty);
  const dominionExtra = Math.min(Math.max(extraCrystals?.dominionCount ?? 0, 0), CRYSTAL_BONUS.crystal_dominion.maxQty);

  // 5. Build full material requirements (recipe materials + extra crystals)
  // Key by name (display name) since purchased materials have random UUIDs as data.id
  const requiredMap: Map<string, number> = new Map();
  for (const mat of recipe.materials) {
    requiredMap.set(mat.name, (requiredMap.get(mat.name) || 0) + mat.quantity);
  }
  if (spiritExtra > 0) {
    const spiritTemplate = getItemTemplate('crystal_spirit');
    const spiritName = spiritTemplate?.name || 'Crystal of Spirit';
    requiredMap.set(spiritName, (requiredMap.get(spiritName) || 0) + spiritExtra);
  }
  if (dominionExtra > 0) {
    const dominionTemplate = getItemTemplate('crystal_dominion');
    const dominionName = dominionTemplate?.name || 'Crystal of Dominion';
    requiredMap.set(dominionName, (requiredMap.get(dominionName) || 0) + dominionExtra);
  }

  // 6. Calculate success rate (before transaction — no DB dependency)
  const crystalBonus = spiritExtra * CRYSTAL_BONUS.crystal_spirit.bonusPerCrystal
                     + dominionExtra * CRYSTAL_BONUS.crystal_dominion.bonusPerCrystal;
  const successRate = Math.min(recipe.baseSuccessRate + crystalBonus / 100, 1.0);
  const roll = Math.random();
  const isSuccess = roll < successRate;

  // 7. Determine result item (if success)
  let forgedItemData: ItemData | null = null;
  if (isSuccess) {
    let template: ItemTemplate;
    if (recipe.resultTemplateId) {
      template = getItemTemplate(recipe.resultTemplateId)!;
    } else if (recipe.randomPool === 'armor') {
      template = pickRandomArmorTemplate();
    } else {
      template = pickRandomWeaponOrShieldTemplate();
    }
    // All forged items are always Prestige quality (per design doc)
    const instance = rollFromTemplate(template, { forcePrestige: true });
    forgedItemData = itemInstanceToItemData(instance);
  }

  // 8. Execute in transaction (inventory loaded inside for consistency)
  const bagCapacity = calculateBagCapacity(char.level, char.hasBattlePass);
  const materialsReturned: { name: string; quantity: number }[] = [];

  await prisma.$transaction(async (tx) => {
    // Load inventory INSIDE the transaction so the snapshot is consistent
    const invItems = await tx.inventoryItem.findMany({ where: { characterId } });

    // Map: item name → inventory rows with quantities
    const inventoryByName: Map<string, { invId: string; qty: number; itemData: ItemData }[]> = new Map();
    for (const inv of invItems) {
      const data = toItemData(inv.itemData);
      const itemName = data.name;
      if (!inventoryByName.has(itemName)) {
        inventoryByName.set(itemName, []);
      }
      inventoryByName.get(itemName)!.push({ invId: inv.id, qty: inv.quantity, itemData: data });
    }

    // Verify materials inside the transaction
    for (const [matName, required] of requiredMap) {
      const stacks = inventoryByName.get(matName) || [];
      const available = stacks.reduce((sum, s) => sum + s.qty, 0);
      if (available < required) {
        throw new AppError(400, `Not enough ${matName}. Need ${required}, have ${available}.`);
      }
    }

    // Consume materials
    for (const [matName, required] of requiredMap) {
      let remaining = required;
      const stacks = inventoryByName.get(matName) || [];
      for (const stack of stacks) {
        if (remaining <= 0) break;
        const take = Math.min(remaining, stack.qty);
        remaining -= take;
        if (take >= stack.qty) {
          await tx.inventoryItem.delete({ where: { id: stack.invId } });
        } else {
          await tx.inventoryItem.update({
            where: { id: stack.invId },
            data: { quantity: stack.qty - take },
          });
        }
      }
    }

    // On failure: return 20-70% of returnable primary materials
    // Build a name→templateId lookup for returnable materials
    const returnableNameToTemplate = new Map<string, ItemTemplate>();
    for (const tid of RETURNABLE_MATERIALS) {
      const t = getItemTemplate(tid);
      if (t) returnableNameToTemplate.set(t.name, t);
    }

    if (!isSuccess) {
      for (const [matName, consumed] of requiredMap) {
        const template = returnableNameToTemplate.get(matName);
        if (!template) continue;
        const returnRate = MATERIAL_RETURN_MIN + Math.random() * (MATERIAL_RETURN_MAX - MATERIAL_RETURN_MIN);
        const returned = Math.floor(consumed * returnRate);
        if (returned <= 0) continue;

        // Re-add returned materials to inventory
        const currentItems = await tx.inventoryItem.findMany({ where: { characterId } });

        // Try to stack onto existing material stack (match by name)
        const existingStack = currentItems.find(i => toItemData(i.itemData).name === matName);
        if (existingStack) {
          await tx.inventoryItem.update({
            where: { id: existingStack.id },
            data: { quantity: existingStack.quantity + returned },
          });
        } else {
          const slot = findEmptySlot(currentItems, bagCapacity);
          if (slot) {
            const matItemData: ItemData = {
              id: template.id,
              name: template.name,
              description: template.description,
              type: template.type as ItemType,
              rarity: ItemRarity.REGULAR,
              requiredLevel: 0,
              stackable: true,
              maxStack: template.maxStack,
              sellPrice: template.sellPrice,
              icon: template.icon,
            };
            await tx.inventoryItem.create({
              data: {
                characterId,
                itemId: template.id,
                itemData: toJsonInput(matItemData),
                quantity: returned,
                gridX: slot.x,
                gridY: slot.y,
              },
            });
          }
        }

        materialsReturned.push({ name: template.name, quantity: returned });
      }
    }

    // On success: add the forged item to inventory
    if (isSuccess && forgedItemData) {
      await addItemToInventory(tx, characterId, forgedItemData, 1, bagCapacity);
    }
  });

  // 10. Reload character
  const updatedCharacter = await loadFullCharacter(characterId);

  if (isSuccess) {
    return {
      success: true,
      message: `Forging successful! You created ${forgedItemData!.name}.`,
      forgedItem: forgedItemData!,
      updatedCharacter,
    };
  } else {
    const returnedMsg = materialsReturned.length > 0
      ? ` Recovered: ${materialsReturned.map(m => `${m.quantity}x ${m.name}`).join(', ')}.`
      : ' All materials were consumed.';
    return {
      success: false,
      message: `Forging failed. The materials were consumed.${returnedMsg}`,
      materialsReturned,
      updatedCharacter,
    };
  }
}
