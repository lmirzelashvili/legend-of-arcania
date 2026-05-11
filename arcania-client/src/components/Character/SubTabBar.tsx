import React from 'react';
import { NavSection, SUB_TABS } from './navigation.types';

interface SubTabBarProps {
  section: NavSection;
  activeSubTab: string;
  onSubTabChange: (subTabId: string) => void;
}

const SubTabBar: React.FC<SubTabBarProps> = ({ section, activeSubTab, onSubTabChange }) => {
  const tabs = SUB_TABS[section];

  if (tabs.length === 0) return null;

  return (
    <div className="flex gap-1 px-2 py-2 border-b-2 border-gray-800" role="tablist" aria-label={`${section} sub-navigation`}>
      {tabs.map((tab) => {
        const isActive = activeSubTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSubTabChange(tab.id)}
            className={[
              'px-4 py-2 font-pixel text-[8px] tracking-wider border-2 bg-black transition-colors',
              isActive
                ? 'border-amber-500 text-amber-400'
                : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-400',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default SubTabBar;
