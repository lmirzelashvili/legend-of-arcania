import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Character } from '@/types/game.types';
import { boosterAPI, ActiveBooster, vaultAPI } from '@/services/api.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { characterAPI } from '@/services/api.service';
import PixelPanel from '@/components/ui/PixelPanel';
import PixelButton from '@/components/ui/PixelButton';

interface Props {
  character: Character;
}

/* ---------- booster catalog ---------- */

interface BoosterDef {
  type: 'xp' | 'gold' | 'combo' | 'mega';
  name: string;
  xpBonus: string;
  goldBonus: string;
  duration: string;
  cost: number;
  color: 'green' | 'amber' | 'purple' | 'cyan';
}

const BOOSTER_CATALOG: BoosterDef[] = [
  { type: 'xp',    name: 'XP BOOSTER',    xpBonus: '+50%',  goldBonus: '--',   duration: '2h',  cost: 100, color: 'green' },
  { type: 'gold',  name: 'GOLD BOOSTER',  xpBonus: '--',    goldBonus: '+25%', duration: '2h',  cost: 100, color: 'amber' },
  { type: 'combo', name: 'COMBO BOOSTER', xpBonus: '+50%',  goldBonus: '+25%', duration: '2h',  cost: 150, color: 'purple' },
  { type: 'mega',  name: 'MEGA BOOSTER',  xpBonus: '+100%', goldBonus: '+50%', duration: '8h',  cost: 400, color: 'cyan' },
];

/* ---------- helpers ---------- */

function formatTimeRemaining(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / 3_600_000);
  const mins  = Math.floor((diff % 3_600_000) / 60_000);
  const secs  = Math.floor((diff % 60_000) / 1000);
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function boosterLabel(b: ActiveBooster): string {
  return b.type.toUpperCase() + ' BOOSTER';
}

/* ---------- countdown hook ---------- */

function useCountdown(active: ActiveBooster[]): Record<string, string> {
  const [times, setTimes] = useState<Record<string, string>>({});
  const rafRef = useRef(0);

  useEffect(() => {
    const tick = () => {
      const next: Record<string, string> = {};
      for (const b of active) {
        next[b.id] = formatTimeRemaining(b.expiresAt);
      }
      setTimes(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return times;
}

/* ---------- component ---------- */

const BoosterPanel: React.FC<Props> = ({ character }) => {
  const { setCurrentCharacter } = useCharacterStore();

  const [activeBoosters, setActiveBoosters] = useState<ActiveBooster[]>([]);
  const [vaultArcanite, setVaultArcanite] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const countdowns = useCountdown(activeBoosters);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [boosters, vault] = await Promise.all([
        boosterAPI.getActiveBoosters(),
        vaultAPI.getVault(),
      ]);
      setActiveBoosters(boosters);
      setVaultArcanite(vault.arcanite);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleActivate = async (type: 'xp' | 'gold' | 'combo' | 'mega') => {
    if (activating) return;
    setActivating(type);
    setMessage(null);
    try {
      const result = await boosterAPI.activate(type);
      setMessage(`Activated ${type.toUpperCase()} booster! (-${result.cost} arcanite)`);
      // Refresh boosters and character balance
      const [boosters, vault, char] = await Promise.all([
        boosterAPI.getActiveBoosters(),
        vaultAPI.getVault(),
        characterAPI.getById(character.id),
      ]);
      setActiveBoosters(boosters);
      setVaultArcanite(vault.arcanite);
      setCurrentCharacter(char);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Activation failed.';
      setMessage(msg);
    } finally {
      setActivating(null);
    }
  };

  const charArcanite = character.resources?.arcanite ?? 0;
  const totalArcanite = charArcanite + vaultArcanite;

  if (loading) {
    return (
      <PixelPanel title="BOOSTERS" color="cyan">
        <div className="text-gray-500 text-[10px] text-center py-8">Loading boosters...</div>
      </PixelPanel>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---- Active Boosters ---- */}
      <PixelPanel title="ACTIVE BOOSTERS" color="cyan">
        {activeBoosters.length === 0 ? (
          <div className="text-gray-600 text-[10px] text-center py-4">No active boosters.</div>
        ) : (
          <div className="space-y-2">
            {activeBoosters.map(b => (
              <div key={b.id} className="flex items-center justify-between border border-gray-800 bg-gray-900/30 px-3 py-2">
                <div>
                  <span className="text-cyan-400 text-[10px]">{boosterLabel(b)}</span>
                  <span className="text-gray-500 text-[9px] ml-3">
                    {b.xpBonus > 0 && `+${Math.round(b.xpBonus * 100)}% XP`}
                    {b.xpBonus > 0 && b.goldBonus > 0 && ' / '}
                    {b.goldBonus > 0 && `+${Math.round(b.goldBonus * 100)}% Gold`}
                  </span>
                </div>
                <span className="text-amber-400 text-[10px] tabular-nums">{countdowns[b.id] ?? '--'}</span>
              </div>
            ))}
          </div>
        )}
      </PixelPanel>

      {/* ---- Arcanite Balance ---- */}
      <div className="flex items-center justify-end gap-4 text-[9px]">
        <span className="text-gray-500">ARCANITE BALANCE:</span>
        <span className="text-cyan-400">{totalArcanite.toLocaleString()}</span>
        <span className="text-gray-700">(char: {charArcanite.toLocaleString()} + vault: {vaultArcanite.toLocaleString()})</span>
      </div>

      {/* ---- Message ---- */}
      {message && (
        <div className="text-center text-[10px] text-green-400 border border-green-800 bg-green-900/20 py-2 px-4">
          {message}
        </div>
      )}

      {/* ---- Booster Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {BOOSTER_CATALOG.map(def => {
          const canAfford = totalArcanite >= def.cost;
          const isActivating = activating === def.type;

          return (
            <PixelPanel key={def.type} color={def.color}>
              <div className="space-y-3 text-center">
                <div className={`text-[12px] tracking-wider ${
                  def.color === 'green' ? 'text-green-400' :
                  def.color === 'amber' ? 'text-amber-400' :
                  def.color === 'purple' ? 'text-purple-400' :
                  'text-cyan-400'
                }`}>
                  {def.name}
                </div>

                <div className="space-y-1 text-[9px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500">XP BONUS</span>
                    <span className="text-green-400">{def.xpBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">GOLD BONUS</span>
                    <span className="text-amber-400">{def.goldBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">DURATION</span>
                    <span className="text-gray-300">{def.duration}</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-3">
                  <div className="text-[9px] text-gray-500 mb-2">{def.cost} ARCANITE</div>
                  <PixelButton
                    onClick={() => handleActivate(def.type)}
                    variant={canAfford ? 'primary' : 'disabled'}
                    size="sm"
                    fullWidth
                  >
                    {isActivating ? 'ACTIVATING...' : 'ACTIVATE'}
                  </PixelButton>
                </div>
              </div>
            </PixelPanel>
          );
        })}
      </div>
    </div>
  );
};

export default BoosterPanel;
