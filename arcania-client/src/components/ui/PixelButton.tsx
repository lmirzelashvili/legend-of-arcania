import React from 'react';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'disabled' | 'danger' | 'success' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  title?: string;
}

const VARIANT_STYLES: Record<string, { outer: string; inner: string; text: string }> = {
  primary: {
    outer: 'bg-gradient-to-b from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600',
    inner: 'bg-gradient-to-b from-gray-900 to-black',
    text: 'text-amber-400 group-hover:text-amber-300',
  },
  secondary: {
    outer: 'bg-gray-700 group-hover:bg-gray-600',
    inner: 'bg-gray-900',
    text: 'text-gray-400 group-hover:text-gray-200',
  },
  danger: {
    outer: 'bg-gradient-to-b from-red-700 to-red-800 group-hover:from-red-600 group-hover:to-red-700',
    inner: 'bg-gradient-to-b from-gray-900 to-black',
    text: 'text-red-400 group-hover:text-red-300',
  },
  success: {
    outer: 'bg-gradient-to-b from-green-700 to-green-800 group-hover:from-green-600 group-hover:to-green-700',
    inner: 'bg-gradient-to-b from-gray-900 to-black',
    text: 'text-green-400 group-hover:text-green-300',
  },
  accent: {
    outer: 'bg-gradient-to-b from-purple-600 to-purple-700 group-hover:from-purple-500 group-hover:to-purple-600',
    inner: 'bg-gradient-to-b from-gray-900 to-black',
    text: 'text-purple-400 group-hover:text-purple-300',
  },
  disabled: {
    outer: 'bg-gradient-to-b from-gray-600 to-gray-700',
    inner: 'bg-gradient-to-b from-gray-900 to-black',
    text: 'text-gray-400',
  },
};

const SIZE_STYLES: Record<string, string> = {
  sm: 'px-3 py-1.5 text-[8px]',
  md: 'px-6 py-3 text-[10px]',
  lg: 'px-8 py-4 text-[12px]',
};

const PixelButton: React.FC<Props> = ({
  children,
  onClick,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  className = '',
  title,
}) => {
  const styles = VARIANT_STYLES[variant];
  const isDisabled = variant === 'disabled';

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      className={`relative group ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
      title={title}
    >
      <div className={`absolute inset-0 ${styles.outer} transition-colors`} />
      <div className={`absolute inset-[2px] ${styles.inner}`} />
      <div className={`relative ${SIZE_STYLES[size]} ${styles.text} transition-colors`}>
        {children}
      </div>
    </button>
  );
};

export default PixelButton;
