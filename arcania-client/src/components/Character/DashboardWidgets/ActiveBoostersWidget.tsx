import React, { useState, useEffect, useCallback } from 'react';
import { boosterAPI, ActiveBooster } from '@/services/api.service';
import { PixelPanel } from '@/components/ui';

interface Props {
  onNavigate: (section: string, subTab?: string) => void;
}

function formatCountdown(expiresAt: string): string {
  const now = Date.now();
  const end = new Date(expiresAt).getTime();
  const diff = Math.max(0, end - now);

  if (diff <= 0) return 'EXPIRED';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const BOOSTER_LABELS: Record<string, string> = {
  xp: 'XP BOOST',
  gold: 'GOLD BOOST',
  combo: 'COMBO BOOST',
  mega: 'MEGA BOOST',
};

const ActiveBoostersWidget: React.FC<Props> = ({ onNavigate }) => {
  const [boosters, setBoosters] = useState<ActiveBooster[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await boosterAPI.getActiveBoosters().catch(() => []);
      // Filter out expired boosters
      const active = data.filter(b => new Date(b.expiresAt).getTime() > Date.now());
      setBoosters(active);
    } catch { /* ignore */ }
  };

  // Tick every second for countdown updates
  const tick = useCallback(() => {
    setTick(t => t + 1);
  }, []);

  useEffect(() => {
    if (boosters.length === 0) return;
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [boosters.length, tick]);

  return (
    <PixelPanel color="cyan" className="cursor-pointer hover:brightness-110 transition-all">
      <div onClick={() => onNavigate('social', 'boosters')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] text-cyan-400 tracking-wider">BOOSTERS</span>
          <span className="text-[7px] text-gray-600 hover:text-cyan-400 transition-colors">
            VIEW →
          </span>
        </div>

        {boosters.length > 0 ? (
          <div className="space-y-2">
            {boosters.map((booster) => (
              <div key={booster.id} className="flex items-center justify-between">
                <span className="text-[9px] text-gray-300">
                  {BOOSTER_LABELS[booster.type] || booster.type.toUpperCase()}
                </span>
                <span className="text-[9px] text-cyan-400 tabular-nums">
                  {formatCountdown(booster.expiresAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="text-[9px] text-gray-600 mb-2">No active boosters</div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('social', 'boosters');
              }}
              className="text-[8px] text-cyan-600 hover:text-cyan-400 transition-colors tracking-wider"
            >
              ACTIVATE →
            </button>
          </div>
        )}
      </div>
    </PixelPanel>
  );
};

export default ActiveBoostersWidget;
