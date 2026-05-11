import React, { useState, useEffect } from 'react';
import { pvpAPI, PvPStatsData } from '@/services/api.service';
import { PixelPanel } from '@/components/ui';

interface Props {
  characterId: string;
  onNavigate: (section: string, subTab?: string) => void;
}

const PvPMiniWidget: React.FC<Props> = ({ characterId, onNavigate }) => {
  const [stats, setStats] = useState<PvPStatsData | null>(null);

  useEffect(() => {
    loadData();
  }, [characterId]);

  const loadData = async () => {
    try {
      const data = await pvpAPI.getStats(characterId).catch(() => null);
      setStats(data);
    } catch { /* ignore */ }
  };

  const kdRatio = stats ? stats.kdRatio.toFixed(2) : '0.00';

  return (
    <PixelPanel color="red" className="cursor-pointer hover:brightness-110 transition-all">
      <div onClick={() => onNavigate('adventure', 'pvp')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] text-red-400 tracking-wider">PVP</span>
          <span className="text-[7px] text-gray-600 hover:text-red-400 transition-colors">
            VIEW →
          </span>
        </div>

        {/* K/D ratio large */}
        <div className="text-center mb-2">
          <div className="text-[18px] text-white" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
            {kdRatio}
          </div>
          <div className="text-[7px] text-gray-600 tracking-wider">K/D RATIO</div>
        </div>

        {/* Kills / Deaths */}
        <div className="flex justify-center gap-4 text-[8px]">
          <span className="text-gray-500">
            <span className="text-green-400">{stats?.kills || 0}</span> K
          </span>
          <span className="text-gray-500">
            <span className="text-red-400">{stats?.deaths || 0}</span> D
          </span>
        </div>

        {/* Current streak */}
        {stats && stats.killStreak > 0 && (
          <div className="text-center mt-2 text-[8px]">
            <span className="text-amber-500">{stats.killStreak} STREAK</span>
          </div>
        )}
      </div>
    </PixelPanel>
  );
};

export default PvPMiniWidget;
