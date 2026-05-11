import { CharacterClass, type AbilityData } from '../types/index.js';

export const STARTING_ABILITIES: Record<string, AbilityData[]> = {
  [CharacterClass.PALADIN]: [
    { id: 'paladin_divine_shield', name: 'Divine Shield', class: CharacterClass.PALADIN, description: 'Protect yourself with holy light.', cooldown: 30, manaCost: 50, isUltimate: false, unlockLevel: 1, effects: [{ type: 'shield', value: 200, duration: 5, description: 'Absorbs 200 damage for 5 seconds' }] },
    { id: 'paladin_consecration', name: 'Consecration', class: CharacterClass.PALADIN, description: 'Consecrate the ground around you.', cooldown: 15, manaCost: 30, isUltimate: false, unlockLevel: 1, effects: [{ type: 'aoe_damage', value: 50, duration: 8, description: 'Deals 50 holy damage per second' }] },
    { id: 'paladin_righteous_strike', name: 'Righteous Strike', class: CharacterClass.PALADIN, description: 'A powerful holy strike.', cooldown: 8, manaCost: 20, isUltimate: false, unlockLevel: 1, effects: [{ type: 'damage', value: 150, description: 'Deals 150% weapon damage as holy' }] },
  ],
  [CharacterClass.CLERIC]: [
    { id: 'cleric_holy_light', name: 'Holy Light', class: CharacterClass.CLERIC, description: 'Heal a friendly target.', cooldown: 5, manaCost: 25, isUltimate: false, unlockLevel: 1, effects: [{ type: 'heal', value: 100, description: 'Heals for 100 HP' }] },
    { id: 'cleric_blessing', name: 'Blessing of Protection', class: CharacterClass.CLERIC, description: 'Bless an ally with protection.', cooldown: 20, manaCost: 40, isUltimate: false, unlockLevel: 1, effects: [{ type: 'buff', value: 20, duration: 15, description: '+20% defense for 15 seconds' }] },
    { id: 'cleric_purify', name: 'Purify', class: CharacterClass.CLERIC, description: 'Remove negative effects.', cooldown: 12, manaCost: 30, isUltimate: false, unlockLevel: 1, effects: [{ type: 'dispel', value: 1, description: 'Removes all debuffs' }] },
  ],
  [CharacterClass.MAGE]: [
    { id: 'mage_fireball', name: 'Fireball', class: CharacterClass.MAGE, description: 'Hurl a ball of fire.', cooldown: 6, manaCost: 25, isUltimate: false, unlockLevel: 1, effects: [{ type: 'damage', value: 120, description: 'Deals 120 fire damage' }] },
    { id: 'mage_frost_nova', name: 'Frost Nova', class: CharacterClass.MAGE, description: 'Freeze enemies around you.', cooldown: 15, manaCost: 35, isUltimate: false, unlockLevel: 1, effects: [{ type: 'aoe_damage', value: 80, description: 'Deals 80 frost damage and slows' }] },
    { id: 'mage_arcane_missiles', name: 'Arcane Missiles', class: CharacterClass.MAGE, description: 'Channel arcane energy.', cooldown: 3, manaCost: 15, isUltimate: false, unlockLevel: 1, effects: [{ type: 'damage', value: 45, description: 'Deals 3x45 arcane damage' }] },
  ],
  [CharacterClass.FIGHTER]: [
    { id: 'fighter_crushing_blow', name: 'Crushing Blow', class: CharacterClass.FIGHTER, description: 'A devastating attack.', cooldown: 8, manaCost: 20, isUltimate: false, unlockLevel: 1, effects: [{ type: 'damage', value: 180, description: 'Deals 180% weapon damage' }] },
    { id: 'fighter_whirlwind', name: 'Whirlwind', class: CharacterClass.FIGHTER, description: 'Spin and hit all nearby enemies.', cooldown: 12, manaCost: 30, isUltimate: false, unlockLevel: 1, effects: [{ type: 'aoe_damage', value: 100, description: 'Deals 100% weapon damage to all nearby' }] },
    { id: 'fighter_battle_cry', name: 'Battle Cry', class: CharacterClass.FIGHTER, description: 'Boost your attack power.', cooldown: 25, manaCost: 25, isUltimate: false, unlockLevel: 1, effects: [{ type: 'buff', value: 30, duration: 10, description: '+30% attack for 10 seconds' }] },
  ],
  [CharacterClass.RANGER]: [
    { id: 'ranger_power_shot', name: 'Power Shot', class: CharacterClass.RANGER, description: 'A powerful arrow.', cooldown: 6, manaCost: 20, isUltimate: false, unlockLevel: 1, effects: [{ type: 'damage', value: 150, description: 'Deals 150% ranged damage' }] },
    { id: 'ranger_evasive_roll', name: 'Evasive Roll', class: CharacterClass.RANGER, description: 'Roll to evade attacks.', cooldown: 10, manaCost: 15, isUltimate: false, unlockLevel: 1, effects: [{ type: 'dodge', value: 100, duration: 1, description: 'Become immune for 1 second' }] },
    { id: 'ranger_multi_shot', name: 'Multi-Shot', class: CharacterClass.RANGER, description: 'Fire multiple arrows.', cooldown: 15, manaCost: 35, isUltimate: false, unlockLevel: 1, effects: [{ type: 'damage', value: 80, description: 'Hit up to 5 targets for 80% damage each' }] },
  ],
};

export const ADVANCED_ABILITIES: Record<string, AbilityData[]> = {
  [CharacterClass.PALADIN]: [
    { id: 'paladin_holy_wrath', name: 'Holy Wrath', class: CharacterClass.PALADIN, description: 'Ultimate: Unleash divine fury.', cooldown: 120, manaCost: 100, isUltimate: true, unlockLevel: 10, effects: [{ type: 'damage', value: 500, description: 'Massive holy damage to all enemies' }] },
  ],
  [CharacterClass.CLERIC]: [
    { id: 'cleric_resurrection', name: 'Resurrection', class: CharacterClass.CLERIC, description: 'Ultimate: Bring back a fallen ally.', cooldown: 300, manaCost: 200, isUltimate: true, unlockLevel: 10, effects: [{ type: 'revive', value: 50, description: 'Revive with 50% HP' }] },
  ],
  [CharacterClass.MAGE]: [
    { id: 'mage_meteor', name: 'Meteor', class: CharacterClass.MAGE, description: 'Ultimate: Call down a meteor.', cooldown: 120, manaCost: 150, isUltimate: true, unlockLevel: 10, effects: [{ type: 'damage', value: 800, description: 'Devastating area damage' }] },
  ],
  [CharacterClass.FIGHTER]: [
    { id: 'fighter_execute', name: 'Execute', class: CharacterClass.FIGHTER, description: 'Ultimate: Finish off weakened enemies.', cooldown: 90, manaCost: 80, isUltimate: true, unlockLevel: 10, effects: [{ type: 'damage', value: 1000, description: 'Instant kill below 20% HP' }] },
  ],
  [CharacterClass.RANGER]: [
    { id: 'ranger_rain_of_arrows', name: 'Rain of Arrows', class: CharacterClass.RANGER, description: 'Ultimate: Blanket an area with arrows.', cooldown: 90, manaCost: 100, isUltimate: true, unlockLevel: 10, effects: [{ type: 'damage', value: 300, description: 'Hit all enemies in area for 300% damage' }] },
  ],
};
