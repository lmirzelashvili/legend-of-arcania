import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== QUEST DEFINITIONS ====================

const QUEST_DEFINITIONS = [
  // Social
  { id: 'social_discord_join', title: 'Join Discord', description: 'Join the Arcania Discord server to connect with other players.', category: 'social', targetProgress: 1, reward: { arcanite: 10 }, isRepeatable: false, trackingKey: 'discord_join' },
  { id: 'social_twitter_follow', title: 'Follow on X (Twitter)', description: 'Follow Arcania on X to stay updated with the latest news.', category: 'social', targetProgress: 1, reward: { arcanite: 5 }, isRepeatable: false, trackingKey: 'twitter_follow' },
  { id: 'social_youtube_subscribe', title: 'Subscribe on YouTube', description: 'Subscribe to the Arcania YouTube channel for game content.', category: 'social', targetProgress: 1, reward: { arcanite: 5 }, isRepeatable: false, trackingKey: 'youtube_subscribe' },
  { id: 'social_share', title: 'Share on Social Media', description: 'Share Arcania on any social media platform.', category: 'social', targetProgress: 1, reward: { gold: 2500 }, isRepeatable: false, trackingKey: 'social_share' },

  // Achievement - Combat
  { id: 'achievement_first_blood', title: 'First Blood', description: 'Kill 1 monster.', category: 'achievement', subcategory: 'combat', targetProgress: 1, reward: { gold: 500 }, isRepeatable: false, trackingKey: 'monsters_killed' },
  { id: 'achievement_monster_slayer', title: 'Monster Slayer', description: 'Kill 100 monsters.', category: 'achievement', subcategory: 'combat', targetProgress: 100, reward: { gold: 5000 }, prerequisiteQuestId: 'achievement_first_blood', isRepeatable: false, trackingKey: 'monsters_killed' },
  { id: 'achievement_monster_hunter', title: 'Monster Hunter', description: 'Kill 1,000 monsters.', category: 'achievement', subcategory: 'combat', targetProgress: 1000, reward: { item: 'Box of Cinder' }, prerequisiteQuestId: 'achievement_monster_slayer', isRepeatable: false, trackingKey: 'monsters_killed' },
  { id: 'achievement_elite_hunter', title: 'Elite Hunter', description: 'Kill 10 elite creatures.', category: 'achievement', subcategory: 'combat', targetProgress: 10, reward: { item: 'Box of Ember' }, isRepeatable: false, trackingKey: 'elites_killed' },
  { id: 'achievement_apex_predator', title: 'Apex Predator', description: 'Kill 5 apex creatures.', category: 'achievement', subcategory: 'combat', targetProgress: 5, reward: { item: 'Box of Inferno' }, isRepeatable: false, trackingKey: 'apex_killed' },
  { id: 'achievement_boss_slayer', title: 'Boss Slayer', description: 'Defeat any Dominion Boss.', category: 'achievement', subcategory: 'combat', targetProgress: 1, reward: { arcanite: 25 }, isRepeatable: false, trackingKey: 'bosses_defeated' },
  { id: 'achievement_dominion_conqueror', title: 'Dominion Conqueror', description: 'Defeat all 5 Dominion Bosses.', category: 'achievement', subcategory: 'combat', targetProgress: 5, reward: { arcanite: 100, item: 'Box of Eclipse' }, prerequisiteQuestId: 'achievement_boss_slayer', isRepeatable: false, trackingKey: 'bosses_defeated' },

  // Achievement - Exploration
  { id: 'achievement_explorer', title: 'Explorer', description: 'Visit all Free Realms.', category: 'achievement', subcategory: 'exploration', targetProgress: 1, reward: { item: 'Box of Cinder' }, isRepeatable: false, trackingKey: 'free_realms_visited' },
  { id: 'achievement_dominion_walker', title: 'Dominion Walker', description: 'Enter all Dominions.', category: 'achievement', subcategory: 'exploration', targetProgress: 1, reward: { arcanite: 25 }, isRepeatable: false, trackingKey: 'dominions_entered' },
  { id: 'achievement_outpost_pioneer', title: 'Outpost Pioneer', description: 'Unlock first Outpost.', category: 'achievement', subcategory: 'exploration', targetProgress: 1, reward: { gold: 5000 }, isRepeatable: false, trackingKey: 'outposts_unlocked' },
  { id: 'achievement_outpost_master', title: 'Outpost Master', description: 'Unlock all Outposts.', category: 'achievement', subcategory: 'exploration', targetProgress: 1, reward: { arcanite: 50, item: 'Box of Inferno' }, prerequisiteQuestId: 'achievement_outpost_pioneer', isRepeatable: false, trackingKey: 'all_outposts_unlocked' },

  // Achievement - Progression
  { id: 'achievement_level_10', title: 'Level 10', description: 'Reach level 10.', category: 'achievement', subcategory: 'progression', targetProgress: 10, reward: { item: 'Box of Ash' }, isRepeatable: false, trackingKey: 'character_level' },
  { id: 'achievement_level_25', title: 'Level 25', description: 'Reach level 25.', category: 'achievement', subcategory: 'progression', targetProgress: 25, reward: { item: 'Box of Cinder' }, prerequisiteQuestId: 'achievement_level_10', isRepeatable: false, trackingKey: 'character_level' },
  { id: 'achievement_level_50', title: 'Level 50', description: 'Reach level 50.', category: 'achievement', subcategory: 'progression', targetProgress: 50, reward: { item: 'Box of Ember', arcanite: 15 }, prerequisiteQuestId: 'achievement_level_25', isRepeatable: false, trackingKey: 'character_level' },
  { id: 'achievement_level_75', title: 'Level 75', description: 'Reach level 75.', category: 'achievement', subcategory: 'progression', targetProgress: 75, reward: { item: 'Box of Inferno', arcanite: 50 }, prerequisiteQuestId: 'achievement_level_50', isRepeatable: false, trackingKey: 'character_level' },
  { id: 'achievement_level_85', title: 'Level 85', description: 'Reach max level.', category: 'achievement', subcategory: 'progression', targetProgress: 85, reward: { item: 'Box of Eclipse', arcanite: 150 }, prerequisiteQuestId: 'achievement_level_75', isRepeatable: false, trackingKey: 'character_level' },

  // Achievement - Economy
  { id: 'achievement_first_trade', title: 'First Trade', description: 'Complete a marketplace sale.', category: 'achievement', subcategory: 'economy', targetProgress: 1, reward: { gold: 1000 }, isRepeatable: false, trackingKey: 'marketplace_sales' },
  { id: 'achievement_merchant', title: 'Merchant', description: 'Complete 50 marketplace sales.', category: 'achievement', subcategory: 'economy', targetProgress: 50, reward: { item: 'Box of Ember' }, prerequisiteQuestId: 'achievement_first_trade', isRepeatable: false, trackingKey: 'marketplace_sales' },
  { id: 'achievement_tycoon', title: 'Tycoon', description: 'Earn 1,000,000 Gold total.', category: 'achievement', subcategory: 'economy', targetProgress: 1000000, reward: { arcanite: 50 }, isRepeatable: false, trackingKey: 'total_gold_earned' },

  // Achievement - Social
  { id: 'achievement_party_up', title: 'Party Up', description: 'Join your first party.', category: 'achievement', subcategory: 'social_achievement', targetProgress: 1, reward: { gold: 1000 }, isRepeatable: false, trackingKey: 'parties_joined' },
  { id: 'achievement_team_player', title: 'Team Player', description: 'Complete 50 party sessions (10+ min each).', category: 'achievement', subcategory: 'social_achievement', targetProgress: 50, reward: { arcanite: 10 }, prerequisiteQuestId: 'achievement_party_up', isRepeatable: false, trackingKey: 'party_sessions' },
  { id: 'achievement_social_butterfly', title: 'Social Butterfly', description: 'Add 25 friends.', category: 'achievement', subcategory: 'social_achievement', targetProgress: 25, reward: { item: 'Box of Cinder' }, isRepeatable: false, trackingKey: 'friends_added' },

  // Daily
  { id: 'daily_login', title: 'Daily Check-in', description: 'Log in to the game today.', category: 'daily', targetProgress: 1, reward: { gold: 500, xp: 50 }, isRepeatable: true, resetPeriod: 'daily', trackingKey: 'daily_login' },
  { id: 'daily_visit_marketplace', title: 'Window Shopping', description: 'Visit the marketplace.', category: 'daily', targetProgress: 1, reward: { gold: 250 }, isRepeatable: true, resetPeriod: 'daily', trackingKey: 'marketplace_visited' },
  { id: 'daily_equip_item', title: 'Gear Up', description: 'Equip or change any item.', category: 'daily', targetProgress: 1, reward: { gold: 300, xp: 25 }, isRepeatable: true, resetPeriod: 'daily', trackingKey: 'items_equipped' },
  { id: 'daily_view_stats', title: 'Know Thyself', description: 'View your character stats.', category: 'daily', targetProgress: 1, reward: { gold: 200 }, isRepeatable: true, resetPeriod: 'daily', trackingKey: 'stats_viewed' },

  // Weekly
  { id: 'weekly_login_streak', title: 'Dedicated Player', description: 'Log in for 5 days this week.', category: 'weekly', targetProgress: 5, reward: { gold: 3000, arcanite: 5 }, isRepeatable: true, resetPeriod: 'weekly', trackingKey: 'weekly_logins' },
  { id: 'weekly_purchases', title: 'Big Spender', description: 'Make 3 purchases from the marketplace this week.', category: 'weekly', targetProgress: 3, reward: { gold: 2000, arcanite: 3 }, isRepeatable: true, resetPeriod: 'weekly', trackingKey: 'weekly_purchases' },
  { id: 'weekly_inventory_management', title: 'Organized', description: 'Manage your inventory 5 times this week.', category: 'weekly', targetProgress: 5, reward: { gold: 1500, xp: 200 }, isRepeatable: true, resetPeriod: 'weekly', trackingKey: 'inventory_actions' },
  { id: 'weekly_character_management', title: 'Character Builder', description: 'Spend stat points or ability points 3 times this week.', category: 'weekly', targetProgress: 3, reward: { gold: 2000, xp: 300 }, isRepeatable: true, resetPeriod: 'weekly', trackingKey: 'stat_changes' },

  // Referral
  { id: 'referral_first', title: 'First Referral', description: '1 referred player reaches level 10.', category: 'referral', targetProgress: 1, reward: { arcanite: 10 }, isRepeatable: false, trackingKey: 'referrals_qualified' },
  { id: 'referral_recruiter', title: 'Recruiter', description: '5 referred players reach level 10.', category: 'referral', targetProgress: 5, reward: { arcanite: 50 }, prerequisiteQuestId: 'referral_first', isRepeatable: false, trackingKey: 'referrals_qualified' },
  { id: 'referral_ambassador', title: 'Ambassador', description: '10 referred players reach level 10.', category: 'referral', targetProgress: 10, reward: { arcanite: 100, item: 'Box of Inferno' }, prerequisiteQuestId: 'referral_recruiter', isRepeatable: false, trackingKey: 'referrals_qualified' },
];

// ==================== ITEM CATALOG ====================

function generateItemCatalog() {
  const items: Array<{
    id: string; name: string; description: string;
    type: string; rarity: string; isPrestige: boolean;
    requiredLevel: number; requiredClass?: string; equipmentSlot?: string;
    stats: Record<string, number>; stackable: boolean; maxStack: number;
    sellPrice: number; icon?: string;
  }> = [];

  // Consumables
  const consumables: { id: string; name: string; level: number; stats: Record<string, number>; price: number; prestige?: boolean }[] = [
    { id: 'elixir_of_life_sm', name: 'Elixir of Life (SM)', level: 1, stats: { maxHp: 50 }, price: 25 },
    { id: 'elixir_of_life_md', name: 'Elixir of Life (MD)', level: 20, stats: { maxHp: 150 }, price: 75 },
    { id: 'elixir_of_life_lg', name: 'Elixir of Life (LG)', level: 40, stats: { maxHp: 400 }, price: 200 },
    { id: 'elixir_of_life_xl', name: 'Elixir of Life (XL)', level: 60, stats: { maxHp: 800 }, price: 500, prestige: true },
    { id: 'elixir_of_mana_sm', name: 'Elixir of Mana (SM)', level: 1, stats: { maxMana: 30 }, price: 25 },
    { id: 'elixir_of_mana_md', name: 'Elixir of Mana (MD)', level: 20, stats: { maxMana: 100 }, price: 75 },
    { id: 'elixir_of_mana_lg', name: 'Elixir of Mana (LG)', level: 40, stats: { maxMana: 250 }, price: 200 },
    { id: 'elixir_of_mana_xl', name: 'Elixir of Mana (XL)', level: 60, stats: { maxMana: 500 }, price: 500, prestige: true },
  ];

  for (const c of consumables) {
    items.push({
      id: c.id, name: c.name, description: `Restores ${Object.values(c.stats)[0]} ${Object.keys(c.stats)[0] === 'maxHp' ? 'HP' : 'Mana'} instantly.`,
      type: 'CONSUMABLE', rarity: c.prestige ? 'PRESTIGE' : 'REGULAR', isPrestige: !!c.prestige,
      requiredLevel: c.level, stats: c.stats, stackable: true, maxStack: 99, sellPrice: c.price,
    });
  }

  // Weapons
  const weaponSets = [
    { class: 'PALADIN', slot: 'WEAPON', weapons: [
      { id: 'paladin_iron_mace', name: 'Iron Mace', level: 1 },
      { id: 'paladin_azure_mace', name: 'Azure Mace', level: 20 },
      { id: 'paladin_noble_mace', name: 'Noble Mace', level: 40 },
      { id: 'paladin_colossus_mace', name: 'Colossus Mace', level: 60 },
      { id: 'paladin_dawn_breaker', name: 'Dawn Breaker', level: 80 },
    ]},
    { class: 'PALADIN', slot: 'OFF_HAND', weapons: [
      { id: 'paladin_iron_shield', name: 'Iron Shield', level: 1 },
      { id: 'paladin_bastion_shield', name: 'Bastion Shield', level: 20 },
      { id: 'paladin_golden_bulwark', name: 'Golden Bulwark', level: 40 },
      { id: 'paladin_glorious_shield', name: 'Glorious Shield', level: 60 },
      { id: 'paladin_titans_aegis', name: "Titan's Aegis", level: 80 },
    ]},
    { class: 'FIGHTER', slot: 'WEAPON', weapons: [
      { id: 'fighter_iron_sword', name: 'Iron Sword', level: 1 },
      { id: 'fighter_battle_spear', name: 'Battle Spear', level: 20 },
      { id: 'fighter_flame_sword', name: 'Flame Sword', level: 40 },
      { id: 'fighter_dark_scythe', name: 'Dark Scythe', level: 60 },
      { id: 'fighter_executioner', name: 'Executioner', level: 80 },
    ]},
    { class: 'FIGHTER', slot: 'OFF_HAND', weapons: [
      { id: 'fighter_iron_dagger', name: 'Iron Dagger', level: 1 },
      { id: 'fighter_parrying_dagger', name: 'Parrying Dagger', level: 20 },
      { id: 'fighter_assassin_blade', name: 'Assassin Blade', level: 40 },
      { id: 'fighter_soul_ripper', name: 'Soul Ripper', level: 60 },
      { id: 'fighter_void_fang', name: 'Void Fang', level: 80 },
    ]},
    { class: 'RANGER', slot: 'WEAPON', weapons: [
      { id: 'ranger_short_bow', name: 'Short Bow', level: 1 },
      { id: 'ranger_hunters_bow', name: 'Hunters Bow', level: 20 },
      { id: 'ranger_golden_crossbow', name: 'Golden Crossbow', level: 40 },
      { id: 'ranger_legendary_bow', name: 'Legendary Bow', level: 60 },
      { id: 'ranger_titan_bow', name: 'Titan Bow', level: 80 },
    ]},
    { class: 'CLERIC', slot: 'WEAPON', weapons: [
      { id: 'cleric_oak_staff', name: 'Oak Staff', level: 1 },
      { id: 'cleric_healing_staff', name: 'Healing Staff', level: 20 },
      { id: 'cleric_anias_staff', name: 'Anias Staff', level: 40 },
      { id: 'cleric_angel_wing', name: 'Angel Wing', level: 60 },
      { id: 'cleric_archangel', name: 'Archangel', level: 80 },
    ]},
    { class: 'MAGE', slot: 'WEAPON', weapons: [
      { id: 'mage_oak_staff', name: 'Oak Staff', level: 1 },
      { id: 'mage_arcane_staff', name: 'Arcane Staff', level: 20 },
      { id: 'mage_anias_staff', name: 'Anias Staff', level: 40 },
      { id: 'mage_eclipse_staff', name: 'Eclipse Staff', level: 60 },
      { id: 'mage_void_staff', name: 'Void Staff', level: 80 },
    ]},
  ];

  for (const set of weaponSets) {
    const isShield = set.slot === 'OFF_HAND' && set.class === 'PALADIN';
    for (const w of set.weapons) {
      const isPrestige = w.level >= 60;
      const baseDmg = Math.floor(w.level * 1.2) + 10;
      const stats: Record<string, number> = {};

      if (isShield) {
        stats.physicalDefense = Math.floor(w.level * 0.8) + 5 + 10;
        stats.vitality = Math.floor(w.level / 15) + 2;
      } else {
        stats.physicalAttack = set.slot === 'OFF_HAND' ? Math.floor(baseDmg * 0.6) : baseDmg;
        stats.strength = Math.floor(w.level / 15) + 2;
      }

      items.push({
        id: w.id, name: w.name,
        description: `A ${w.level >= 60 ? 'legendary' : w.level >= 40 ? 'powerful' : 'standard'} ${isShield ? 'shield' : 'weapon'} for ${set.class.toLowerCase()}s.`,
        type: 'WEAPON', rarity: isPrestige ? 'PRESTIGE' : 'REGULAR', isPrestige,
        requiredLevel: w.level, requiredClass: set.class, equipmentSlot: set.slot,
        stats, stackable: false, maxStack: 1, sellPrice: (w.level * 50 + 100) * (isPrestige ? 6 : 2),
      });
    }
  }

  // Accessories
  const rings = [
    { id: 'copper_ring', name: 'Copper Ring', level: 1, stat: 'strength', value: 2 },
    { id: 'silver_ring', name: 'Silver Ring', level: 20, stat: 'agility', value: 5 },
    { id: 'gold_ring', name: 'Gold Ring', level: 40, stat: 'intelligence', value: 8 },
    { id: 'ruby_ring', name: 'Ruby Ring', level: 60, stat: 'vitality', value: 12 },
    { id: 'diamond_ring', name: 'Diamond Ring', level: 80, stat: 'spirit', value: 18 },
  ];

  for (const ring of rings) {
    const isPrestige = ring.level >= 60;
    items.push({
      id: ring.id, name: ring.name, description: `A ring that enhances ${ring.stat}.`,
      type: 'ACCESSORY', rarity: isPrestige ? 'PRESTIGE' : 'REGULAR', isPrestige,
      requiredLevel: ring.level, equipmentSlot: 'RING_1',
      stats: { [ring.stat]: ring.value },
      stackable: false, maxStack: 1, sellPrice: ring.level * 50 + 100 + (isPrestige ? (ring.level * 50 + 100) * 2 : 0),
    });
  }

  const necklaces = [
    { id: 'leather_pendant', name: 'Leather Pendant', level: 1, hp: 20, mana: 10 },
    { id: 'silver_amulet', name: 'Silver Amulet', level: 20, hp: 50, mana: 30 },
    { id: 'gold_medallion', name: 'Gold Medallion', level: 40, hp: 100, mana: 60 },
    { id: 'emerald_necklace', name: 'Emerald Necklace', level: 60, hp: 180, mana: 100 },
    { id: 'void_amulet', name: 'Void Amulet', level: 80, hp: 300, mana: 150 },
  ];

  for (const n of necklaces) {
    const isPrestige = n.level >= 60;
    items.push({
      id: n.id, name: n.name, description: 'An amulet that increases health and mana.',
      type: 'ACCESSORY', rarity: isPrestige ? 'PRESTIGE' : 'REGULAR', isPrestige,
      requiredLevel: n.level, equipmentSlot: 'NECK',
      stats: { vitality: Math.floor(n.hp / 10), spirit: Math.floor(n.mana / 10) },
      stackable: false, maxStack: 1, sellPrice: n.level * 50 + 100 + (isPrestige ? (n.level * 50 + 100) * 2 : 0),
    });
  }

  return items;
}

// ==================== MAIN SEED ====================

async function main() {
  console.log('Seeding database...');

  // Seed quest definitions
  console.log('Seeding quest definitions...');
  for (const quest of QUEST_DEFINITIONS) {
    await prisma.questDefinition.upsert({
      where: { id: quest.id },
      update: quest as any,
      create: quest as any,
    });
  }
  console.log(`  ${QUEST_DEFINITIONS.length} quest definitions seeded`);

  // Seed item catalog
  console.log('Seeding item catalog...');
  const itemCatalog = generateItemCatalog();
  for (const item of itemCatalog) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        name: item.name, description: item.description || '', type: item.type,
        rarity: item.rarity, isPrestige: item.isPrestige || false,
        requiredLevel: item.requiredLevel, requiredClass: item.requiredClass,
        equipmentSlot: item.equipmentSlot, stats: item.stats || {},
        stackable: item.stackable, maxStack: item.maxStack, sellPrice: item.sellPrice,
        icon: item.icon,
      },
      create: {
        id: item.id, name: item.name, description: item.description || '', type: item.type,
        rarity: item.rarity, isPrestige: item.isPrestige || false,
        requiredLevel: item.requiredLevel, requiredClass: item.requiredClass,
        equipmentSlot: item.equipmentSlot, stats: item.stats || {},
        stackable: item.stackable, maxStack: item.maxStack, sellPrice: item.sellPrice,
        icon: item.icon,
      },
    });
  }
  console.log(`  ${itemCatalog.length} items seeded`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
