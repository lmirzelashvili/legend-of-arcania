import React from 'react';

type StatColor = 'red' | 'green' | 'purple' | 'pink' | 'cyan' | 'blue' | 'amber';

interface Props {
  label: string;
  shortLabel: string;
  value: number;
  color: StatColor;
  maxValue?: number;
  description?: string;
}

const COLOR_MAP: Record<StatColor, { border: string; bar: string; text: string }> = {
  red: { border: 'from-red-700 to-red-600', bar: 'from-red-600 to-red-500', text: 'text-red-400' },
  green: { border: 'from-green-700 to-green-600', bar: 'from-green-600 to-green-500', text: 'text-green-400' },
  purple: { border: 'from-purple-700 to-purple-600', bar: 'from-purple-600 to-purple-500', text: 'text-purple-400' },
  pink: { border: 'from-pink-700 to-pink-600', bar: 'from-pink-600 to-pink-500', text: 'text-pink-400' },
  cyan: { border: 'from-cyan-700 to-cyan-600', bar: 'from-cyan-600 to-cyan-500', text: 'text-cyan-400' },
  blue: { border: 'from-blue-700 to-blue-600', bar: 'from-blue-600 to-blue-500', text: 'text-blue-400' },
  amber: { border: 'from-amber-700 to-amber-600', bar: 'from-amber-600 to-amber-500', text: 'text-amber-400' },
};

const StatBar: React.FC<Props> = ({ label, shortLabel, value, color, maxValue = 100, description }) => {
  const c = COLOR_MAP[color];

  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${c.border} group-hover:brightness-110 transition-all`} />
      <div className="absolute inset-[3px] bg-black" />
      <div className="relative p-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`${c.text} text-[8px] font-bold`}>{shortLabel}</div>
          <div className={`${c.text} text-2xl font-bold`}>{value}</div>
        </div>
        <div className="text-gray-500 text-[6px] mb-2">{label}</div>
        {description && <div className="text-gray-600 text-[6px]">{description}</div>}
        <div
          className="mt-2 h-1 bg-gray-900"
          role="progressbar"
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
        >
          <div
            className={`h-full bg-gradient-to-r ${c.bar}`}
            style={{ width: `${Math.min((value / maxValue) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(StatBar);
