import React from 'react';
import { Race } from '@/types/game.types';
import {
  RACE_INFO,
  CLASS_INFO,
  STAT_NAMES,
  StatBonuses,
} from '@/constants/game.constants';
import EquipmentPreview from '../../Equipment/EquipmentPreview';
import { StepProps, Gender } from './types';

const CustomizeStep: React.FC<StepProps> = ({ state, onUpdateState, sounds }) => {
  const { selectedRace, selectedClass, selectedGender, name } = state;
  if (!selectedRace || !selectedClass) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-gray-500 text-[10px] mb-2">STEP 3 OF 4</div>
        <div className="text-amber-400 text-lg">CUSTOMIZE YOUR HERO</div>
        <div className="text-gray-600 text-[8px] mt-2">Choose your appearance and name</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Character Preview */}
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 border border-white/[0.08]" />
            <div className="relative p-8">
              <EquipmentPreview
                race={selectedRace}
                characterClass={selectedClass}
                gender={selectedGender}
                scale={4}
                showControls={false}
                autoPlay={true}
                hideBackground={true}
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div className="text-amber-500 text-[10px] mb-3">
            {selectedRace === Race.LILIN ? 'GENDER (RACE LOCKED)' : 'SELECT GENDER'}
          </div>
          {selectedRace === Race.LILIN ? (
            <div className="flex gap-4">
              <div className="relative">
                <div className="absolute inset-0 border-2 border-purple-500" />
                <div className="absolute inset-[2px] bg-black" />
                <div className="relative px-6 py-3 text-[10px] text-purple-400 flex items-center gap-2">
                  <span>FEMALE</span>
                  <span className="text-[8px] text-gray-500">◆ LILIN ONLY</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              {(['male', 'female'] as Gender[]).map((gender) => (
                <button
                  key={gender}
                  onClick={() => {
                    sounds.playClick();
                    onUpdateState({ selectedGender: gender });
                  }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 border-2 ${
                    selectedGender === gender
                      ? 'border-amber-500'
                      : 'border-gray-600 group-hover:border-gray-500'
                  } transition-all`} />
                  <div className="absolute inset-[2px] bg-black" />
                  <div className={`relative px-6 py-3 text-[10px] ${
                    selectedGender === gender ? 'text-amber-400' : 'text-gray-400'
                  }`}>
                    {gender.toUpperCase()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name & Info */}
        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-amber-500 text-[10px] mb-2">CHARACTER NAME</label>
            <div className="relative">
              <div className="absolute inset-0 border-2 border-gray-600" />
              <div className="absolute inset-[2px] bg-gray-950/50" />
              <input
                type="text"
                className="relative w-full bg-transparent px-4 py-3 text-amber-400 text-[12px] focus:outline-none placeholder-gray-600 font-pixel"
                placeholder="Enter a unique name"
                value={name}
                onChange={(e) => onUpdateState({ name: e.target.value })}
                maxLength={20}
              />
            </div>
            <div className="text-[7px] text-gray-600 mt-2">3-20 characters, letters, numbers, underscores</div>
          </div>

          {/* Summary */}
          <div className="relative">
            <div className="absolute inset-0 border-2 border-gray-700" />
            <div className="absolute inset-[2px] bg-gray-950/50" />

            <div className="relative p-4 space-y-3">
              <div className="text-amber-500 text-[10px]">CHARACTER SUMMARY</div>

              <div className="grid grid-cols-2 gap-2 text-[8px]">
                <div className="text-gray-600">RACE:</div>
                <div className="text-gray-300">{RACE_INFO[selectedRace].name}</div>

                <div className="text-gray-600">CLASS:</div>
                <div className="text-gray-300">{CLASS_INFO[selectedClass].name}</div>

                <div className="text-gray-600">ROLE:</div>
                <div className="text-gray-300">{CLASS_INFO[selectedClass].role}</div>

                <div className="text-gray-600">GENDER:</div>
                <div className="text-gray-300">{selectedGender.toUpperCase()}</div>
              </div>

              <div className="border-t border-gray-800 pt-3 grid grid-cols-2 gap-2">
                <div>
                  <div className="text-amber-500 text-[8px] mb-2">BASE STATS</div>
                  <div className="grid grid-cols-2 gap-x-0 gap-y-1">
                    {(Object.keys(RACE_INFO[selectedRace].baseStats) as (keyof StatBonuses)[]).map((stat) => (
                      <div key={stat} className="flex items-center gap-2 text-[7px]">
                        <span className={`text-${STAT_NAMES[stat].color}-400`}>{STAT_NAMES[stat].abbr}</span>
                        <span className="text-gray-400">{RACE_INFO[selectedRace].baseStats[stat]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-amber-500 text-[8px] mb-2">RACIAL BONUSES</div>
                  {RACE_INFO[selectedRace].bonuses.map((bonus, i) => (
                    <div key={i} className="text-green-400 text-[7px]">• {bonus}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeStep;
