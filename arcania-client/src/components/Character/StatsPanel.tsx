import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Character, StatBlock } from '@/types/game.types';
import { characterAPI } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';

interface Props {
  character: Character;
}

const StatsPanel: React.FC<Props> = ({ character }) => {
  const { setCurrentCharacter } = useCharacterStore();
  const [tempStats, setTempStats] = useState<StatBlock>(
    character.primaryStats || {
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      spirit: 10,
    }
  );

  const [unspentPoints, setUnspentPoints] = useState(character.unspentStatPoints || 20);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (character.primaryStats) {
      setTempStats(character.primaryStats);
    }
    if (character.unspentStatPoints !== undefined) {
      setUnspentPoints(character.unspentStatPoints);
    }
  }, [character.id, character.unspentStatPoints, character.primaryStats]);

  const derivedStats = character.derivedStats;

  const handleIncrease = (stat: keyof StatBlock) => {
    setUnspentPoints(prev => {
      if (prev <= 0) return prev;
      setTempStats(ts => ({ ...ts, [stat]: ts[stat] + 1 }));
      return prev - 1;
    });
  };

  const handleDecrease = (stat: keyof StatBlock) => {
    const base = character.primaryStats?.[stat] || 0;
    setTempStats(ts => {
      if (ts[stat] <= base) return ts;
      setUnspentPoints(prev => prev + 1);
      return { ...ts, [stat]: ts[stat] - 1 };
    });
  };

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionRef = useRef<(() => void) | null>(null);

  const stopRepeating = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    actionRef.current = null;
  }, []);

  const startRepeating = useCallback((action: () => void) => {
    stopRepeating();
    actionRef.current = action;
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        actionRef.current?.();
      }, 80);
    }, 400);
  }, [stopRepeating]);

  useEffect(() => stopRepeating, [stopRepeating]);

  const handleReset = () => {
    setTempStats(character.primaryStats || tempStats);
    setUnspentPoints(character.unspentStatPoints || 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const baseStats = character.primaryStats || { strength: 10, agility: 10, intelligence: 10, vitality: 10, spirit: 10 };
      const deltas: Partial<StatBlock> = {};
      for (const key of Object.keys(tempStats) as (keyof StatBlock)[]) {
        const diff = tempStats[key] - baseStats[key];
        if (diff > 0) deltas[key] = diff;
      }
      const updatedCharacter = await characterAPI.updateStats(character.id, deltas);
      setCurrentCharacter(updatedCharacter);
      setTempStats(updatedCharacter.primaryStats || tempStats);
      setUnspentPoints(updatedCharacter.unspentStatPoints || 0);
    } catch (error: any) {
      console.error('Failed to save stats:', error);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(tempStats) !== JSON.stringify(character.primaryStats);

  return (
    <div className="font-pixel">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Stats */}
        <Panel title="PRIMARY STATS" color="green">
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-500 text-[8px]">UNSPENT POINTS</div>
            <div className="text-amber-400 text-xl">{unspentPoints}</div>
          </div>

          <div className="space-y-4">
            <StatControl
              label="STRENGTH"
              description="+2 P.ATK, +0.05% Armor Pen per point"
              value={tempStats.strength}
              baseValue={character.primaryStats?.strength || 0}
              onIncrease={() => handleIncrease('strength')}
              onDecrease={() => handleDecrease('strength')}
              onStartRepeat={startRepeating}
              onStopRepeat={stopRepeating}
              canIncrease={unspentPoints > 0}
              canDecrease={tempStats.strength > (character.primaryStats?.strength || 0)}
            />

            <StatControl
              label="AGILITY"
              description="+0.12% Crit, +0.25% Crit Dmg, +0.5% ATK Spd"
              value={tempStats.agility}
              baseValue={character.primaryStats?.agility || 0}
              onIncrease={() => handleIncrease('agility')}
              onDecrease={() => handleDecrease('agility')}
              onStartRepeat={startRepeating}
              onStopRepeat={stopRepeating}
              canIncrease={unspentPoints > 0}
              canDecrease={tempStats.agility > (character.primaryStats?.agility || 0)}
            />

            <StatControl
              label="INTELLIGENCE"
              description="+2.5 M.ATK, +8 Mana, +0.05% Magic Pen"
              value={tempStats.intelligence}
              baseValue={character.primaryStats?.intelligence || 0}
              onIncrease={() => handleIncrease('intelligence')}
              onDecrease={() => handleDecrease('intelligence')}
              onStartRepeat={startRepeating}
              onStopRepeat={stopRepeating}
              canIncrease={unspentPoints > 0}
              canDecrease={tempStats.intelligence > (character.primaryStats?.intelligence || 0)}
            />

            <StatControl
              label="VITALITY"
              description="+12 HP, +2 P.DEF, +0.5 HP Regen per point"
              value={tempStats.vitality}
              baseValue={character.primaryStats?.vitality || 0}
              onIncrease={() => handleIncrease('vitality')}
              onDecrease={() => handleDecrease('vitality')}
              onStartRepeat={startRepeating}
              onStopRepeat={stopRepeating}
              canIncrease={unspentPoints > 0}
              canDecrease={tempStats.vitality > (character.primaryStats?.vitality || 0)}
            />

            <StatControl
              label="SPIRIT"
              description="+4 Mana, +2 M.RES, +0.8 Mana Regen"
              value={tempStats.spirit}
              baseValue={character.primaryStats?.spirit || 0}
              onIncrease={() => handleIncrease('spirit')}
              onDecrease={() => handleDecrease('spirit')}
              onStartRepeat={startRepeating}
              onStopRepeat={stopRepeating}
              canIncrease={unspentPoints > 0}
              canDecrease={tempStats.spirit > (character.primaryStats?.spirit || 0)}
            />

          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="relative flex-1 group disabled:opacity-30"
            >
              <div className="absolute inset-0 bg-gray-800 group-hover:bg-gray-700 transition-colors"></div>
              <div className="absolute inset-[2px] bg-black"></div>
              <div className="relative py-2 text-gray-400 group-hover:text-gray-200 text-[8px] transition-colors">
                RESET
              </div>
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="relative flex-1 group disabled:opacity-30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 group-hover:brightness-110 transition-all"></div>
              <div className="absolute inset-[2px] bg-black"></div>
              <div className="relative py-2 text-green-400 group-hover:text-green-300 text-[8px] transition-colors">
                {saving ? 'SAVING...' : 'SAVE'}
              </div>
            </button>
          </div>
        </Panel>

        {/* Derived Stats & Tips */}
        <div className="space-y-6">
          <Panel title="DERIVED STATS" color="amber">
            <div className="space-y-3">
              {/* Resources */}
              <DerivedStat label="MAX HP" value={Math.round(derivedStats?.maxHp || 100)} color="text-red-400" />
              <DerivedStat label="MAX MANA" value={Math.round(derivedStats?.maxMana || 50)} color="text-blue-400" />

              {/* Offense */}
              <DerivedStat label="PHYSICAL ATK" value={Math.round(derivedStats?.physicalAttack || 10)} color="text-orange-400" />
              <DerivedStat label="MAGIC ATK" value={Math.round(derivedStats?.magicAttack || 10)} color="text-purple-400" />
              <DerivedStat label="CRIT CHANCE" value={`${(derivedStats?.criticalChance || 5).toFixed(1)}% / 50%`} color="text-yellow-400" />
              <DerivedStat label="CRIT DAMAGE" value={`${(derivedStats?.criticalDamage || 125).toFixed(1)}% / 200%`} color="text-amber-400" />
              <DerivedStat label="ATK SPEED" value={`${(derivedStats?.attackSpeed || 1).toFixed(2)} APS`} color="text-lime-400" />

              {/* Penetration */}
              <DerivedStat label="ARMOR PEN" value={`${(derivedStats?.armorPenetration || 0).toFixed(2)}% / 40%`} color="text-rose-400" />
              <DerivedStat label="MAGIC PEN" value={`${(derivedStats?.magicPenetration || 0).toFixed(2)}% / 40%`} color="text-fuchsia-400" />

              {/* Defense */}
              <DerivedStat label="PHYSICAL DEF" value={Math.round(derivedStats?.physicalDefense || 5)} color="text-cyan-400" />
              <DerivedStat label="MAGIC RES" value={Math.round(derivedStats?.magicResistance || 5)} color="text-indigo-400" />
              <DerivedStat label="DODGE CHANCE" value={`${(derivedStats?.dodgeChance || 3).toFixed(1)}%`} color="text-green-400" />

              {/* Regen & Movement */}
              <DerivedStat label="HP REGEN" value={`${(derivedStats?.hpRegen || 1).toFixed(1)}/s`} color="text-red-300" />
              <DerivedStat label="MANA REGEN" value={`${(derivedStats?.manaRegen || 1).toFixed(1)}/s`} color="text-blue-300" />
              <DerivedStat label="MOVE SPEED" value={`${(derivedStats?.movementSpeed || 100).toFixed(1)}%`} color="text-teal-400" />
            </div>
          </Panel>

          {/* Stat Tips */}
          <Panel title="STAT TIPS" color="gray">
            <ul className="space-y-2 text-[8px] text-gray-400 leading-relaxed">
              <li>• +5 points per level (1-50)</li>
              <li>• +4 points per level (51-85)</li>
              <li>• Stats can be reset with Respec Token</li>
              <li>• Caps: Crit 50%, Pen 40%, Crit Dmg 200%</li>
              <li>• Equipment adds to derived stats</li>
              <li>• Class determines base HP/Mana</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
};

// Panel Component
const Panel: React.FC<{ children: React.ReactNode; title?: string; color?: 'amber' | 'gray' | 'green' }> = ({
  children,
  title,
  color = 'gray'
}) => {
  const borderColor =
    color === 'amber' ? 'from-amber-600 to-amber-500' :
    color === 'green' ? 'from-green-600 to-green-500' :
    'from-gray-700 to-gray-600';

  const titleColor =
    color === 'amber' ? 'text-amber-400' :
    color === 'green' ? 'text-green-400' :
    'text-gray-400';

  return (
    <div className="relative">
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

// Stat Control Component
interface StatControlProps {
  label: string;
  description: string;
  value: number;
  baseValue: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onStartRepeat: (action: () => void) => void;
  onStopRepeat: () => void;
  canIncrease: boolean;
  canDecrease: boolean;
}

const StatControl: React.FC<StatControlProps> = ({
  label,
  description,
  value,
  baseValue,
  onIncrease,
  onDecrease,
  onStartRepeat,
  onStopRepeat,
  canIncrease,
  canDecrease,
}) => {
  const added = value - baseValue;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gray-900"></div>
      <div className="absolute inset-[2px] bg-black"></div>
      <div className="relative p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-green-400 text-[8px] mb-1">{label}</div>
            <div className="text-gray-500 text-[6px]">{description}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDecrease}
              onMouseDown={() => canDecrease && onStartRepeat(onDecrease)}
              onMouseUp={onStopRepeat}
              onMouseLeave={onStopRepeat}
              onTouchStart={() => canDecrease && onStartRepeat(onDecrease)}
              onTouchEnd={onStopRepeat}
              disabled={!canDecrease}
              className="relative w-8 h-8 group disabled:opacity-30 select-none"
            >
              <div className={`absolute inset-0 ${canDecrease ? 'bg-red-700 group-hover:bg-red-600' : 'bg-gray-800'} transition-colors`}></div>
              <div className="absolute inset-[2px] bg-black"></div>
              <div className={`relative text-[10px] ${canDecrease ? 'text-red-400' : 'text-gray-700'}`}>
                −
              </div>
            </button>

            <div className="text-center min-w-[48px]">
              <div className="text-white text-xl">
                {value}
                {added > 0 && <span className="text-green-400 text-[10px] ml-1">+{added}</span>}
              </div>
            </div>

            <button
              onClick={onIncrease}
              onMouseDown={() => canIncrease && onStartRepeat(onIncrease)}
              onMouseUp={onStopRepeat}
              onMouseLeave={onStopRepeat}
              onTouchStart={() => canIncrease && onStartRepeat(onIncrease)}
              onTouchEnd={onStopRepeat}
              disabled={!canIncrease}
              className="relative w-8 h-8 group disabled:opacity-30 select-none"
            >
              <div className={`absolute inset-0 ${canIncrease ? 'bg-green-700 group-hover:bg-green-600' : 'bg-gray-800'} transition-colors`}></div>
              <div className="absolute inset-[2px] bg-black"></div>
              <div className={`relative text-[10px] ${canIncrease ? 'text-green-400' : 'text-gray-700'}`}>
                +
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Derived Stat Component
interface DerivedStatProps {
  label: string;
  value: number | string;
  color: string;
}

const DerivedStat: React.FC<DerivedStatProps> = ({ label, value, color }) => (
  <div className="flex justify-between items-center text-[8px]">
    <span className="text-gray-500">{label}</span>
    <span className={`${color} text-[10px]`}>{value}</span>
  </div>
);

export default StatsPanel;
