import React from 'react';
import { Character } from '@/types/game.types';
import { PixelPanel, ProgressBar } from '@/components/ui';

interface Props {
  character: Character;
  onNavigate: (section: string, subTab?: string) => void;
}

const EQUIPMENT_SLOTS = [
  'weapon', 'offHand', 'head', 'chest', 'legs', 'boots',
  'gloves', 'cape', 'wings', 'pendant', 'ring1', 'ring2',
] as const;

const TOTAL_SLOTS = EQUIPMENT_SLOTS.length;

const EquipmentStatusWidget: React.FC<Props> = ({ character, onNavigate }) => {
  const equipment = character.equipment || {} as any;
  const equippedCount = EQUIPMENT_SLOTS.filter(
    (slot) => equipment[slot] != null
  ).length;
  const emptyCount = TOTAL_SLOTS - equippedCount;

  return (
    <PixelPanel color="amber" className="cursor-pointer hover:brightness-110 transition-all">
      <div onClick={() => onNavigate('character', 'equipment')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] text-amber-400 tracking-wider">EQUIPMENT</span>
          <span className="text-[7px] text-gray-600 hover:text-amber-400 transition-colors">
            VIEW →
          </span>
        </div>

        {/* Slot count */}
        <div className="text-[11px] text-white mb-2" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
          <span className="text-amber-400">{equippedCount}</span>
          <span className="text-gray-600"> / {TOTAL_SLOTS}</span>
          {' '}
          <span className="text-[9px] text-gray-500">SLOTS EQUIPPED</span>
        </div>

        {/* Progress bar */}
        <ProgressBar
          value={equippedCount}
          max={TOTAL_SLOTS}
          color="amber"
          height="sm"
        />

        {/* Empty slots notice */}
        {emptyCount > 0 && (
          <div className="mt-2 text-[8px] text-amber-600 tracking-wider">
            {emptyCount} EMPTY — EQUIP GEAR
          </div>
        )}
      </div>
    </PixelPanel>
  );
};

export default EquipmentStatusWidget;
