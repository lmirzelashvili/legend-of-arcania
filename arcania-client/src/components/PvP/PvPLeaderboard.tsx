import React, { useState, useEffect, useCallback } from 'react';
import { Character } from '@/types/game.types';
import { pvpAPI, PvPStatsData } from '@/services/api.service';
import PixelPanel from '@/components/ui/PixelPanel';
import PixelButton from '@/components/ui/PixelButton';

interface Props {
  character: Character;
}

/* ---------- sort options ---------- */

type SortKey = 'kills' | 'kd_ratio' | 'streak';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'kills',    label: 'KILLS' },
  { key: 'kd_ratio', label: 'K/D RATIO' },
  { key: 'streak',   label: 'BEST STREAK' },
];

const LIMIT_OPTIONS = [10, 25, 50] as const;

/* ---------- helpers ---------- */

function classColor(cls: string): string {
  switch (cls.toUpperCase()) {
    case 'PALADIN': return 'text-amber-400';
    case 'FIGHTER': return 'text-red-400';
    case 'RANGER':  return 'text-green-400';
    case 'CLERIC':  return 'text-cyan-400';
    case 'MAGE':    return 'text-purple-400';
    default:        return 'text-gray-400';
  }
}

function rankBadge(rank: number): string {
  if (rank === 1) return '#1';
  if (rank === 2) return '#2';
  if (rank === 3) return '#3';
  return `#${rank}`;
}

function rankColor(rank: number): string {
  if (rank === 1) return 'text-amber-400';
  if (rank === 2) return 'text-gray-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-gray-500';
}

/* ---------- component ---------- */

const PvPLeaderboard: React.FC<Props> = ({ character }) => {
  const [sortBy, setSortBy] = useState<SortKey>('kills');
  const [limit, setLimit] = useState<number>(25);
  const [leaderboard, setLeaderboard] = useState<PvPStatsData[]>([]);
  const [myStats, setMyStats] = useState<PvPStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lb, stats] = await Promise.all([
        pvpAPI.getLeaderboard(sortBy, limit),
        pvpAPI.getStats(character.id).catch(() => null),
      ]);
      setLeaderboard(lb);
      setMyStats(stats);
    } catch {
      setError('Failed to load PvP leaderboard.');
    } finally {
      setLoading(false);
    }
  }, [sortBy, limit, character.id]);

  useEffect(() => { load(); }, [load]);

  /* ---- render ---- */

  return (
    <div className="space-y-4">
      {/* ---- Controls ---- */}
      <PixelPanel color="red">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[9px]">SORT BY:</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={`px-3 py-1.5 text-[9px] border transition-colors ${
                  sortBy === opt.key
                    ? 'border-red-600 text-red-400 bg-red-900/20'
                    : 'border-gray-800 text-gray-500 hover:text-gray-400 hover:border-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Limit selector */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[9px]">TOP:</span>
            {LIMIT_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                className={`px-2 py-1 text-[9px] border transition-colors ${
                  limit === n
                    ? 'border-red-600 text-red-400 bg-red-900/20'
                    : 'border-gray-800 text-gray-500 hover:text-gray-400 hover:border-gray-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </PixelPanel>

      {/* ---- Leaderboard Table ---- */}
      <PixelPanel title="PVP LEADERBOARD" color="gray">
        {loading ? (
          <div className="text-gray-500 text-[10px] text-center py-12">Loading leaderboard...</div>
        ) : error ? (
          <div className="text-center py-12 space-y-4">
            <div className="text-gray-500 text-[10px]">{error}</div>
            <PixelButton onClick={load} variant="secondary" size="sm">RETRY</PixelButton>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-gray-600 text-[10px] text-center py-12">No PvP stats recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[9px]">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left text-gray-500 py-2 px-2 w-12">RANK</th>
                  <th className="text-left text-gray-500 py-2 px-2">CHARACTER</th>
                  <th className="text-left text-gray-500 py-2 px-2 hidden sm:table-cell">CLASS</th>
                  <th className="text-center text-gray-500 py-2 px-2 hidden md:table-cell">LV</th>
                  <th className="text-center text-gray-500 py-2 px-2">KILLS</th>
                  <th className="text-center text-gray-500 py-2 px-2 hidden sm:table-cell">DEATHS</th>
                  <th className="text-center text-gray-500 py-2 px-2">K/D</th>
                  <th className="text-center text-gray-500 py-2 px-2">STREAK</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => {
                  const rank = idx + 1;
                  const isMe = entry.characterId === character.id;
                  return (
                    <tr
                      key={entry.characterId}
                      className={`border-b border-gray-900 transition-colors ${
                        isMe
                          ? 'bg-amber-900/15 border-amber-800'
                          : 'hover:bg-gray-900/40'
                      }`}
                    >
                      <td className={`py-2 px-2 font-bold ${rankColor(rank)}`}>
                        {rankBadge(rank)}
                      </td>
                      <td className={`py-2 px-2 ${isMe ? 'text-amber-400' : 'text-gray-300'}`}>
                        {entry.characterName}
                        {isMe && <span className="text-amber-600 ml-1 text-[7px]">(YOU)</span>}
                      </td>
                      <td className={`py-2 px-2 hidden sm:table-cell ${classColor(entry.characterClass)}`}>
                        {entry.characterClass}
                      </td>
                      <td className="py-2 px-2 text-center text-gray-400 hidden md:table-cell">
                        {entry.characterLevel}
                      </td>
                      <td className="py-2 px-2 text-center text-red-400">
                        {entry.kills}
                      </td>
                      <td className="py-2 px-2 text-center text-gray-500 hidden sm:table-cell">
                        {entry.deaths}
                      </td>
                      <td className="py-2 px-2 text-center text-green-400">
                        {entry.kdRatio.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center text-purple-400">
                        {entry.bestStreak}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </PixelPanel>

      {/* ---- Personal Stats ---- */}
      {myStats && (
        <PixelPanel title="YOUR PVP STATS" color="amber">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="KILLS" value={String(myStats.kills)} color="text-red-400" />
            <StatCard label="DEATHS" value={String(myStats.deaths)} color="text-gray-400" />
            <StatCard label="K/D RATIO" value={myStats.kdRatio.toFixed(2)} color="text-green-400" />
            <StatCard label="BEST STREAK" value={String(myStats.bestStreak)} color="text-purple-400" />
          </div>
          {myStats.killStreak > 0 && (
            <div className="mt-4 text-center text-[10px] text-amber-400 border border-amber-700 bg-amber-900/10 py-2">
              CURRENT STREAK: {myStats.killStreak}
            </div>
          )}
        </PixelPanel>
      )}
    </div>
  );
};

/* ---------- stat card sub-component ---------- */

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="text-center border border-gray-800 bg-gray-900/30 py-3 px-2">
    <div className={`text-[16px] ${color}`}>{value}</div>
    <div className="text-[8px] text-gray-500 mt-1">{label}</div>
  </div>
);

export default PvPLeaderboard;
