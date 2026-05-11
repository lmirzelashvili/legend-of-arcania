import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Race, Class, AnimationType } from '@/types/game.types';
import EquipmentPreview from '@/components/Equipment/EquipmentPreview';
import {
  CLASS_ARMOR_SETS,
  ArmorSetDefinition,
  getArmorPropsFromSet,
} from '@/constants/armor.constants';
import {
  CLASS_WEAPON_SETS,
  WeaponSetDefinition,
  getWeaponPropsFromSet,
  PALADIN_WEAPONS,
  OffHandType,
  ShieldAsset,
} from '@/constants/weapon.constants';
import { RACE_CLASS_COMPATIBILITY } from '@/constants/game.constants';
import {
  CAPE_ITEMS,
  WING_ITEMS,
  SHIELD_ITEMS,
  canEquipCape,
  canEquipWings,
} from '@/constants/equipment.constants';

type Gender = 'male' | 'female';

const RACES = [Race.HUMAN, Race.LUMINAR, Race.LILIN, Race.DARKAN];
const CLASSES = [Class.PALADIN, Class.FIGHTER, Class.RANGER, Class.CLERIC, Class.MAGE];

const CLASS_RACE_COMPATIBILITY: Record<Class, Race[]> = {
  [Class.PALADIN]: RACES.filter(race => RACE_CLASS_COMPATIBILITY[race].includes(Class.PALADIN)),
  [Class.CLERIC]: RACES.filter(race => RACE_CLASS_COMPATIBILITY[race].includes(Class.CLERIC)),
  [Class.MAGE]: RACES.filter(race => RACE_CLASS_COMPATIBILITY[race].includes(Class.MAGE)),
  [Class.FIGHTER]: RACES.filter(race => RACE_CLASS_COMPATIBILITY[race].includes(Class.FIGHTER)),
  [Class.RANGER]: RACES.filter(race => RACE_CLASS_COMPATIBILITY[race].includes(Class.RANGER)),
};

const GENDERS: Gender[] = ['male', 'female'];
const ANIMATIONS: AnimationType[] = [
  AnimationType.IDLE,
  AnimationType.WALK,
  AnimationType.SLASH,
  AnimationType.THRUST,
  AnimationType.SPELLCAST,
  AnimationType.SHOOT,
];

const RACE_NAMES: Record<Race, string> = {
  [Race.HUMAN]: 'Human',
  [Race.LUMINAR]: 'Luminar',
  [Race.LILIN]: 'Lilin',
  [Race.DARKAN]: 'Darkan',
};

const CLASS_NAMES: Record<Class, string> = {
  [Class.PALADIN]: 'Paladin',
  [Class.FIGHTER]: 'Fighter',
  [Class.RANGER]: 'Ranger',
  [Class.CLERIC]: 'Cleric',
  [Class.MAGE]: 'Mage',
};

// Panel Component
const Panel: React.FC<{
  children: React.ReactNode;
  title?: string;
  color?: 'amber' | 'gray' | 'purple' | 'green';
  className?: string;
}> = ({ children, title, color = 'gray', className = '' }) => {
  const borderColor =
    color === 'amber' ? 'from-amber-600 to-amber-500' :
    color === 'purple' ? 'from-purple-600 to-purple-500' :
    color === 'green' ? 'from-green-600 to-green-500' :
    'from-gray-700 to-gray-600';

  const titleColor =
    color === 'amber' ? 'text-amber-400' :
    color === 'purple' ? 'text-purple-400' :
    color === 'green' ? 'text-green-400' :
    'text-gray-400';

  return (
    <div className={`relative ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${borderColor}`} style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
      }}></div>
      <div className="absolute inset-[4px] bg-black"></div>
      <div className="relative p-6">
        {title && (
          <div className={`${titleColor} text-[10px] mb-4 pb-2 border-b-2 border-gray-800 tracking-widest`}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Select Component
const Select: React.FC<{
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: { value: string | number; label: string }[];
  disabled?: boolean;
  hint?: string;
}> = ({ label, value, onChange, options, disabled, hint }) => (
  <div>
    <label className="block text-gray-500 text-[8px] mb-2 tracking-wider">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-black border-2 border-gray-800 px-2 py-2 text-gray-300 text-[8px] focus:outline-none focus:border-amber-600 disabled:opacity-50 font-pixel"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {hint && <p className="text-[6px] text-yellow-400 mt-1">{hint}</p>}
  </div>
);

// Toggle Component
const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange: _onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group">
    <div className={`relative w-8 h-4 ${checked ? 'bg-amber-600' : 'bg-gray-800'} border-2 border-gray-700 transition-colors`}>
      <div className={`absolute top-0 h-full w-3 bg-white transition-all ${checked ? 'left-4' : 'left-0'}`}></div>
    </div>
    <span className="text-[8px] text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
  </label>
);

const TestEquipment: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRace, setSelectedRace] = useState<Race>(Race.HUMAN);
  const [selectedClass, setSelectedClass] = useState<Class>(Class.PALADIN);
  const [selectedGender, setSelectedGender] = useState<Gender>('male');
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationType>(AnimationType.WALK);
  const [selectedArmorSetIndex, setSelectedArmorSetIndex] = useState<number>(0);
  const [selectedWeaponSetIndex, setSelectedWeaponSetIndex] = useState<number>(0);
  const [selectedCapeIndex, setSelectedCapeIndex] = useState<number>(-1);
  const [selectedWingsIndex, setSelectedWingsIndex] = useState<number>(-1);
  const [selectedShieldIndex, setSelectedShieldIndex] = useState<number>(-1);
  const [showAllSets, setShowAllSets] = useState<boolean>(false);
  const [showAllClasses, setShowAllClasses] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  const validRaces = useMemo(() => CLASS_RACE_COMPATIBILITY[selectedClass] || RACES, [selectedClass]);

  useEffect(() => {
    if (!validRaces.includes(selectedRace)) {
      setSelectedRace(validRaces[0]);
    }
  }, [selectedClass, validRaces, selectedRace]);

  const armorSets = useMemo(() => CLASS_ARMOR_SETS[selectedClass] || [], [selectedClass]);
  const weaponSets = useMemo(() => CLASS_WEAPON_SETS[selectedClass] || [], [selectedClass]);

  const currentArmorSet = armorSets[selectedArmorSetIndex];
  const currentWeaponSet = weaponSets[selectedWeaponSetIndex];
  const currentCape = selectedCapeIndex >= 0 ? CAPE_ITEMS[selectedCapeIndex] : null;
  const currentWings = selectedWingsIndex >= 0 ? WING_ITEMS[selectedWingsIndex] : null;
  const currentShield = selectedShieldIndex >= 0 ? SHIELD_ITEMS[selectedShieldIndex] : null;

  // Map SHIELD_ITEMS to weapon_sets shield paths (they correspond 1:1 by index)
  const shieldProps = useMemo(() => {
    if (selectedShieldIndex < 0 || selectedShieldIndex >= PALADIN_WEAPONS.length) return null;
    const weapon = PALADIN_WEAPONS[selectedShieldIndex];
    if (!weapon.offHand || weapon.offHandType !== OffHandType.SHIELD) return null;
    const shield = weapon.offHand as ShieldAsset;
    const type = shield.path.split('/').pop() || '';
    return { shield: type, shieldColor: shield.color, shieldPath: shield.path };
  }, [selectedShieldIndex]);

  const classCanEquipShield = selectedClass === Class.PALADIN || selectedClass === Class.FIGHTER;
  const armorProps = currentArmorSet ? getArmorPropsFromSet(currentArmorSet) : {};
  const weaponProps = currentWeaponSet ? getWeaponPropsFromSet(currentWeaponSet) : {};
  const classCanEquipCape = canEquipCape(selectedClass);
  const classCanEquipWings = canEquipWings(selectedClass);
  const effectiveGender = selectedRace === Race.LILIN ? 'female' : selectedGender;

  const renderCharacterPreview = (
    race: Race,
    characterClass: Class,
    gender: Gender,
    armorSet?: ArmorSetDefinition,
    weaponSet?: WeaponSetDefinition,
    label?: string,
    capeItem?: typeof CAPE_ITEMS[0] | null,
    wingsItem?: typeof WING_ITEMS[0] | null,
    isSelected?: boolean
  ) => {
    const armor = armorSet ? getArmorPropsFromSet(armorSet) : {};
    const weapon = weaponSet ? getWeaponPropsFromSet(weaponSet) : {};
    const effectiveGenderForRace = race === Race.LILIN ? 'female' : gender;
    const showCape = capeItem && canEquipCape(characterClass);
    const showWings = wingsItem && canEquipWings(characterClass);

    return (
      <div className={`relative cursor-pointer group ${isSelected ? 'z-10' : ''}`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${isSelected ? 'from-amber-600 to-amber-500 animate-pulse' : 'from-gray-700 to-gray-600 group-hover:from-gray-600 group-hover:to-gray-500'} transition-all`}></div>
        <div className="absolute inset-[3px] bg-black"></div>
        <div className="relative p-3 flex flex-col items-center">
          <EquipmentPreview
            race={race}
            characterClass={characterClass}
            gender={effectiveGenderForRace}
            scale={2}
            showControls={false}
            animation={selectedAnimation}
            autoPlay={autoPlay}
            hideBackground={true}
            torso={armor.torso}
            torsoMaterial={armor.torsoMaterial}
            legs={armor.legs}
            legsMaterial={armor.legsMaterial}
            boots={armor.boots}
            bootsMaterial={armor.bootsMaterial}
            arms={armor.arms}
            armsMaterial={armor.armsMaterial}
            helmet={armor.helmet}
            helmetMaterial={armor.helmetMaterial}
            shoulders={armor.shoulders}
            shouldersMaterial={armor.shouldersMaterial}
            bracers={armor.bracers}
            bracersMaterial={armor.bracersMaterial}
            cape={showCape ? 'solid' : armor.cape}
            capeColor={showCape ? capeItem.spriteColor : armor.capeColor}
            wings={showWings ? wingsItem.spritePath.split('/wings/')[1]?.split('/')[0] : ''}
            wingsColor={showWings ? wingsItem.spriteColor : ''}
            weapon={weapon.weapon}
            weaponColor={weapon.weaponColor}
            weaponPath={weapon.weaponPath}
            shield={weapon.shield}
            shieldColor={weapon.shieldColor}
            shieldPath={weapon.shieldPath}
          />
          {label && (
            <div className="text-[6px] text-gray-400 text-center mt-2 whitespace-pre-line">
              {label}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-pixel">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Panel color="amber">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/character-management')}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600 group-hover:from-amber-600 group-hover:to-amber-500 transition-all"></div>
                <div className="absolute inset-[2px] bg-black"></div>
                <div className="relative px-4 py-2 text-[8px] text-gray-400 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>◄</span> BACK
                </div>
              </button>
              <div>
                <h1 className="text-amber-400 text-[14px] tracking-wider">EQUIPMENT PREVIEW</h1>
                <p className="text-gray-600 text-[8px] mt-2">TEST ARMOR & WEAPONS ON CHARACTERS</p>
              </div>
            </div>
            <div className="text-right text-[8px] text-gray-500">
              <div>{validRaces.length} RACES</div>
              <div>{armorSets.length} ARMOR SETS</div>
              <div>{weaponSets.length} WEAPONS</div>
            </div>
          </div>
        </Panel>

        <div className="grid grid-cols-12 gap-6">
          {/* Controls Sidebar */}
          <div className="col-span-3 space-y-4">
            {/* Character Selection */}
            <Panel title="CHARACTER" color="gray">
              <div className="space-y-4">
                <Select
                  label="CLASS"
                  value={selectedClass}
                  onChange={(v) => {
                    setSelectedClass(v as Class);
                    setSelectedArmorSetIndex(0);
                    setSelectedWeaponSetIndex(0);
                  }}
                  options={CLASSES.map(cls => ({ value: cls, label: CLASS_NAMES[cls].toUpperCase() }))}
                />
                <Select
                  label="RACE"
                  value={selectedRace}
                  onChange={(v) => setSelectedRace(v as Race)}
                  options={validRaces.map(race => ({ value: race, label: RACE_NAMES[race].toUpperCase() }))}
                />
                <Select
                  label="GENDER"
                  value={selectedGender}
                  onChange={(v) => setSelectedGender(v as Gender)}
                  options={GENDERS.map(g => ({ value: g, label: g.toUpperCase() }))}
                  disabled={selectedRace === Race.LILIN}
                  hint={selectedRace === Race.LILIN ? 'LILIN IS FEMALE-ONLY' : undefined}
                />
                <Select
                  label="ANIMATION"
                  value={selectedAnimation}
                  onChange={(v) => setSelectedAnimation(v as AnimationType)}
                  options={ANIMATIONS.map(a => ({ value: a, label: a.toUpperCase() }))}
                />
              </div>
            </Panel>

            {/* Equipment Selection */}
            <Panel title="EQUIPMENT" color="gray">
              <div className="space-y-4">
                <Select
                  label={`ARMOR (${armorSets.length})`}
                  value={selectedArmorSetIndex}
                  onChange={(v) => setSelectedArmorSetIndex(parseInt(v))}
                  options={[
                    { value: -1, label: 'NO ARMOR' },
                    ...armorSets.map((set, i) => ({ value: i, label: `${set.displayName.toUpperCase()} LV.${set.requiredLevel}` }))
                  ]}
                />
                <Select
                  label={`WEAPON (${weaponSets.length})`}
                  value={selectedWeaponSetIndex}
                  onChange={(v) => setSelectedWeaponSetIndex(parseInt(v))}
                  options={[
                    { value: -1, label: 'NO WEAPON' },
                    ...weaponSets.map((set, i) => ({ value: i, label: `${set.displayName.toUpperCase()} LV.${set.requiredLevel}` }))
                  ]}
                />
              </div>
            </Panel>

            {/* Accessories */}
            <Panel title="ACCESSORIES" color="gray">
              <div className="space-y-4">
                <Select
                  label="CAPE"
                  value={selectedCapeIndex}
                  onChange={(v) => setSelectedCapeIndex(parseInt(v))}
                  options={[
                    { value: -1, label: 'NO CAPE' },
                    ...CAPE_ITEMS.map((cape, i) => ({ value: i, label: `${cape.name.toUpperCase()} LV.${cape.requiredLevel}` }))
                  ]}
                  disabled={!classCanEquipCape}
                  hint={!classCanEquipCape ? 'RANGER, CLERIC, MAGE ONLY' : undefined}
                />
                <Select
                  label="WINGS"
                  value={selectedWingsIndex}
                  onChange={(v) => setSelectedWingsIndex(parseInt(v))}
                  options={[
                    { value: -1, label: 'NO WINGS' },
                    ...WING_ITEMS.map((wing, i) => ({ value: i, label: `${wing.name.toUpperCase()} LV.${wing.requiredLevel}` }))
                  ]}
                  disabled={!classCanEquipWings}
                  hint={!classCanEquipWings ? 'PALADIN, FIGHTER ONLY' : undefined}
                />
                <Select
                  label="SHIELD"
                  value={selectedShieldIndex}
                  onChange={(v) => setSelectedShieldIndex(parseInt(v))}
                  options={[
                    { value: -1, label: 'NO SHIELD' },
                    ...SHIELD_ITEMS.map((shield, i) => ({ value: i, label: `${shield.name.toUpperCase()} LV.${shield.requiredLevel}` }))
                  ]}
                  disabled={!classCanEquipShield}
                  hint={!classCanEquipShield ? 'PALADIN, FIGHTER ONLY' : undefined}
                />
              </div>
            </Panel>

            {/* Options */}
            <Panel title="OPTIONS" color="gray">
              <div className="space-y-3">
                <Toggle label="AUTO-PLAY" checked={autoPlay} onChange={setAutoPlay} />
                <Toggle label="SHOW ALL SETS" checked={showAllSets} onChange={setShowAllSets} />
                <Toggle label="SHOW ALL CLASSES" checked={showAllClasses} onChange={setShowAllClasses} />
              </div>
            </Panel>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            {/* Main Preview */}
            <Panel title="CURRENT SELECTION" color="amber">
              <div className="flex gap-8">
                {/* Large Preview */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-500"></div>
                    <div className="absolute inset-[3px] bg-gray-900"></div>
                    <div className="relative p-4">
                      <EquipmentPreview
                        race={selectedRace}
                        characterClass={selectedClass}
                        gender={effectiveGender}
                        scale={4}
                        showControls={true}
                        animation={selectedAnimation}
                        autoPlay={autoPlay}
                        hideBackground={false}
                        torso={armorProps.torso}
                        torsoMaterial={armorProps.torsoMaterial}
                        legs={armorProps.legs}
                        legsMaterial={armorProps.legsMaterial}
                        boots={armorProps.boots}
                        bootsMaterial={armorProps.bootsMaterial}
                        arms={armorProps.arms}
                        armsMaterial={armorProps.armsMaterial}
                        helmet={armorProps.helmet}
                        helmetMaterial={armorProps.helmetMaterial}
                        shoulders={armorProps.shoulders}
                        shouldersMaterial={armorProps.shouldersMaterial}
                        bracers={armorProps.bracers}
                        bracersMaterial={armorProps.bracersMaterial}
                        cape={currentCape && classCanEquipCape ? 'solid' : armorProps.cape}
                        capeColor={currentCape && classCanEquipCape ? currentCape.spriteColor : armorProps.capeColor}
                        wings={currentWings && classCanEquipWings ? currentWings.spritePath.split('/wings/')[1]?.split('/')[0] : ''}
                        wingsColor={currentWings && classCanEquipWings ? currentWings.spriteColor : ''}
                        weapon={weaponProps.weapon}
                        weaponColor={weaponProps.weaponColor}
                        weaponPath={weaponProps.weaponPath}
                        shield={shieldProps && classCanEquipShield ? shieldProps.shield : ''}
                        shieldColor={shieldProps && classCanEquipShield ? shieldProps.shieldColor : ''}
                        shieldPath={shieldProps && classCanEquipShield ? shieldProps.shieldPath : undefined}
                      />
                    </div>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-amber-400 text-[8px] mb-3 pb-2 border-b-2 border-gray-800">CHARACTER</div>
                      <div className="space-y-2 text-[8px]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">RACE:</span>
                          <span className="text-white">{RACE_NAMES[selectedRace].toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">CLASS:</span>
                          <span className="text-white">{CLASS_NAMES[selectedClass].toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">GENDER:</span>
                          <span className="text-white">{effectiveGender.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-amber-400 text-[8px] mb-3 pb-2 border-b-2 border-gray-800">EQUIPMENT</div>
                      <div className="space-y-2 text-[8px]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ARMOR:</span>
                          <span className="text-white">{currentArmorSet?.displayName?.toUpperCase() || 'NONE'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">WEAPON:</span>
                          <span className="text-white">{currentWeaponSet?.displayName?.toUpperCase() || 'NONE'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">CAPE:</span>
                          <span className="text-white">{currentCape && classCanEquipCape ? currentCape.name.toUpperCase() : 'NONE'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">WINGS:</span>
                          <span className="text-white">{currentWings && classCanEquipWings ? currentWings.name.toUpperCase() : 'NONE'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">SHIELD:</span>
                          <span className="text-white">{currentShield && classCanEquipShield ? currentShield.name.toUpperCase() : 'NONE'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Panel>

            {/* Race Comparison */}
            <Panel title={`VALID RACES FOR ${CLASS_NAMES[selectedClass].toUpperCase()}`} color="purple">
              <div className="grid grid-cols-4 gap-4">
                {validRaces.map((race) => {
                  const raceGender = race === Race.LILIN ? 'female' : effectiveGender;
                  return (
                    <div
                      key={race}
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => setSelectedRace(race)}
                    >
                      <div className="text-[8px] text-gray-400 mb-2">{RACE_NAMES[race].toUpperCase()}</div>
                      {renderCharacterPreview(
                        race,
                        selectedClass,
                        raceGender,
                        currentArmorSet,
                        currentWeaponSet,
                        undefined,
                        currentCape,
                        currentWings,
                        race === selectedRace
                      )}
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Gender Comparison */}
            {selectedRace !== Race.LILIN && (
              <Panel title="GENDER COMPARISON" color="gray">
                <div className="flex justify-center gap-8">
                  {GENDERS.map((gender) => (
                    <div
                      key={gender}
                      className="flex flex-col items-center cursor-pointer"
                      onClick={() => setSelectedGender(gender)}
                    >
                      <div className="text-[8px] text-gray-400 mb-2">{gender.toUpperCase()}</div>
                      {renderCharacterPreview(
                        selectedRace,
                        selectedClass,
                        gender,
                        currentArmorSet,
                        currentWeaponSet,
                        undefined,
                        currentCape,
                        currentWings,
                        gender === selectedGender
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* All Armor Sets */}
            {showAllSets && (
              <Panel title={`ALL ${CLASS_NAMES[selectedClass].toUpperCase()} ARMOR SETS`} color="green">
                <div className="grid grid-cols-5 gap-3">
                  {armorSets.map((set, index) => (
                    <div
                      key={set.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedArmorSetIndex(index)}
                    >
                      {renderCharacterPreview(
                        selectedRace,
                        selectedClass,
                        effectiveGender,
                        set,
                        currentWeaponSet,
                        `${set.displayName.toUpperCase()}\nLV.${set.requiredLevel}`,
                        currentCape,
                        currentWings,
                        index === selectedArmorSetIndex
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* All Weapon Sets */}
            {showAllSets && (
              <Panel title={`ALL ${CLASS_NAMES[selectedClass].toUpperCase()} WEAPONS`} color="green">
                <div className="grid grid-cols-5 gap-3">
                  {weaponSets.map((set, index) => (
                    <div
                      key={set.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedWeaponSetIndex(index)}
                    >
                      {renderCharacterPreview(
                        selectedRace,
                        selectedClass,
                        effectiveGender,
                        currentArmorSet,
                        set,
                        `${set.displayName.toUpperCase()}\nLV.${set.requiredLevel}`,
                        currentCape,
                        currentWings,
                        index === selectedWeaponSetIndex
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* All Classes */}
            {showAllClasses && (
              <Panel title="ALL CLASSES (HIGHEST TIER)" color="purple">
                <div className="grid grid-cols-5 gap-4">
                  {CLASSES.map((cls) => {
                    const classArmorSets = CLASS_ARMOR_SETS[cls];
                    const classWeaponSets = CLASS_WEAPON_SETS[cls];
                    const lastArmorSet = classArmorSets[classArmorSets.length - 1];
                    const lastWeaponSet = classWeaponSets[classWeaponSets.length - 1];
                    const classValidRaces = CLASS_RACE_COMPATIBILITY[cls];
                    const displayRace = classValidRaces.includes(selectedRace) ? selectedRace : classValidRaces[0];
                    const displayGender = displayRace === Race.LILIN ? 'female' : effectiveGender;

                    return (
                      <div
                        key={cls}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => {
                          setSelectedClass(cls);
                          setSelectedArmorSetIndex(classArmorSets.length - 1);
                          setSelectedWeaponSetIndex(classWeaponSets.length - 1);
                        }}
                      >
                        <div className="text-[8px] text-gray-400 mb-1">{CLASS_NAMES[cls].toUpperCase()}</div>
                        <div className="text-[6px] text-gray-600 mb-2">{RACE_NAMES[displayRace].toUpperCase()}</div>
                        {renderCharacterPreview(
                          displayRace,
                          cls,
                          displayGender,
                          lastArmorSet,
                          lastWeaponSet,
                          `${lastArmorSet?.displayName?.toUpperCase() || 'BASE'}`,
                          currentCape,
                          currentWings,
                          cls === selectedClass
                        )}
                      </div>
                    );
                  })}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestEquipment;
