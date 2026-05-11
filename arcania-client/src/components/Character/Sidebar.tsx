import React from 'react';
import { NAV_SECTIONS, NavSection } from './navigation.types';
import NotificationBadge from '@/components/ui/NotificationBadge';

interface SidebarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  badges: Record<NavSection, number>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, badges }) => {
  return (
    <>
      {/* Desktop: horizontal top nav with icons + labels */}
      <nav className="hidden sm:flex gap-2 mb-6" aria-label="Main navigation">
        {NAV_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              aria-label={section.label}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'relative flex-1 flex items-center justify-center gap-2 py-3',
                'border-2 bg-black font-pixel text-[9px] tracking-wider transition-colors',
                isActive
                  ? 'border-amber-500 text-amber-400 bg-amber-900/10'
                  : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400',
              ].join(' ')}
            >
              <span className="text-[14px]">{section.icon}</span>
              <span>{section.label}</span>
              {badges[section.id] > 0 && (
                <NotificationBadge count={badges[section.id]} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile: bottom bar with icons + labels */}
      <nav
        className="flex sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t-2 border-gray-800"
        aria-label="Main navigation"
      >
        {NAV_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              aria-label={section.label}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'relative flex-1 flex flex-col items-center justify-center py-2 gap-1',
                'font-pixel transition-colors',
                isActive
                  ? 'text-amber-400'
                  : 'text-gray-500',
              ].join(' ')}
            >
              <span className="text-[14px]">{section.icon}</span>
              <span className="text-[6px] tracking-wider">{section.label}</span>
              {badges[section.id] > 0 && (
                <NotificationBadge count={badges[section.id]} />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
