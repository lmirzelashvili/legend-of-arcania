import React, { useState, useCallback, useEffect } from 'react';
import { Character } from '@/types/game.types';
import { NavSection, SUB_TABS } from './navigation.types';
import Sidebar from './Sidebar';
import SubTabBar from './SubTabBar';
import DashboardHome from './DashboardHome';
import CharacterSheet from './CharacterSheet';
import AbilitiesPanel from './AbilitiesPanel';
import QuestsTab from '../Quests/QuestsTab';
import BattlePassPanel from '../BattlePass/BattlePassPanel';
import PvPLeaderboard from '../PvP/PvPLeaderboard';
import { VaultPanel } from '../Vault';
import Marketplace from '../Marketplace/Marketplace';
import { Vendors } from '../Vendors';
import ForgePanel from '../Forge/ForgePanel';
import FriendsPanel from '../Friends/FriendsPanel';
import BoosterPanel from '../Boosters/BoosterPanel';
import { PixelPanel, PixelButton, CurrencyDisplay } from '@/components/ui';
import { useNotificationStore } from '@/store/useNotificationStore';

interface Props {
  character: Character;
  onBack: () => void;
}

const CharacterManagement: React.FC<Props> = ({ character, onBack }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('');

  const { unspentPoints, claimableQuests, claimableBattlePass, pendingFriendRequests, loadBadges } =
    useNotificationStore();

  useEffect(() => {
    loadBadges(character);
  }, [character, loadBadges]);

  const badges: Record<NavSection, number> = {
    home: 0,
    character: unspentPoints,
    adventure: claimableQuests + claimableBattlePass,
    trade: 0,
    social: pendingFriendRequests,
  };

  const handleSectionChange = useCallback((section: NavSection) => {
    setActiveSection(section);
    const tabs = SUB_TABS[section];
    setActiveSubTab(tabs.length > 0 ? tabs[0].id : '');
  }, []);

  /** Navigate from dashboard widgets — accepts section + optional sub-tab */
  const handleNavigate = useCallback((section: string, subTab?: string) => {
    const sec = section as NavSection;
    setActiveSection(sec);
    const tabs = SUB_TABS[sec];
    setActiveSubTab(subTab ?? (tabs.length > 0 ? tabs[0].id : ''));
  }, []);

  /* ── Content Router ─────────────────────────── */
  const renderContent = () => {
    if (activeSection === 'home') return <DashboardHome character={character} onNavigate={handleNavigate} />;

    switch (activeSubTab) {
      /* CHARACTER */
      case 'equipment':  return <CharacterSheet character={character} />;
      case 'abilities':  return <AbilitiesPanel />;
      /* ADVENTURE */
      case 'quests':     return <QuestsTab />;
      case 'battlepass': return <BattlePassPanel />;
      case 'pvp':        return <PvPLeaderboard character={character} />;
      /* TRADE */
      case 'vault':      return <VaultPanel />;
      case 'auction':    return <Marketplace character={character} />;
      case 'vendors':    return <Vendors character={character} />;
      case 'forge':      return <ForgePanel />;
      /* SOCIAL */
      case 'friends':    return <FriendsPanel />;
      case 'boosters':   return <BoosterPanel character={character} />;
      default:           return null;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden font-pixel">
      <div className="max-w-[1600px] mx-auto p-8 relative z-10">
        {/* ── Header ────────────────────────────── */}
        <PixelPanel color="amber" className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-amber-500 text-[22px] tracking-wider" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
                ARCANIA
              </div>
              <div className="text-gray-500 text-[10px] tracking-widest">SEASON I</div>
            </div>

            <div className="flex items-center gap-4">
              <CurrencyDisplay type="gold" amount={character.resources?.gold || 0} size="lg" showLabel />
              <CurrencyDisplay type="arcanite" amount={character.resources?.arcanite || 0} size="lg" showLabel />
              <PixelButton onClick={onBack} variant="secondary">← BACK</PixelButton>
              <PixelButton variant="disabled" title="World exploration coming soon!">► ENTER NEXUS</PixelButton>
            </div>
          </div>
        </PixelPanel>

        {/* ── Navigation ────────────────────────── */}
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} badges={badges} />
        <SubTabBar section={activeSection} activeSubTab={activeSubTab} onSubTabChange={setActiveSubTab} />

        {/* ── Content ───────────────────────────── */}
        <div className="mt-4">{renderContent()}</div>
      </div>
    </div>
  );
};

export default CharacterManagement;
