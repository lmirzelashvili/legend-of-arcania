import React from 'react';

type BarColor = 'red' | 'blue' | 'amber' | 'green' | 'purple';

interface Props {
  value: number;
  max: number;
  color: BarColor;
  label?: string;
  valueLabel?: string;
  showPercent?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const BAR_COLORS: Record<BarColor, string> = {
  red: 'from-red-600 to-red-500',
  blue: 'from-blue-600 to-blue-500',
  amber: 'from-amber-600 to-amber-500',
  green: 'from-green-600 to-green-500',
  purple: 'from-purple-600 to-purple-500',
};

const LABEL_COLORS: Record<BarColor, string> = {
  red: 'text-red-400',
  blue: 'text-blue-400',
  amber: 'text-amber-500',
  green: 'text-green-400',
  purple: 'text-purple-400',
};

const HEIGHT_MAP = {
  sm: 'h-3',
  md: 'h-4',
  lg: 'h-6',
};

const ProgressBar: React.FC<Props> = ({
  value,
  max,
  color,
  label,
  valueLabel,
  showPercent = false,
  height = 'md',
}) => {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div>
      {(label || valueLabel) && (
        <div className="flex justify-between items-center mb-1 text-[8px]">
          {label && <span className="text-gray-500">{label}</span>}
          {valueLabel && <span className={LABEL_COLORS[color]}>{valueLabel}</span>}
        </div>
      )}
      <div
        className={`relative ${HEIGHT_MAP[height]} p-[2px] bg-gray-900 border border-gray-800 overflow-hidden`}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-label={label || undefined}
      >
        <div className="w-full h-full bg-black relative overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${BAR_COLORS[color]}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {showPercent && (
        <div className="text-center text-[8px] text-white mt-1" style={{ textShadow: '1px 1px 2px black' }}>
          {Math.round(percent)}%
        </div>
      )}
    </div>
  );
};

export default React.memo(ProgressBar);
