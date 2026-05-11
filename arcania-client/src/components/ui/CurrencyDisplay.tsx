import React from 'react';

type CurrencyType = 'gold' | 'arcanite' | 'creation_token';

interface CurrencyDisplayProps {
  type: CurrencyType;
  amount: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showLabel?: boolean;
  className?: string;
}

const CURRENCY_CONFIG: Record<CurrencyType, {
  icon: string;
  alt: string;
  label: string;
  description: string;
  labelColor: string;
}> = {
  gold: {
    icon: '/assets/icons/gold.png',
    alt: 'Gold',
    label: 'GOLD',
    description: 'In-game currency for items & upgrades',
    labelColor: 'text-amber-400',
  },
  arcanite: {
    icon: '/assets/icons/arcanite.png',
    alt: 'Arcanite',
    label: 'ARCANITE',
    description: 'Premium currency for rare items',
    labelColor: 'text-cyan-400',
  },
  creation_token: {
    icon: '/assets/icons/creation-token.png',
    alt: 'Creation Token',
    label: 'CREATION TOKEN',
    description: 'Required to create new characters',
    labelColor: 'text-purple-400',
  },
};

const SIZE_CONFIG = {
  xs: { icon: 'w-3 h-3', text: 'text-[7px]' },
  sm: { icon: 'w-4 h-4', text: 'text-[9px]' },
  md: { icon: 'w-[22px] h-[22px]', text: 'text-[10px]' },
  lg: { icon: 'w-7 h-7', text: 'text-[12px]' },
};

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  type,
  amount,
  size = 'md',
  showTooltip = false,
  showLabel = false,
  className = '',
}) => {
  const config = CURRENCY_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className={`relative group inline-flex items-center gap-1.5 ${showTooltip ? 'cursor-help' : ''} ${className}`}>
      <img src={config.icon} alt={config.alt} className={sizeConfig.icon} />
      {showLabel && <span className={`${config.labelColor} ${sizeConfig.text}`}>{config.label}</span>}
      <span className={`text-gray-300 ${sizeConfig.text}`}>{amount.toLocaleString()}</span>

      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-black border border-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
          <div className={`${config.labelColor} text-[8px] mb-1`}>{config.label}</div>
          <div className="text-gray-500 text-[7px]">{config.description}</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(CurrencyDisplay);
