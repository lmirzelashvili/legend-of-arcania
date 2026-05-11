import React from 'react';
import { Layout } from '@/components/Layout/Layout';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border border-gray-800 bg-black p-4">
    {children}
  </div>
);

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-amber-400 text-xl mb-1">{value}</div>
    <div className="text-gray-500 text-[7px]">{label}</div>
  </div>
);

export const About: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-amber-500 text-xl mb-2 text-center">ABOUT ARCANIA</h1>
        <p className="text-gray-600 text-[8px] mb-12 text-center">What makes us different</p>

        {/* Intro */}
        <Card>
          <p className="text-gray-400 text-[8px] leading-relaxed mb-4">
            Legend of Arcania is a browser-based 2D MMORPG that combines nostalgic pixel-art
            aesthetics with modern web technologies. No downloads, no installs - just open
            your browser and play.
          </p>
          <p className="text-gray-500 text-[8px] leading-relaxed">
            We're building an accessible yet deep MMO experience built on Solana for players who miss the
            classic era of online RPGs, but want modern quality-of-life features and fair monetization.
            Built as a real game first — Solana ownership second.
          </p>
        </Card>

        {/* Core Pillars */}
        <h2 className="text-amber-500 text-[10px] mt-12 mb-6">CORE PILLARS</h2>
        <div className="space-y-4">
          <Card>
            <div className="text-amber-400 text-[9px] mb-2">ACCESSIBLE DEPTH</div>
            <p className="text-gray-500 text-[7px] leading-relaxed">
              Easy to learn, difficult to master. Browser-based with no downloads required.
              Progressive complexity that rewards dedication without overwhelming new players.
            </p>
          </Card>

          <Card>
            <div className="text-amber-400 text-[9px] mb-2">MEANINGFUL PROGRESSION</div>
            <p className="text-gray-500 text-[7px] leading-relaxed">
              Every level matters. 5 stat points per level. New content every 10 levels.
              Equipment enhancement system with risk/reward mechanics up to +15.
            </p>
          </Card>

          <Card>
            <div className="text-amber-400 text-[9px] mb-2">COOPERATIVE CHALLENGE</div>
            <p className="text-gray-500 text-[7px] leading-relaxed">
              Face challenges together. Party system supporting 2-5 players with shared XP
              and up to +40% bonus rewards. Dungeons and bosses designed for coordination.
            </p>
          </Card>

          <Card>
            <div className="text-amber-400 text-[9px] mb-2">NOSTALGIC MODERN</div>
            <p className="text-gray-500 text-[7px] leading-relaxed">
              Classic pixel-art feel with modern UI/UX. Retro aesthetics powered by
              responsive design. Quality 64x64 character animations with LPC-based sprites.
            </p>
          </Card>
        </div>

        {/* Project Depth */}
        <h2 className="text-amber-500 text-[10px] mt-12 mb-6">PROJECT DEPTH (BY THE NUMBERS)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
          <Stat value="88" label="API ENDPOINTS" />
          <Stat value="28" label="DB MODELS" />
          <Stat value="30+" label="SERVICES" />
          <Stat value="60+" label="COMPONENTS" />
          <Stat value="8" label="SSE CHANNELS" />
          <Stat value="7" label="CRON JOBS" />
          <Stat value="12" label="GAME SYSTEMS" />
          <Stat value="100M" label="ARC SUPPLY (DEVNET)" />
        </div>

        {/* What We're Not */}
        <h2 className="text-amber-500 text-[10px] mt-12 mb-6">WHAT WE'RE NOT</h2>
        <Card>
          <div className="grid md:grid-cols-3 gap-4 text-[7px]">
            <div>
              <div className="text-red-500 mb-1">NOT PAY-TO-WIN</div>
              <div className="text-gray-600">No power advantages for money. Cosmetics and convenience only.</div>
            </div>
            <div>
              <div className="text-red-500 mb-1">NOT AUTO-PLAY</div>
              <div className="text-gray-600">Real gameplay. Your skill and decisions matter.</div>
            </div>
            <div>
              <div className="text-red-500 mb-1">NOT EXTRACTIVE</div>
              <div className="text-gray-600">75% of tokens go to players. Sustainable economy.</div>
            </div>
          </div>
        </Card>

        {/* Tech Stack */}
        <h2 className="text-amber-500 text-[10px] mt-12 mb-6">TECHNOLOGY</h2>
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-[7px] mb-4">
            <div>
              <div className="text-gray-400 mb-1">React 18 + Vite</div>
              <div className="text-gray-600">Frontend framework</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">TypeScript + Tailwind</div>
              <div className="text-gray-600">Typed styling</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Zustand state</div>
              <div className="text-gray-600">Client state management</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Solana wallet-adapter</div>
              <div className="text-gray-600">Phantom + on-chain</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Express + TypeScript</div>
              <div className="text-gray-600">API server</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Prisma + PostgreSQL</div>
              <div className="text-gray-600">Database ORM</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Redis + SSE</div>
              <div className="text-gray-600">Cache + real-time</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">tweetnacl + bs58</div>
              <div className="text-gray-600">Crypto primitives</div>
            </div>
          </div>
          <p className="text-gray-600 text-[7px] text-center">
            Full TypeScript across client, server, and shared types. JWT in httpOnly cookies. ed25519 signature verification for wallet linking.
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default About;
