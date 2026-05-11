import React from 'react';
import { Layout } from '@/components/Layout/Layout';

const RaceCard: React.FC<{
  name: string;
  title: string;
  bonus: string;
  homeland: string;
  lore: string;
  classes: string[];
}> = ({ name, title, bonus, homeland, lore, classes }) => (
  <div className="border border-gray-800 bg-black p-5">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="text-amber-400 text-sm mb-1">{name}</h3>
        <p className="text-gray-500 text-[8px]">{title}</p>
      </div>
      <div className="text-right">
        <div className="text-purple-400 text-[8px]">{bonus}</div>
      </div>
    </div>

    <p className="text-gray-500 text-[7px] leading-relaxed mb-4">{lore}</p>

    <div className="flex justify-between items-center text-[7px]">
      <div>
        <span className="text-gray-600">Homeland:</span>
        <span className="text-gray-400 ml-2">{homeland}</span>
      </div>
      <div>
        <span className="text-gray-600">Classes:</span>
        <span className="text-gray-400 ml-2">{classes.join(', ')}</span>
      </div>
    </div>
  </div>
);

export const Races: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-amber-500 text-xl mb-2 text-center">RACES</h1>
        <p className="text-gray-600 text-[8px] mb-12 text-center">Choose your origin</p>

        <div className="space-y-4">
          <RaceCard
            name="HUMAN"
            title="The Unbound Children"
            bonus="All Stats +1, +5% XP"
            homeland="Meridia"
            lore="The youngest of Arcania's races, humans carry no cosmic burden - only the gift of choice. Their lack of cosmic allegiance makes them truly free, able to master any discipline through determination alone."
            classes={['Paladin', 'Cleric', 'Warrior', 'Ranger']}
          />

          <RaceCard
            name="LUMINAR"
            title="Fragments of the First Light"
            bonus="INT +3, SPR +3"
            homeland="Lumeria"
            lore="When Anias awakened, her first intentional act was creation. The Luminar were born from her deliberate radiance - not dreams, not accidents, but willed into existence as extensions of her divine light."
            classes={['Cleric', 'Mage', 'Warrior', 'Ranger']}
          />

          <RaceCard
            name="LILIN"
            title="Daughters of the First Forest"
            bonus="AGI +4, SPR +2"
            homeland="Lythora"
            lore="While Anias slumbered, her peaceful dreams took form. The Lilin emerged from the First Forest - small, graceful beings of pure magic and innocent hearts. They are the oldest mortals in existence."
            classes={['Paladin', 'Cleric', 'Mage']}
          />

          <RaceCard
            name="DARKAN"
            title="Heirs of the Dark Titan"
            bonus="STR +4, VIT +4"
            homeland="Redmire"
            lore="When the Dark Titan was destroyed, its physical form scattered across the cosmos. The Darkan coalesced from this matter - not children of evil, but of ambition itself, tempered by mortal wisdom."
            classes={['Paladin', 'Mage', 'Warrior']}
          />
        </div>

        {/* Comparison */}
        <h2 className="text-amber-500 text-[10px] mt-12 mb-6">RACE COMPARISON</h2>
        <div className="border border-gray-800 bg-black overflow-x-auto">
          <table className="w-full text-[7px]">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 p-3">Race</th>
                <th className="text-center text-gray-500 p-3">Bonus</th>
                <th className="text-center text-gray-500 p-3">Playstyle</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-900">
                <td className="text-amber-400 p-3">Human</td>
                <td className="text-center text-gray-400 p-3">All +1, +5% XP</td>
                <td className="text-center text-gray-500 p-3">Versatile</td>
              </tr>
              <tr className="border-b border-gray-900">
                <td className="text-amber-400 p-3">Luminar</td>
                <td className="text-center text-gray-400 p-3">INT +3, SPR +3</td>
                <td className="text-center text-gray-500 p-3">Magic / Healing</td>
              </tr>
              <tr className="border-b border-gray-900">
                <td className="text-amber-400 p-3">Lilin</td>
                <td className="text-center text-gray-400 p-3">AGI +4, SPR +2</td>
                <td className="text-center text-gray-500 p-3">Speed / Support</td>
              </tr>
              <tr>
                <td className="text-amber-400 p-3">Darkan</td>
                <td className="text-center text-gray-400 p-3">STR +4, VIT +4</td>
                <td className="text-center text-gray-500 p-3">Tank / Melee</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Races;
