import React from 'react';
import { Layout } from '@/components/Layout/Layout';

const ClassCard: React.FC<{
  name: string;
  role: string;
  roleColor: string;
  difficulty: string;
  description: string;
  primaryStats: string;
  races: string[];
}> = ({ name, role, roleColor, difficulty, description, primaryStats, races }) => (
  <div className="border border-gray-800 bg-black p-5">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="text-amber-400 text-sm mb-1">{name}</h3>
        <span className={`text-[8px] ${roleColor}`}>{role}</span>
      </div>
      <div className="text-right">
        <div className="text-gray-600 text-[7px]">Difficulty</div>
        <div className="text-gray-400 text-[8px]">{difficulty}</div>
      </div>
    </div>

    <p className="text-gray-500 text-[7px] leading-relaxed mb-4">{description}</p>

    <div className="grid grid-cols-2 gap-4 text-[7px]">
      <div>
        <span className="text-gray-600">Primary Stats:</span>
        <div className="text-gray-400 mt-1">{primaryStats}</div>
      </div>
      <div>
        <span className="text-gray-600">Available to:</span>
        <div className="text-gray-400 mt-1">{races.join(', ')}</div>
      </div>
    </div>
  </div>
);

export const Classes: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-amber-500 text-xl mb-2 text-center">CLASSES</h1>
        <p className="text-gray-600 text-[8px] mb-12 text-center">Master your role</p>

        <div className="space-y-4">
          <ClassCard
            name="PALADIN"
            role="Tank / Support"
            roleColor="text-yellow-500"
            difficulty="Medium"
            description="Holy warriors who stand between their allies and danger. Paladins combine defensive prowess with support abilities, making them invaluable in group content."
            primaryStats="STR, VIT, SPR"
            races={['Human', 'Lilin', 'Darkan']}
          />

          <ClassCard
            name="CLERIC"
            role="Healer / Support"
            roleColor="text-blue-400"
            difficulty="Medium"
            description="Devoted healers who channel the Eternal Light to mend wounds and bolster allies. Clerics are essential for surviving challenging content."
            primaryStats="SPR, INT, VIT"
            races={['Human', 'Luminar', 'Lilin']}
          />

          <ClassCard
            name="MAGE"
            role="Ranged DPS / CC"
            roleColor="text-purple-400"
            difficulty="Hard"
            description="Masters of arcane destruction who rain devastation from afar. High damage output balanced by fragility and resource management."
            primaryStats="INT, SPR, AGI"
            races={['Luminar', 'Lilin', 'Darkan']}
          />

          <ClassCard
            name="WARRIOR"
            role="Melee DPS / Off-Tank"
            roleColor="text-red-400"
            difficulty="Easy"
            description="Fierce combatants who excel at close-quarters combat. Warriors deal consistent damage while being sturdy enough to take hits."
            primaryStats="STR, AGI, VIT"
            races={['Human', 'Luminar', 'Darkan']}
          />

          <ClassCard
            name="RANGER"
            role="Ranged DPS / Utility"
            roleColor="text-green-400"
            difficulty="Medium"
            description="Mobile marksmen who strike from distance with deadly precision. Rangers excel at kiting enemies and providing utility to their party."
            primaryStats="AGI, STR, INT"
            races={['Human', 'Luminar', 'Lilin']}
          />
        </div>

        {/* Role Guide */}
        <h2 className="text-amber-500 text-[10px] mt-12 mb-6">ROLE GUIDE</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div className="border border-gray-800 bg-black p-4">
            <div className="text-yellow-500 text-[9px] mb-2">TANK</div>
            <p className="text-gray-600 text-[7px]">Absorb damage and protect allies. Essential for boss fights.</p>
          </div>
          <div className="border border-gray-800 bg-black p-4">
            <div className="text-blue-400 text-[9px] mb-2">HEALER</div>
            <p className="text-gray-600 text-[7px]">Keep the party alive. Critical for sustained encounters.</p>
          </div>
          <div className="border border-gray-800 bg-black p-4">
            <div className="text-red-400 text-[9px] mb-2">DPS</div>
            <p className="text-gray-600 text-[7px]">Deal damage to enemies. The core of combat output.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Classes;
