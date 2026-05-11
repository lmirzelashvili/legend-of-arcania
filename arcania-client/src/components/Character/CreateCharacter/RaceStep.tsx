import React from 'react';
import { Race } from '@/types/game.types';
import { RACE_INFO, STAT_NAMES, StatBonuses, RACE_CLASS_COMPATIBILITY } from '@/constants/game.constants';
import EquipmentPreview from '../../Equipment/EquipmentPreview';
import { StepProps, Gender } from './types';

const RaceStep: React.FC<StepProps> = ({ state, onUpdateState, sounds }) => {
  const { selectedRace, selectedGender } = state;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-gray-500 text-[10px] mb-2">STEP 1 OF 4</div>
        <div className="text-amber-400 text-lg">CHOOSE YOUR RACE</div>
        <div className="text-gray-600 text-[8px] mt-2">Each race has unique attributes and bonuses</div>
      </div>

      {/* Gender Selection */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-4">
          {(['male', 'female'] as Gender[]).map((gender) => {
            const isLocked = selectedRace === Race.LILIN && gender === 'male';
            return (
              <button
                key={gender}
                onClick={() => {
                  if (isLocked) return;
                  sounds.playClick();
                  onUpdateState({ selectedGender: gender });
                }}
                disabled={isLocked}
                className={`relative group ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className={`absolute inset-0 border-2 ${
                  selectedGender === gender
                    ? 'border-amber-500'
                    : 'border-gray-600 group-hover:border-gray-500'
                } transition-all`} />
                <div className="absolute inset-[2px] bg-black" />
                <div className={`relative px-5 py-2 text-[9px] flex items-center ${
                  selectedGender === gender ? 'text-amber-400' : 'text-gray-400'
                }`}>
                  {gender.toUpperCase()}
                  {isLocked && <span className="ml-1 text-[7px] text-gray-600 leading-none">🔒</span>}
                </div>
              </button>
            );
          })}
        </div>
        {selectedRace === Race.LILIN && (
          <span className="text-[7px] text-purple-400 mt-4">◆ LILIN FEMALE ONLY</span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(Race).map((race) => {
          const info = RACE_INFO[race];
          const isSelected = selectedRace === race;

          return (
            <div
              key={race}
              onClick={() => {
                sounds.playSelect();
                onUpdateState({ selectedRace: race });
                if (race === Race.LILIN) {
                  onUpdateState({ selectedGender: 'female' });
                }
              }}
              className="relative cursor-pointer group"
            >
              <div className={`absolute inset-0 border-[3px] transition-all ${
                isSelected
                  ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'border-gray-700 group-hover:border-gray-500'
              }`} />
              <div className="absolute inset-[3px] bg-black" />

              <div className="relative p-4 h-full flex flex-col">
                <div className="flex justify-center h-32 mb-2">
                  <div className="-mt-5">
                    <EquipmentPreview
                      race={race}
                      characterClass={RACE_CLASS_COMPATIBILITY[race][0]}
                      gender={race === Race.LILIN ? 'female' : selectedGender}
                      scale={2}
                      showControls={false}
                      autoPlay={true}
                      hideBackground={true}
                    />
                  </div>
                </div>

                <div className={`text-center text-[12px] mb-2 ${isSelected ? 'text-amber-400' : 'text-gray-300'}`}>
                  {info.name.toUpperCase()}
                </div>

                <div className="text-center text-[7px] text-gray-500 flex-grow">
                  {info.identity}
                </div>

                <div className="grid grid-cols-3 gap-2 text-[8px] mt-3">
                  <div className="text-center">
                    <div className="text-red-400 font-bold">{info.baseStats.strength}</div>
                    <div className="text-gray-500">STR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">{info.baseStats.agility}</div>
                    <div className="text-gray-500">AGI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">{info.baseStats.intelligence}</div>
                    <div className="text-gray-500">INT</div>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 text-amber-400 text-[10px]">◆</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Race Details */}
      {selectedRace && (
        <div className="relative mt-6">
          <div className="absolute inset-0 border-2 border-gray-700" />
          <div className="absolute inset-[2px] bg-gray-950/50" />

          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row gap-14">
              <div className="lg:flex-1">
                <div className="text-amber-500 text-[10px] mb-2">LORE</div>
                <div className="text-gray-400 text-[8px] leading-relaxed">
                  {RACE_INFO[selectedRace].lore}
                </div>
              </div>

              <div className="flex gap-8 lg:gap-10">
                <div>
                  <div className="text-amber-500 text-[10px] mb-2">BASE STATS</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {(Object.keys(RACE_INFO[selectedRace].baseStats) as (keyof StatBonuses)[]).map((stat) => (
                      <div key={stat} className="flex items-center gap-2 text-[8px]">
                        <span className={`text-${STAT_NAMES[stat].color}-400`}>{STAT_NAMES[stat].abbr}</span>
                        <span className="text-gray-400">{RACE_INFO[selectedRace].baseStats[stat]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-amber-500 text-[10px] mb-2">RACIAL BONUSES</div>
                  <div className="space-y-1">
                    {RACE_INFO[selectedRace].bonuses.map((bonus, i) => (
                      <div key={i} className="text-green-400 text-[8px]">• {bonus}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceStep;
