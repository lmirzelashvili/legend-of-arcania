import React from 'react';

interface Props {
  children: React.ReactNode;
  title?: string;
  color?: 'amber' | 'gray' | 'green' | 'red' | 'purple' | 'cyan';
  className?: string;
}

const BORDER_COLORS: Record<string, string> = {
  amber: 'from-amber-600 to-amber-500',
  gray: 'from-gray-700 to-gray-600',
  green: 'from-green-600 to-green-500',
  red: 'from-red-700 to-red-600',
  purple: 'from-purple-600 to-purple-500',
  cyan: 'from-cyan-600 to-cyan-500',
};

const TITLE_COLORS: Record<string, string> = {
  amber: 'text-amber-400',
  gray: 'text-gray-400',
  green: 'text-green-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
  cyan: 'text-cyan-400',
};

const PixelPanel: React.FC<Props> = ({ children, title, color = 'gray', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Outer Border */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${BORDER_COLORS[color]}`}
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 100% 4px, 4px 4px, 4px calc(100% - 4px), 100% calc(100% - 4px), 100% 100%, 0 100%, 0 calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 4px, 0 4px)',
        }}
      />

      {/* Inner Background */}
      <div className="absolute inset-[4px] bg-black" />

      {/* Content */}
      <div className="relative p-6">
        {title && (
          <div className={`${TITLE_COLORS[color]} text-[10px] mb-4 pb-2 border-b-2 border-gray-800 tracking-widest`}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PixelPanel;
