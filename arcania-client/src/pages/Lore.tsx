import React from 'react';
import { Layout } from '@/components/Layout/Layout';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`border border-gray-800 bg-black p-4 ${className}`}>
    {children}
  </div>
);

export const Lore: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-amber-500 text-xl mb-2 text-center">THE LORE</h1>
        <p className="text-gray-600 text-[8px] mb-12 text-center">The story of Arcania</p>

        {/* The War */}
        <Card className="mb-8">
          <h2 className="text-amber-400 text-[10px] mb-4">THE WAR FOR ARCANIA</h2>
          <p className="text-gray-400 text-[8px] leading-relaxed mb-4">
            200 years ago, the goddess Anias was murdered by the mortal Nimue.
            Her death shattered the cosmic order and plunged Arcania into darkness.
          </p>
          <p className="text-gray-500 text-[8px] leading-relaxed mb-4">
            Marael, grief-stricken husband of Anias, transformed their daughter Alassa
            into the Dread Emissary - a weapon of vengeance against the mortal races.
            Now she wields the Anguish Stone, an artifact of primordial destruction.
          </p>
          <p className="text-gray-500 text-[8px] leading-relaxed">
            Erion, last of the true gods, leads the Grand Alliance against the Dominion's
            corruption. The fate of all Arcania hangs in the balance.
          </p>
        </Card>

        {/* Factions */}
        <h2 className="text-amber-500 text-[10px] mb-6">THE FACTIONS</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <div className="text-blue-400 text-[9px] mb-2">GRAND ALLIANCE</div>
            <p className="text-gray-500 text-[7px] leading-relaxed mb-3">
              United races fighting for survival. Led by Erion, the last god.
              Warriors, mages, and healers standing against the darkness.
            </p>
            <div className="text-gray-600 text-[7px]">
              <span className="text-gray-500">Leader:</span> Erion, Last of the Gods
            </div>
          </Card>
          <Card>
            <div className="text-red-400 text-[9px] mb-2">THE DOMINION</div>
            <p className="text-gray-500 text-[7px] leading-relaxed mb-3">
              Corrupted forces spreading the Anguish. Five territories fallen,
              five bosses guard the path to the Throne of Ruin.
            </p>
            <div className="text-gray-600 text-[7px]">
              <span className="text-gray-500">Leader:</span> The Dread Emissary (Alassa)
            </div>
          </Card>
        </div>

        {/* Dominions */}
        <h2 className="text-amber-500 text-[10px] mb-6">THE FIVE DOMINIONS</h2>
        <div className="space-y-3 mb-8">
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-red-500 text-[9px]">DREADMAR FRONTIER</span>
                <span className="text-gray-700 text-[7px] ml-3">Fire and Corruption</span>
              </div>
              <span className="text-gray-600 text-[7px]">Boss: Vharun</span>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-blue-500 text-[9px]">MIRE OF WHISPERS</span>
                <span className="text-gray-700 text-[7px] ml-3">Grief and Psychic Assault</span>
              </div>
              <span className="text-gray-600 text-[7px]">Boss: Saelistra</span>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-yellow-500 text-[9px]">STONEGRAVE EXPANSE</span>
                <span className="text-gray-700 text-[7px] ml-3">Hunger and Regeneration</span>
              </div>
              <span className="text-gray-600 text-[7px]">Boss: Kharagul</span>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-purple-500 text-[9px]">ECLIPSE BARRENS</span>
                <span className="text-gray-700 text-[7px] ml-3">Despair and Shadow</span>
              </div>
              <span className="text-gray-600 text-[7px]">Boss: Morgathis</span>
            </div>
          </Card>
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-400 text-[9px]">HALL OF FALLEN</span>
                <span className="text-gray-700 text-[7px] ml-3">Emptiness and Betrayal</span>
              </div>
              <span className="text-gray-600 text-[7px]">Boss: Cassian</span>
            </div>
          </Card>
        </div>

        {/* Creation Myth */}
        <h2 className="text-amber-500 text-[10px] mb-6">THE CREATION MYTH</h2>
        <Card>
          <div className="space-y-4 text-[8px]">
            <div>
              <span className="text-purple-400">GENESIS</span>
              <p className="text-gray-600 mt-1">Before time, the Void and Dark Titans clashed. Their destruction birthed creation.</p>
            </div>
            <div>
              <span className="text-yellow-400">GOLDEN AGE</span>
              <p className="text-gray-600 mt-1">Anias awakened and created the races. Marael brought order. The gods ruled in harmony.</p>
            </div>
            <div>
              <span className="text-orange-400">DUSKFALL</span>
              <p className="text-gray-600 mt-1">Nimue murdered Anias. The world was shattered. Marael's grief transformed Alassa.</p>
            </div>
            <div>
              <span className="text-red-400">ABYSSAL AGE</span>
              <p className="text-gray-600 mt-1">The present. War rages. Players enter as heroes of the Grand Alliance.</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Lore;
