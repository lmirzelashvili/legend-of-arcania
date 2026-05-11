import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white font-['Press_Start_2P'] flex flex-col">
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5 z-50"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)'
        }}
      />

      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
