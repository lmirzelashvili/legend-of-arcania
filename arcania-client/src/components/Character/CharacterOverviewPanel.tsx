import React from 'react';
import { Character } from '@/types/game.types';
import { xpRequiredForLevel, MAX_LEVEL, CLASS_INFO } from '@/constants/game.constants';
import EquipmentPreview from '../Equipment/EquipmentPreview';
import { mergeEquipmentSpriteInfo } from '@/config/item-sprite-mapping';
import { PixelPanel, ProgressBar } from '@/components/ui';

interface Props {
  character: Character;
}

const EQUIPMENT_SLOTS = [
  'weapon', 'offHand', 'head', 'chest', 'legs', 'boots',
  'gloves', 'cape', 'wings', 'pendant', 'ring1', 'ring2',
] as const;

const CharacterOverviewPanel: React.FC<Props> = ({ character }) => {
  const equipment = character.equipment || {} as any;
  const spriteInfo = mergeEquipmentSpriteInfo(
    equipment.head,
    equipment.chest,
    equipment.legs,
    equipment.gloves,
    equipment.boots,
    undefined, // shoulders removed
    equipment.cape,
    equipment.wings,
    equipment.weapon,
    equipment.offHand
  );
  const gender = character.gender || 'male';

  const equippedCount = EQUIPMENT_SLOTS.filter(
    (slot) => equipment[slot] != null
  ).length;
  const totalSlots = EQUIPMENT_SLOTS.length;

  return (
    <div className="border-2 border-gray-800 p-1">
    <PixelPanel color="amber">
      <div className="space-y-3">
        {/* Character Name & Info */}
        <div className="text-center">
          <div className="text-amber-400 text-[12px] tracking-wider" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
            {character.name.toUpperCase()}
          </div>
          <div className="flex items-center justify-center gap-2 text-[7px] mt-1">
            <span className="text-amber-500">LV {character.level}</span>
            <span className="text-gray-700">|</span>
            <span className="text-gray-400">{CLASS_INFO[character.class]?.name.toUpperCase()}</span>
          </div>
        </div>

        {/* Character Sprite */}
        <div className="flex justify-center py-1">
          <EquipmentPreview
            race={character.race}
            characterClass={character.class}
            gender={gender}
            scale={3.5}
            showControls={false}
            autoPlay={true}
            hideBackground={true}
            spriteInfo={spriteInfo}
          />
        </div>

        {/* HP Bar */}
        <ProgressBar
          value={character.resources?.currentHp || 0}
          max={character.resources?.maxHp || 1}
          color="red"
          label="HP"
          valueLabel={`${character.resources?.currentHp || 0} / ${character.resources?.maxHp || 1}`}
          height="sm"
        />

        {/* MP Bar */}
        <ProgressBar
          value={character.resources?.currentMana || 0}
          max={character.resources?.maxMana || 1}
          color="blue"
          label="MP"
          valueLabel={`${character.resources?.currentMana || 0} / ${character.resources?.maxMana || 1}`}
          height="sm"
        />

        {/* XP Bar */}
        {character.level >= MAX_LEVEL ? (
          <ProgressBar
            value={1}
            max={1}
            color="purple"
            label={`LV ${character.level}`}
            valueLabel="MAX"
            height="sm"
          />
        ) : (
          <ProgressBar
            value={character.experience || 0}
            max={xpRequiredForLevel(character.level)}
            color="amber"
            label={`LV ${character.level}`}
            valueLabel={`${((character.experience || 0) / xpRequiredForLevel(character.level) * 100).toFixed(0)}%`}
            height="sm"
          />
        )}

        {/* Primary Stats — compact 5-column grid, numbers only */}
        <div className="grid grid-cols-5 gap-1 pt-1 border-t border-gray-800">
          <div className="text-center">
            <div className="text-[7px] text-gray-600 mb-0.5">STR</div>
            <div className="text-[10px] text-red-400 font-bold">{character.primaryStats?.strength || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-[7px] text-gray-600 mb-0.5">AGI</div>
            <div className="text-[10px] text-green-400 font-bold">{character.primaryStats?.agility || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-[7px] text-gray-600 mb-0.5">INT</div>
            <div className="text-[10px] text-purple-400 font-bold">{character.primaryStats?.intelligence || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-[7px] text-gray-600 mb-0.5">VIT</div>
            <div className="text-[10px] text-pink-400 font-bold">{character.primaryStats?.vitality || 0}</div>
          </div>
          <div className="text-center">
            <div className="text-[7px] text-gray-600 mb-0.5">SPR</div>
            <div className="text-[10px] text-cyan-400 font-bold">{character.primaryStats?.spirit || 0}</div>
          </div>
        </div>

        {/* Equipment slot summary */}
        <div className="border-t border-gray-800 pt-2 text-center">
          <span className="text-[9px] text-gray-500">
            <span className="text-amber-400">{equippedCount}</span>
            <span className="text-gray-600"> / {totalSlots}</span>
            {' '}EQUIPPED
          </span>
        </div>
      </div>
    </PixelPanel>
    </div>
  );
};

export default CharacterOverviewPanel;
