import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Character, StatBlock, DerivedStats } from '@/types/game.types';
import { characterAPI } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { CLASS_BASE_STATS, STAT_CAPS } from '@/constants/game.constants';

interface Props {
  character: Character;
}

const CompactStatsPanel: React.FC<Props> = ({ character }) => {
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

  const [unspentPoints, setUnspentPoints] = useState(character.unspentStatPoints || 0);
  const [saving, setSaving] = useState(false);
  const [showRespecModal, setShowRespecModal] = useState(false);
  const [respeccing, setRespeccing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const RESPEC_COST = 50; // Arcanite cost (matches server RESPEC_ARCANITE_COST)

  useEffect(() => {
    if (character.primaryStats) {
      setTempStats(character.primaryStats);
    }
    if (character.unspentStatPoints !== undefined) {
      setUnspentPoints(character.unspentStatPoints);
    }
  }, [character.id, character.unspentStatPoints, character.primaryStats]);

  // Calculate derived stats live based on tempStats
  const derivedStats = useMemo((): DerivedStats => {
    const classBase = CLASS_BASE_STATS[character.class];
    const level = character.level || 1;

    const rawCritChance = 5 + (tempStats.agility * 0.12);
    const rawCritDamage = 125 + (tempStats.agility * 0.25);
    const rawArmorPen = tempStats.strength * 0.05;
    const rawMagicPen = tempStats.intelligence * 0.05;

    return {
      maxHp: classBase.baseHp + (tempStats.vitality * 12) + (level * 15),
      maxMana: classBase.baseMana + (tempStats.intelligence * 8) + (tempStats.spirit * 4) + (level * 8),
      physicalAttack: tempStats.strength * 2,
      magicAttack: tempStats.intelligence * 2.5,
      physicalDefense: tempStats.vitality * 2,
      magicResistance: tempStats.spirit * 2,
      criticalChance: Math.min(rawCritChance, STAT_CAPS.criticalChance),
      criticalDamage: Math.min(rawCritDamage, STAT_CAPS.criticalDamage),
      attackSpeed: 1.0 * (1 + tempStats.agility * 0.005),
      armorPenetration: Math.min(rawArmorPen, STAT_CAPS.armorPenetration),
      magicPenetration: Math.min(rawMagicPen, STAT_CAPS.magicPenetration),
      dodgeChance: 3 + (tempStats.agility * 0.1),
      blockChance: 0,
      hpRegen: (tempStats.vitality * 0.5) + (tempStats.spirit * 0.2),
      manaRegen: tempStats.spirit * 0.8,
      movementSpeed: 100 + (tempStats.agility * 0.1),
      prestigeDamage: 0,
    };
  }, [tempStats, character.class, character.level]);

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

  const handleRespec = async () => {
    const arcanite = character.resources?.arcanite || 0;
    if (arcanite < RESPEC_COST) {
      setStatusMessage({ text: `Not enough Arcanite! Need ${RESPEC_COST}, have ${arcanite}`, type: 'error' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setRespeccing(true);
    try {
      // Base stats used as fallback if server doesn't return primaryStats
      const classBase = CLASS_BASE_STATS[character.class].primaryStats;
      const baseStats: StatBlock = {
        strength: classBase.strength,
        agility: classBase.agility,
        intelligence: classBase.intelligence,
        vitality: classBase.vitality,
        spirit: classBase.spirit,
      };

      // Call API to respec (reset stats and deduct arcanite)
      const updatedCharacter = await characterAPI.respecStats(character.id);
      setCurrentCharacter(updatedCharacter);
      setTempStats(updatedCharacter.primaryStats || baseStats);
      setUnspentPoints(updatedCharacter.unspentStatPoints || 0);
      setShowRespecModal(false);
    } catch (error: any) {
      console.error('Failed to respec:', error);
      setStatusMessage({ text: error?.response?.data?.message || 'Failed to respec stats', type: 'error' });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setRespeccing(false);
    }
  };

  const hasChanges = JSON.stringify(tempStats) !== JSON.stringify(character.primaryStats);
  const canRespec = (character.resources?.arcanite || 0) >= RESPEC_COST;

  const primaryStats: { key: keyof StatBlock; abbr: string; color: string }[] = [
    { key: 'strength', abbr: 'STR', color: 'text-red-400' },
    { key: 'agility', abbr: 'AGI', color: 'text-green-400' },
    { key: 'intelligence', abbr: 'INT', color: 'text-purple-400' },
    { key: 'vitality', abbr: 'VIT', color: 'text-pink-400' },
    { key: 'spirit', abbr: 'SPR', color: 'text-cyan-400' },
  ];

  return (
    <div className="font-pixel">
      {/* Status Message */}
      {statusMessage && (
        <div className={`mb-3 px-3 py-2 text-[8px] border ${
          statusMessage.type === 'success'
            ? 'border-green-800 bg-green-900/30 text-green-400'
            : 'border-red-800 bg-red-900/30 text-red-400'
        }`}>
          {statusMessage.text}
        </div>
      )}
      {/* Header with Unspent Points */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800">
        <span className="text-gray-500 text-[9px]">STAT ALLOCATION</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-[9px]">UNSPENT:</span>
          <span className="text-amber-400 text-[15px]">{unspentPoints}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* PRIMARY STATS */}
        <div>
          <div className="mb-3 pb-2 border-b border-gray-800">
            <span className="text-gray-500 text-[9px]">PRIMARY</span>
          </div>

        <div className="space-y-2">
          {primaryStats.map((stat) => {
            const value = tempStats[stat.key];
            const baseValue = character.primaryStats?.[stat.key] || 0;
            const added = value - baseValue;
            const canIncrease = unspentPoints > 0;
            const canDecrease = added > 0; // Can only decrease if points were added

            return (
              <div key={stat.key} className="flex items-center justify-between py-1">
                <span className={`${stat.color} text-[9px]`}>{stat.abbr}</span>
                <div className="flex items-center gap-2">
                  {/* Show minus button only if points were added */}
                  {canDecrease ? (
                    <button
                      onClick={() => handleDecrease(stat.key)}
                      onMouseDown={() => startRepeating(() => handleDecrease(stat.key))}
                      onMouseUp={stopRepeating}
                      onMouseLeave={stopRepeating}
                      onTouchStart={() => startRepeating(() => handleDecrease(stat.key))}
                      onTouchEnd={stopRepeating}
                      className="w-6 h-6 bg-red-900/60 border border-red-700 text-red-400 hover:bg-red-800/60 hover:text-red-300 text-[11px] flex items-center justify-center select-none"
                    >
                      -
                    </button>
                  ) : (
                    <div className="w-6 h-6" />
                  )}

                  <div className="text-center min-w-[32px]">
                    <span className="text-white text-[11px]">{value}</span>
                  </div>

                  {/* Show plus button if points available */}
                  {canIncrease ? (
                    <button
                      onClick={() => handleIncrease(stat.key)}
                      onMouseDown={() => startRepeating(() => handleIncrease(stat.key))}
                      onMouseUp={stopRepeating}
                      onMouseLeave={stopRepeating}
                      onTouchStart={() => startRepeating(() => handleIncrease(stat.key))}
                      onTouchEnd={stopRepeating}
                      className="w-6 h-6 bg-green-900/60 border border-green-700 text-green-400 hover:bg-green-800/60 hover:text-green-300 text-[11px] flex items-center justify-center select-none"
                    >
                      +
                    </button>
                  ) : (
                    <div className="w-6 h-6" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {hasChanges && (
          <div className="flex gap-2 mt-3 pt-2 border-t border-gray-800">
            <button onClick={handleReset} className="flex-1 text-[9px] text-gray-500 hover:text-gray-400">
              RESET
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 text-[9px] text-green-400 hover:text-green-300"
            >
              {saving ? '...' : 'SAVE'}
            </button>
          </div>
        )}

        {/* Respec Button */}
        <button
          onClick={() => setShowRespecModal(true)}
          className="mt-4 w-full py-2 bg-purple-900/40 border border-purple-700 text-purple-400 hover:bg-purple-800/40 hover:text-purple-300 text-[8px] transition-colors"
        >
          RESPEC STATS
        </button>
      </div>

      {/* OFFENSE STATS */}
      <div>
        <div className="mb-3 pb-2 border-b border-gray-800">
          <span className="text-gray-500 text-[9px]">OFFENSE</span>
        </div>
        <div className="space-y-3 text-[9px]">
          <StatRow label="PHYSICAL ATK" value={Math.round(derivedStats?.physicalAttack || 10)} color="text-orange-400" />
          <StatRow label="MAGIC ATK" value={Math.round(derivedStats?.magicAttack || 10)} color="text-purple-400" />
          <StatRow label="CRIT CHANCE" value={`${(derivedStats?.criticalChance || 5).toFixed(1)}%`} color="text-yellow-400" />
          <StatRow label="CRIT DAMAGE" value={`${(derivedStats?.criticalDamage || 125).toFixed(0)}%`} color="text-amber-400" />
          <StatRow label="ARMOR PEN" value={`${(derivedStats?.armorPenetration || 0).toFixed(1)}%`} color="text-rose-400" />
          <StatRow label="MAGIC PEN" value={`${(derivedStats?.magicPenetration || 0).toFixed(1)}%`} color="text-fuchsia-400" />
          <StatRow label="ATK SPEED" value={(derivedStats?.attackSpeed || 1).toFixed(2)} color="text-lime-400" />
        </div>
      </div>

      {/* DEFENSE & UTILITY */}
      <div>
        <div className="mb-3 pb-2 border-b border-gray-800">
          <span className="text-gray-500 text-[9px]">DEFENSE</span>
        </div>
        <div className="space-y-3 text-[9px]">
          <StatRow label="MAX HP" value={Math.round(derivedStats?.maxHp || 100)} color="text-red-400" />
          <StatRow label="MAX MANA" value={Math.round(derivedStats?.maxMana || 50)} color="text-blue-400" />
          <StatRow label="PHYSICAL DEF" value={Math.round(derivedStats?.physicalDefense || 5)} color="text-cyan-400" />
          <StatRow label="MAGIC RES" value={Math.round(derivedStats?.magicResistance || 5)} color="text-indigo-400" />
          <StatRow label="DODGE CHANCE" value={`${(derivedStats?.dodgeChance || 3).toFixed(1)}%`} color="text-green-400" />
          <StatRow label="HP REGEN" value={(derivedStats?.hpRegen || 1).toFixed(1)} color="text-red-300" />
          <StatRow label="MANA REGEN" value={(derivedStats?.manaRegen || 1).toFixed(1)} color="text-blue-300" />
        </div>
      </div>
      </div>

      {/* Respec Confirmation Modal */}
      {showRespecModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="relative max-w-md w-full mx-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-500" style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)'
            }}></div>
            <div className="absolute inset-[4px] bg-black"></div>
            <div className="relative p-6">
              <div className="text-purple-400 text-[11px] mb-4 text-center">RESPEC STATS</div>

              <div className="text-gray-400 text-[9px] mb-6 text-center leading-relaxed">
                Reset all stat points to class base values?<br />
                All spent points will be refunded.
              </div>

              <div className="flex items-center justify-center gap-2 mb-6 py-3 bg-gray-900/50 border border-gray-800">
                <span className="text-gray-500 text-[9px]">COST:</span>
                <span className={`text-[12px] ${canRespec ? 'text-purple-400' : 'text-red-400'}`}>
                  {RESPEC_COST}
                </span>
                <span className="text-purple-400 text-[9px]">ARCANITE</span>
              </div>

              <div className="text-gray-600 text-[8px] mb-4 text-center">
                Your Arcanite: {character.resources?.arcanite || 0}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRespecModal(false)}
                  className="flex-1 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300 text-[9px] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleRespec}
                  disabled={!canRespec || respeccing}
                  className={`flex-1 py-2 border text-[9px] transition-colors ${
                    canRespec && !respeccing
                      ? 'bg-purple-900/60 border-purple-700 text-purple-400 hover:bg-purple-800/60 hover:text-purple-300'
                      : 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {respeccing ? 'RESPECCING...' : 'CONFIRM'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}</span>
    <span className={color}>{value}</span>
  </div>
);

export default CompactStatsPanel;
