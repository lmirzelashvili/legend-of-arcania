import React, { useMemo } from 'react';
import {
  RACE_INFO,
  CLASS_INFO,
  STAT_NAMES,
  calculateBaseStats,
  StatBonuses,
} from '@/constants/game.constants';
import EquipmentPreview from '../../Equipment/EquipmentPreview';
import { StepProps } from './types';

const STAT_COLORS: Record<string, string> = {
  strength: '#f87171',
  agility: '#4ade80',
  intelligence: '#c084fc',
  vitality: '#f472b6',
  spirit: '#22d3ee',
  luck: '#fb923c',
};

const STAT_BAR_COLORS: Record<string, string> = {
  strength: '#dc2626',
  agility: '#16a34a',
  intelligence: '#9333ea',
  vitality: '#db2777',
  spirit: '#0891b2',
  luck: '#ea580c',
};

const ConfirmStep: React.FC<StepProps> = ({ state }) => {
  const { selectedRace, selectedClass, selectedGender, name } = state;
  if (!selectedRace || !selectedClass) return null;

  const finalStats = useMemo(
    () => calculateBaseStats(selectedRace, selectedClass),
    [selectedRace, selectedClass]
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-gray-500 text-[10px] mb-2">STEP 4 OF 4</div>
        <div className="text-amber-400 text-lg">CONFIRM YOUR HERO</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Character Preview & Info */}
        <div className="lg:w-1/3">
          <div className="border border-white/50 bg-black p-4">
            <div className="flex justify-center mb-3">
              <EquipmentPreview
                race={selectedRace}
                characterClass={selectedClass}
                gender={selectedGender}
                scale={3.5}
                showControls={false}
                autoPlay={true}
                hideBackground={true}
              />
            </div>

            <div className="text-center border-t border-gray-800 pt-3">
              <div className="text-amber-400 text-[12px] mb-1">{name || 'UNNAMED'}</div>
              <div className="text-gray-500 text-[8px]">
                {RACE_INFO[selectedRace].name} {CLASS_INFO[selectedClass].name}
              </div>
              <div className="text-gray-600 text-[7px] mt-1">{selectedGender.toUpperCase()}</div>
            </div>

            <div className="flex justify-center mt-3">
              <div className={`text-[7px] px-2 py-1 ${
                CLASS_INFO[selectedClass].role === 'Tank' ? 'bg-yellow-900 text-yellow-400 border border-yellow-700' :
                CLASS_INFO[selectedClass].role === 'Healer' ? 'bg-emerald-900 text-emerald-400 border border-emerald-700' :
                CLASS_INFO[selectedClass].role === 'Magic DPS' ? 'bg-purple-900 text-purple-400 border border-purple-700' :
                CLASS_INFO[selectedClass].role === 'Melee DPS' ? 'bg-red-900 text-red-400 border border-red-700' :
                'bg-green-900 text-green-400 border border-green-700'
              }`}>
                {CLASS_INFO[selectedClass].role.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Stats & Info */}
        <div className="lg:w-2/3 space-y-3">
          {/* Stats Panel */}
          <div className="border-2 border-gray-700 bg-black p-3">
            <div className="text-amber-500 text-[9px] mb-3 border-b border-gray-800 pb-2">BASE STATS</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(Object.keys(finalStats) as (keyof StatBonuses)[]).map((stat) => (
                <div key={stat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[9px] font-bold"
                      style={{ color: STAT_COLORS[stat] || '#fb923c' }}
                    >
                      {STAT_NAMES[stat].abbr}
                    </span>
                    <span className="text-[8px] text-gray-500">{STAT_NAMES[stat].name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-gray-900 border border-gray-700">
                      <div
                        className="h-full"
                        style={{
                          width: `${(finalStats[stat] / 20) * 100}%`,
                          backgroundColor: STAT_BAR_COLORS[stat] || '#ea580c',
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-gray-300 w-4 text-right">{finalStats[stat]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column: Abilities & Bonuses */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border-2 border-gray-700 bg-black p-3">
              <div className="text-amber-500 text-[9px] mb-2 border-b border-gray-800 pb-2">ABILITIES</div>
              <div className="space-y-1">
                {CLASS_INFO[selectedClass].startingAbilities.map((ability, i) => (
                  <div key={i} className="text-[8px] text-gray-300 flex items-center gap-1">
                    <span className="text-amber-600 text-[6px]">■</span> {ability}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-2 border-gray-700 bg-black p-3">
              <div className="text-amber-500 text-[9px] mb-2 border-b border-gray-800 pb-2">BONUSES</div>
              <div className="space-y-1">
                {RACE_INFO[selectedRace].bonuses.map((bonus, i) => (
                  <div key={i} className="text-[8px] text-green-400 flex items-center gap-1">
                    <span className="text-green-600 text-[6px]">+</span> {bonus}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lore */}
          <div className="border-2 border-gray-700 bg-black p-3">
            <div className="text-amber-500 text-[9px] mb-2 border-b border-gray-800 pb-2">LORE</div>
            <div className="text-[7px] text-gray-500 leading-relaxed">
              {RACE_INFO[selectedRace].lore}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmStep;
