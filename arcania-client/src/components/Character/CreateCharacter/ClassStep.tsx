import React, { useMemo } from 'react';
import { Race, Class } from '@/types/game.types';
import {
  RACE_CLASS_COMPATIBILITY,
  RACE_INFO,
  CLASS_INFO,
  STAT_NAMES,
  calculateBaseStats,
  StatBonuses,
} from '@/constants/game.constants';
import EquipmentPreview from '../../Equipment/EquipmentPreview';
import { StepProps } from './types';

const ClassStep: React.FC<StepProps> = ({ state, onUpdateState, sounds }) => {
  const { selectedRace, selectedClass, selectedGender } = state;
  if (!selectedRace) return null;

  const availableClasses = RACE_CLASS_COMPATIBILITY[selectedRace];

  const finalStats = useMemo(() => {
    if (selectedRace && selectedClass) {
      return calculateBaseStats(selectedRace, selectedClass);
    }
    return null;
  }, [selectedRace, selectedClass]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="text-gray-500 text-[10px] mb-2">STEP 2 OF 4</div>
        <div className="text-amber-400 text-lg">CHOOSE YOUR CLASS</div>
        <div className="text-gray-600 text-[8px] mt-2">
          Playing as {RACE_INFO[selectedRace].name} - Some classes may not be available
        </div>
      </div>

      {/* Available Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableClasses.map((cls) => {
          const info = CLASS_INFO[cls];
          const isSelected = selectedClass === cls;

          return (
            <div
              key={cls}
              onClick={() => {
                sounds.playSelect();
                onUpdateState({ selectedClass: cls });
              }}
              className="relative cursor-pointer group"
            >
              <div className={`absolute inset-0 border-[3px] transition-all ${
                isSelected
                  ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'border-gray-700 group-hover:border-gray-500'
              }`} />
              <div className="absolute inset-[3px] bg-black" />

              <div className="relative p-4">
                <div className="flex justify-center mb-3 h-24">
                  <div className="-mt-8">
                    <EquipmentPreview
                      race={selectedRace}
                      characterClass={cls}
                      gender={selectedGender}
                      scale={1.8}
                      showControls={false}
                      autoPlay={true}
                      hideBackground={true}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <div className={`text-[12px] ${isSelected ? 'text-amber-400' : 'text-gray-300'}`}>
                    {info.name.toUpperCase()}
                  </div>
                  <div className={`text-[7px] px-2 py-1 flex items-center justify-center leading-none ${
                    info.role === 'Tank' ? 'bg-yellow-800/60 text-yellow-400' :
                    info.role === 'Healer' ? 'bg-emerald-800/60 text-emerald-400' :
                    info.role === 'Magic DPS' ? 'bg-purple-800/60 text-purple-400' :
                    info.role === 'Melee DPS' ? 'bg-red-800/60 text-red-400' :
                    'bg-green-800/60 text-green-400'
                  }`}>
                    {info.role.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[7px] text-gray-600">DIFFICULTY:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 ${
                          (info.difficulty === 'Easy' && level <= 1) ||
                          (info.difficulty === 'Medium' && level <= 2) ||
                          (info.difficulty === 'Hard' && level <= 3)
                            ? 'bg-amber-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-[7px] text-gray-500 mb-2 line-clamp-2">{info.description}</div>

                <div className="text-[7px]">
                  <span className="text-gray-600">PRIMARY: </span>
                  <span className={`text-${STAT_NAMES[info.primaryStat].color}-400`}>
                    {STAT_NAMES[info.primaryStat].name.toUpperCase()}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 text-amber-500 text-[10px]">◆</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unavailable Classes */}
      {Object.values(Class).filter(cls => !availableClasses.includes(cls)).length > 0 && (
        <div className="mt-6">
          <div className="text-gray-600 text-[8px] mb-3">NOT AVAILABLE FOR {RACE_INFO[selectedRace].name.toUpperCase()}</div>
          <div className="flex flex-wrap gap-3">
            {Object.values(Class).filter(cls => !availableClasses.includes(cls)).map((cls) => {
              const info = CLASS_INFO[cls];
              const availableRaces = Object.values(Race).filter(
                race => RACE_CLASS_COMPATIBILITY[race].includes(cls)
              );
              return (
                <div key={cls} className="relative group">
                  <div className="border border-gray-700 bg-black/70 px-4 py-3 flex items-center gap-3 opacity-60 group-hover:opacity-100 group-hover:border-gray-500 transition-all">
                    <div className="text-[10px] text-gray-400">{info.name}</div>
                    <div className={`text-[7px] px-1.5 py-0.5 ${
                      info.role === 'Tank' ? 'bg-amber-900/40 text-amber-500' :
                      info.role === 'Healer' ? 'bg-emerald-900/40 text-emerald-500' :
                      info.role === 'Magic DPS' ? 'bg-purple-900/40 text-purple-500' :
                      info.role === 'Melee DPS' ? 'bg-red-900/40 text-red-500' :
                      'bg-green-900/40 text-green-500'
                    }`}>
                      {info.role}
                    </div>
                  </div>

                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 hidden group-hover:block z-20 pb-3">
                    <div className="bg-gray-900 border border-gray-700 p-3 min-w-[180px]">
                      <div className="text-[8px] text-gray-400 mb-2">AVAILABLE FOR:</div>
                      <div className="space-y-1">
                        {availableRaces.map(race => (
                          <button
                            key={race}
                            onClick={() => {
                              sounds.playClick();
                              onUpdateState({ selectedRace: race, selectedClass: cls });
                            }}
                            className="w-full text-left text-[9px] px-2 py-1.5 bg-gray-800 hover:bg-amber-900/50 hover:text-amber-400 text-gray-300 transition-colors flex justify-between items-center"
                          >
                            <span>{RACE_INFO[race].name}</span>
                            <span className="text-[7px] text-gray-500">SWITCH</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-700" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Class Details */}
      {selectedClass && (
        <div className="relative mt-6">
          <div className="absolute inset-0 border-2 border-gray-700" />
          <div className="absolute inset-[2px] bg-gray-950/50" />

          <div className="relative p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="text-amber-500 text-[10px] mb-2">PLAYSTYLE</div>
                <div className="text-gray-400 text-[8px] leading-relaxed mb-4">
                  {CLASS_INFO[selectedClass].playstyle}
                </div>

                <div className="text-amber-500 text-[10px] mb-2">STARTING ABILITIES</div>
                <div className="flex flex-wrap gap-2">
                  {CLASS_INFO[selectedClass].startingAbilities.map((ability, i) => (
                    <div key={i} className="text-[8px] px-2 py-1 bg-gray-800 text-gray-300">
                      {ability}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-amber-500 text-[10px] mb-2">COMBINED STATS</div>
                <div className="grid grid-cols-2 gap-2">
                  {finalStats && (Object.keys(finalStats) as (keyof StatBonuses)[]).map((stat) => (
                    <div key={stat} className="flex items-center gap-2">
                      <span className={`text-${STAT_NAMES[stat].color}-400 text-[8px] w-8`}>
                        {STAT_NAMES[stat].abbr}
                      </span>
                      <div className="flex-1 h-2 bg-gray-800">
                        <div
                          className={`h-full bg-${STAT_NAMES[stat].color}-500`}
                          style={{ width: `${(finalStats[stat] / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-[8px] w-6 text-right">{finalStats[stat]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassStep;
