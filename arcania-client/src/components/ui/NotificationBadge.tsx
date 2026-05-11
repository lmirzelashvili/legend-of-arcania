import React from 'react';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count <= 0) return null;

  const display = count > 99 ? '99+' : String(count);

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-black font-pixel text-[6px] leading-none animate-pulse">
      {display}
    </span>
  );
};

export default NotificationBadge;
