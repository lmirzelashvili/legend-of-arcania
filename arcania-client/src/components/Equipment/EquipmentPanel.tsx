import React, { useState } from 'react';
import { Race, Class } from '@/types/game.types';
import EquipmentPreview from './EquipmentPreview';

// Equipment item definition
interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  material: string;
}

// Weapon item definition (includes level)
interface WeaponItem {
  id: string;
  name: string;
  type: string;
  level: number;
}

// Shield item definition
interface ShieldItem {
  id: string;
  name: string;
  type: string;
  variant?: string;  // For kite shields that have color variants
  level: number;
}

// Paladin armor set definitions
interface ArmorSet {
  name: string;
  level: number;
  helmet: string;
  helmetMaterial: string;
  torso: string;
  torsoMaterial: string;
  legs: string;
  legsMaterial: string;
  arms: string;
  armsMaterial: string;
  boots: string;
  bootsMaterial: string;
}

// Individual equipment pieces
const HELMETS: EquipmentItem[] = [
  { id: 'black-iron-helm', name: 'Black Iron Nasal Helm', type: 'nasal', material: 'iron' },
  { id: 'silver-guardian-helm', name: 'Silver Guardian Barbuta', type: 'barbuta', material: 'silver' },
  { id: 'immortal-plate-helm', name: 'Immortal Plate Greathelm', type: 'greathelm', material: 'steel' },
  { id: 'great-crusader-helm', name: 'Great Crusader Sugarloaf', type: 'sugarloaf', material: 'gold' },
  { id: 'eternal-titan-helm', name: 'Eternal Titan Maximus', type: 'maximus', material: 'ceramic' },
];

const CHEST_ARMOR: EquipmentItem[] = [
  { id: 'black-iron-chest', name: 'Black Iron Plate', type: 'plate', material: 'iron' },
  { id: 'silver-guardian-chest', name: 'Silver Guardian Plate', type: 'plate', material: 'silver' },
  { id: 'immortal-plate-chest', name: 'Immortal Plate Cuirass', type: 'plate', material: 'steel' },
  { id: 'great-crusader-chest', name: 'Great Crusader Plate', type: 'plate', material: 'gold' },
  { id: 'eternal-titan-chest', name: 'Eternal Titan Plate', type: 'plate', material: 'ceramic' },
];

const LEG_ARMOR: EquipmentItem[] = [
  { id: 'black-iron-legs', name: 'Black Iron Greaves', type: 'plate', material: 'iron' },
  { id: 'silver-guardian-legs', name: 'Silver Guardian Greaves', type: 'plate', material: 'silver' },
  { id: 'immortal-plate-legs', name: 'Immortal Plate Greaves', type: 'plate', material: 'steel' },
  { id: 'great-crusader-legs', name: 'Great Crusader Greaves', type: 'plate', material: 'gold' },
  { id: 'eternal-titan-legs', name: 'Eternal Titan Greaves', type: 'plate', material: 'ceramic' },
];

const GLOVES: EquipmentItem[] = [
  { id: 'black-iron-gloves', name: 'Black Iron Gauntlets', type: 'plate', material: 'iron' },
  { id: 'silver-guardian-gloves', name: 'Silver Guardian Gauntlets', type: 'plate', material: 'silver' },
  { id: 'immortal-plate-gloves', name: 'Immortal Plate Gauntlets', type: 'plate', material: 'steel' },
  { id: 'great-crusader-gloves', name: 'Great Crusader Gauntlets', type: 'plate', material: 'gold' },
  { id: 'eternal-titan-gloves', name: 'Eternal Titan Gauntlets', type: 'plate', material: 'ceramic' },
];

const BOOTS: EquipmentItem[] = [
  { id: 'black-iron-boots', name: 'Black Iron Sabatons', type: 'plate', material: 'iron' },
  { id: 'silver-guardian-boots', name: 'Silver Guardian Sabatons', type: 'plate', material: 'silver' },
  { id: 'immortal-plate-boots', name: 'Immortal Plate Sabatons', type: 'plate', material: 'steel' },
  { id: 'great-crusader-boots', name: 'Great Crusader Sabatons', type: 'plate', material: 'gold' },
  { id: 'eternal-titan-boots', name: 'Eternal Titan Sabatons', type: 'plate', material: 'ceramic' },
];

// Paladin weapons (5 maces for different levels)
const PALADIN_MACES: WeaponItem[] = [
  { id: 'iron-mace', name: 'Iron Mace', type: 'mace', level: 1 },
  { id: 'knights-mace', name: "Knight's Mace", type: 'mace', level: 20 },
  { id: 'morning-star', name: 'Morning Star', type: 'flail', level: 40 },
  { id: 'warhammer', name: 'Warhammer', type: 'waraxe', level: 60 },
  { id: 'anias-hammer', name: "Anias's Hammer", type: 'waraxe', level: 80 },
];

// Paladin shields (5 shields for different levels)
const PALADIN_SHIELDS: ShieldItem[] = [
  { id: 'iron-shield', name: 'Iron Shield', type: 'round', variant: 'round_black', level: 1 },
  { id: 'bastion-shield', name: 'Bastion Shield', type: 'kite', variant: 'kite_blue_gray', level: 20 },
  { id: 'golden-bulwark', name: 'Golden Bulwark', type: 'kite', variant: 'kite_orange', level: 40 },
  { id: 'glorious-shield', name: 'Glorious Shield', type: 'crusader', level: 60 },
  { id: 'titans-aegis', name: "Titan's Aegis", type: 'heater', level: 80 },
];

const PALADIN_SETS: ArmorSet[] = [
  {
    name: 'Black Iron Set',
    level: 1,
    helmet: 'nasal',
    helmetMaterial: 'iron',
    torso: 'plate',
    torsoMaterial: 'iron',
    legs: 'plate',
    legsMaterial: 'iron',
    arms: 'plate',
    armsMaterial: 'iron',
    boots: 'plate',
    bootsMaterial: 'iron',
  },
  {
    name: 'Silver Guardian Set',
    level: 25,
    helmet: 'barbuta',
    helmetMaterial: 'silver',
    torso: 'plate',
    torsoMaterial: 'silver',
    legs: 'plate',
    legsMaterial: 'silver',
    arms: 'plate',
    armsMaterial: 'silver',
    boots: 'plate',
    bootsMaterial: 'silver',
  },
  {
    name: 'Immortal Plate Set',
    level: 50,
    helmet: 'greathelm',
    helmetMaterial: 'steel',
    torso: 'plate',
    torsoMaterial: 'steel',
    legs: 'plate',
    legsMaterial: 'steel',
    arms: 'plate',
    armsMaterial: 'steel',
    boots: 'plate',
    bootsMaterial: 'steel',
  },
  {
    name: 'Great Crusader Set',
    level: 70,
    helmet: 'sugarloaf',
    helmetMaterial: 'gold',
    torso: 'plate',
    torsoMaterial: 'gold',
    legs: 'plate',
    legsMaterial: 'gold',
    arms: 'plate',
    armsMaterial: 'gold',
    boots: 'plate',
    bootsMaterial: 'gold',
  },
  {
    name: 'Eternal Titan Set',
    level: 85,
    helmet: 'maximus',
    helmetMaterial: 'ceramic',
    torso: 'plate',
    torsoMaterial: 'ceramic',
    legs: 'plate',
    legsMaterial: 'ceramic',
    arms: 'plate',
    armsMaterial: 'ceramic',
    boots: 'plate',
    bootsMaterial: 'ceramic',
  },
];

const EquipmentPanel: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<Class>(Class.PALADIN);
  const [selectedRace, setSelectedRace] = useState<Race>(Race.HUMAN);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [selectedSetIndex, setSelectedSetIndex] = useState<number>(0);

  // Equipment slots - now using IDs
  const [selectedWeaponId, setSelectedWeaponId] = useState<string>('iron-mace');
  const [selectedShieldId, setSelectedShieldId] = useState<string>('iron-shield');
  const [selectedHelmetId, setSelectedHelmetId] = useState<string>('black-iron-helm');
  const [selectedChestId, setSelectedChestId] = useState<string>('black-iron-chest');
  const [selectedLegsId, setSelectedLegsId] = useState<string>('black-iron-legs');
  const [selectedGlovesId, setSelectedGlovesId] = useState<string>('black-iron-gloves');
  const [selectedBootsId, setSelectedBootsId] = useState<string>('black-iron-boots');

  const classes: Class[] = [Class.PALADIN, Class.CLERIC, Class.MAGE, Class.FIGHTER, Class.RANGER];
  const races: Race[] = [Race.HUMAN, Race.LUMINAR, Race.LILIN, Race.DARKAN];

  // Helper functions to get equipment details from IDs
  const getWeapon = () => PALADIN_MACES.find(w => w.id === selectedWeaponId);
  const getShield = () => PALADIN_SHIELDS.find(s => s.id === selectedShieldId);
  const getHelmet = () => HELMETS.find(h => h.id === selectedHelmetId);
  const getChest = () => CHEST_ARMOR.find(c => c.id === selectedChestId);
  const getLegs = () => LEG_ARMOR.find(l => l.id === selectedLegsId);
  const getGloves = () => GLOVES.find(g => g.id === selectedGlovesId);
  const getBoots = () => BOOTS.find(b => b.id === selectedBootsId);

  const weaponItem = getWeapon();
  const shieldItem = getShield();
  const helmet = getHelmet();
  const chest = getChest();
  const legsArmor = getLegs();
  const gloves = getGloves();
  const bootsArmor = getBoots();

  // Function to equip a full armor set
  const equipSet = (setIndex: number) => {
    setSelectedSetIndex(setIndex);
    // Map set index to equipment IDs
    const equipmentIds = [
      'black-iron',
      'silver-guardian',
      'immortal-plate',
      'great-crusader',
      'eternal-titan'
    ];
    const prefix = equipmentIds[setIndex];
    setSelectedHelmetId(`${prefix}-helm`);
    setSelectedChestId(`${prefix}-chest`);
    setSelectedLegsId(`${prefix}-legs`);
    setSelectedGlovesId(`${prefix}-gloves`);
    setSelectedBootsId(`${prefix}-boots`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card p-6">
        <h2 className="text-3xl font-bold text-arcania-gold mb-4">
          ⚔️ Equipment Preview
        </h2>
        <p className="text-gray-300 mb-4">
          Create and preview equipment sets for each class. Start by selecting a class and customizing their gear!
        </p>
      </div>

      {/* Armor Set Selection */}
      <div className="card p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
        <h3 className="text-2xl font-bold text-arcania-gold mb-4">Paladin Armor Sets</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {PALADIN_SETS.map((set, index) => (
            <button
              key={index}
              onClick={() => equipSet(index)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedSetIndex === index
                  ? 'border-arcania-gold bg-arcania-gold/20'
                  : 'border-gray-600 bg-gray-800/50 hover:border-arcania-gold/50'
              }`}
            >
              <div className="text-center">
                <div className={`text-lg font-bold ${selectedSetIndex === index ? 'text-arcania-gold' : 'text-white'}`}>
                  {set.name}
                </div>
                <div className="text-sm text-gray-400 mt-1">Level {set.level}</div>
                <div className="text-xs text-gray-500 mt-2 capitalize">{set.torsoMaterial}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Character Selection */}
      <div className="card p-6">
        <h3 className="text-2xl font-bold text-arcania-gold mb-4">Character Selection</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as Class)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
            >
              {classes.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Race Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Race</label>
            <select
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value as Race)}
              className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
            >
              {races.map((race) => (
                <option key={race} value={race}>{race}</option>
              ))}
            </select>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Gender</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value as 'male' | 'female')}
              className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Equipment Slots */}
        <div className="card p-6">
          <h3 className="text-2xl font-bold text-arcania-gold mb-4">Equipment Slots</h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {/* Current Set Info */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded p-3 mb-4">
              <div className="text-sm text-gray-300">
                <strong className="text-arcania-gold">Current Set:</strong> {PALADIN_SETS[selectedSetIndex].name}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Level {PALADIN_SETS[selectedSetIndex].level} - {PALADIN_SETS[selectedSetIndex].torsoMaterial}
              </div>
            </div>

            {/* Weapon Selection */}
            <div className="bg-gray-800/50 p-3 rounded">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Weapon</label>
              <select
                value={selectedWeaponId}
                onChange={(e) => setSelectedWeaponId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {PALADIN_MACES.map((mace) => (
                  <option key={mace.id} value={mace.id}>
                    {mace.name} (Level {mace.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Shield Selection */}
            <div className="bg-gray-800/50 p-3 rounded">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Shield</label>
              <select
                value={selectedShieldId}
                onChange={(e) => setSelectedShieldId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {PALADIN_SHIELDS.map((shieldOption) => (
                  <option key={shieldOption.id} value={shieldOption.id}>
                    {shieldOption.name} (Level {shieldOption.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Helmet Selection */}
            <div className="bg-gray-800/50 p-3 rounded">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Helmet</label>
              <select
                value={selectedHelmetId}
                onChange={(e) => setSelectedHelmetId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {HELMETS.map((helm) => (
                  <option key={helm.id} value={helm.id}>{helm.name}</option>
                ))}
              </select>
            </div>

            {/* Chest Armor Selection */}
            <div className="bg-gray-800/50 p-3 rounded">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Chest Armor</label>
              <select
                value={selectedChestId}
                onChange={(e) => setSelectedChestId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {CHEST_ARMOR.map((chestPiece) => (
                  <option key={chestPiece.id} value={chestPiece.id}>{chestPiece.name}</option>
                ))}
              </select>
            </div>

            {/* Leg Armor Selection */}
            <div className="bg-gray-800/50 p-3 rounded">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Leg Armor</label>
              <select
                value={selectedLegsId}
                onChange={(e) => setSelectedLegsId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {LEG_ARMOR.map((legPiece) => (
                  <option key={legPiece.id} value={legPiece.id}>{legPiece.name}</option>
                ))}
              </select>
            </div>

            {/* Gloves Selection */}
            <div className="bg-gray-800/50 p-3 rounded">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Gloves</label>
              <select
                value={selectedGlovesId}
                onChange={(e) => setSelectedGlovesId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {GLOVES.map((glovePiece) => (
                  <option key={glovePiece.id} value={glovePiece.id}>{glovePiece.name}</option>
                ))}
              </select>
            </div>

            {/* Boots Selection */}
            <div className="bg-gray-800/50 p-3 rounded">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Boots</label>
              <select
                value={selectedBootsId}
                onChange={(e) => setSelectedBootsId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              >
                <option value="">None</option>
                {BOOTS.map((bootPiece) => (
                  <option key={bootPiece.id} value={bootPiece.id}>{bootPiece.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Character Preview */}
        <div className="card p-6">
          <h3 className="text-2xl font-bold text-arcania-gold mb-4">Preview</h3>

          <div className="flex flex-col items-center gap-4">
            <EquipmentPreview
              race={selectedRace}
              characterClass={selectedClass}
              gender={selectedGender}
              weapon={weaponItem?.type}
              shield={shieldItem?.variant || shieldItem?.type}
              helmet={helmet?.type}
              helmetMaterial={helmet?.material}
              torso={chest?.type}
              torsoMaterial={chest?.material}
              legs={legsArmor?.type}
              legsMaterial={legsArmor?.material}
              arms={gloves?.type}
              armsMaterial={gloves?.material}
              boots={bootsArmor?.type}
              bootsMaterial={bootsArmor?.material}
              scale={3}
              showControls={true}
            />

            <div className="text-sm text-gray-400">
              <strong className="text-arcania-gold">Equipped:</strong>
              <ul className="mt-2 space-y-1">
                {weaponItem && <li>Weapon: {weaponItem.name}</li>}
                {shieldItem && <li>Shield: {shieldItem.name}</li>}
                {helmet && <li>Helmet: {helmet.name}</li>}
                {chest && <li>Chest: {chest.name}</li>}
                {legsArmor && <li>Legs: {legsArmor.name}</li>}
                {gloves && <li>Gloves: {gloves.name}</li>}
                {bootsArmor && <li>Boots: {bootsArmor.name}</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPanel;
