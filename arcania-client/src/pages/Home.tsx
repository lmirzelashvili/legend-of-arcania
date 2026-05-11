import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`border border-gray-800 bg-black p-4 ${className}`}>
    {children}
  </div>
);

export const Home: React.FC = () => {
  return (
    <Layout>
      {/* Hero - Fullscreen */}
      <section className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-20">
            <h1 className="text-amber-500 text-4xl mb-6">LEGEND OF ARCANIA</h1>
            <p className="text-gray-500 text-[11px] mb-4">Browser-based 2D MMORPG</p>
            <p className="text-gray-700 text-[10px] mb-12 max-w-md mx-auto leading-relaxed">
              Nostalgic pixel-art meets modern web technology. No downloads required.
            </p>

            <Link
              to="/login"
              className="inline-block border border-amber-600 px-10 py-4 text-amber-500 text-[12px] hover:bg-amber-950 transition-colors"
            >
              ► PLAY NOW
            </Link>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/races">
              <Card className="hover:border-gray-700 transition-colors text-center">
                <div className="text-amber-500 text-[12px] mb-1">4 RACES</div>
                <div className="text-gray-600 text-[9px]">Choose your origin</div>
              </Card>
            </Link>
            <Link to="/classes">
              <Card className="hover:border-gray-700 transition-colors text-center">
                <div className="text-amber-500 text-[12px] mb-1">5 CLASSES</div>
                <div className="text-gray-600 text-[9px]">Master your role</div>
              </Card>
            </Link>
            <Link to="/lore">
              <Card className="hover:border-gray-700 transition-colors text-center">
                <div className="text-amber-500 text-[12px] mb-1">DEEP LORE</div>
                <div className="text-gray-600 text-[9px]">Discover the story</div>
              </Card>
            </Link>
            <Link to="/token">
              <Card className="hover:border-gray-700 transition-colors text-center">
                <div className="text-amber-500 text-[12px] mb-1">PLAY-TO-EARN</div>
                <div className="text-gray-600 text-[9px]">Token economy</div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Gameplay Loop */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-amber-500 text-[10px] mb-8 text-center">GAMEPLAY LOOP</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
          <Card className="flex-1">
            <div className="text-amber-400 text-[9px] mb-2">1. PLAY</div>
            <div className="text-gray-500 text-[7px]">Complete quests, defeat monsters, conquer dungeons</div>
          </Card>
          <div className="text-gray-600 text-lg hidden md:block">→</div>
          <Card className="flex-1">
            <div className="text-cyan-400 text-[9px] mb-2">2. EARN</div>
            <div className="text-gray-500 text-[7px]">Gain Gold and Arcanite from achievements</div>
          </Card>
          <div className="text-gray-600 text-lg hidden md:block">→</div>
          <Card className="flex-1">
            <div className="text-amber-400 text-[9px] mb-2">3. EXCHANGE</div>
            <div className="text-gray-500 text-[7px]">Convert Arcanite to ARC tokens</div>
          </Card>
        </div>
      </section>

      {/* Currency System */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-amber-500 text-[10px] mb-8 text-center">CURRENCY SYSTEM</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <Card>
            <div className="text-yellow-500 text-[10px] mb-2">GOLD</div>
            <div className="text-gray-600 text-[7px] mb-2">Off-chain gameplay currency</div>
            <ul className="text-gray-500 text-[7px] space-y-1">
              <li>• Earned from monsters</li>
              <li>• Used for vendors & repairs</li>
              <li>• No real-world value</li>
            </ul>
          </Card>
          <Card>
            <div className="text-cyan-400 text-[10px] mb-2">ARCANITE</div>
            <div className="text-gray-600 text-[7px] mb-2">Premium bridged currency</div>
            <ul className="text-gray-500 text-[7px] space-y-1">
              <li>• Earned from achievements</li>
              <li>• Convertible to ARC</li>
              <li>• 100 Arcanite = 1 ARC</li>
            </ul>
          </Card>
          <Card>
            <div className="text-amber-400 text-[10px] mb-2">ARC TOKEN</div>
            <div className="text-gray-600 text-[7px] mb-2">On-chain blockchain token</div>
            <ul className="text-gray-500 text-[7px] space-y-1">
              <li>• Real-world value</li>
              <li>• Tradeable on exchanges</li>
              <li>• Withdrawal available</li>
            </ul>
          </Card>
        </div>
        <div className="mt-6 border border-green-900 bg-black p-3 text-center">
          <p className="text-green-500 text-[7px]">ARC Token is NOT required to play. All gameplay is accessible with Gold.</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-amber-500 text-[10px] mb-8 text-center">WHY ARCANIA?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <div className="text-amber-400 text-[9px] mb-2">ACCESSIBLE</div>
            <div className="text-gray-500 text-[7px]">Play instantly in your browser. No downloads, no installs.</div>
          </Card>
          <Card>
            <div className="text-amber-400 text-[9px] mb-2">FAIR</div>
            <div className="text-gray-500 text-[7px]">Zero pay-to-win. Skill and time determine success.</div>
          </Card>
          <Card>
            <div className="text-amber-400 text-[9px] mb-2">COOPERATIVE</div>
            <div className="text-gray-500 text-[7px]">Party system with up to 5 players. +40% bonus rewards.</div>
          </Card>
          <Card>
            <div className="text-amber-400 text-[9px] mb-2">REWARDING</div>
            <div className="text-gray-500 text-[7px]">Earn real value through gameplay. 75% of tokens to players.</div>
          </Card>
        </div>
      </section>

    </Layout>
  );
};

export default Home;
