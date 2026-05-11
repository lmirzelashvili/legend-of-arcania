import React from 'react';
import { Character } from '@/types/game.types';
import CharacterOverviewPanel from './CharacterOverviewPanel';
import QuestDashboardWidget from '../Quests/QuestDashboardWidget';
import BattlePassWidget from './DashboardWidgets/BattlePassWidget';
import ActiveBoostersWidget from './DashboardWidgets/ActiveBoostersWidget';
import EquipmentStatusWidget from './DashboardWidgets/EquipmentStatusWidget';
import PvPMiniWidget from './DashboardWidgets/PvPMiniWidget';

interface Props {
  character: Character;
  onNavigate: (section: string, subTab?: string) => void;
}

const DashboardHome: React.FC<Props> = ({ character, onNavigate }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left column — Character Overview (fixed width on desktop) */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <CharacterOverviewPanel character={character} />
      </div>

      {/* Right column — Widget grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
        {/* Quest Widget */}
        <QuestDashboardWidget
          onNavigateToQuests={() => onNavigate('adventure', 'quests')}
        />

        {/* Battle Pass Widget */}
        <BattlePassWidget onNavigate={onNavigate} />

        {/* Boosters Widget */}
        <ActiveBoostersWidget onNavigate={onNavigate} />

        {/* Equipment Widget */}
        <EquipmentStatusWidget character={character} onNavigate={onNavigate} />

        {/* PvP Widget */}
        <PvPMiniWidget characterId={character.id} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default DashboardHome;
