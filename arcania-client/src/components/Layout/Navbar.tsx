import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletConnect } from '@/components/wallet/WalletConnect';

const navLinks = [
  { path: '/', label: 'HOME' },
  { path: '/about', label: 'ABOUT' },
  { path: '/lore', label: 'LORE' },
  { path: '/races', label: 'RACES' },
  { path: '/classes', label: 'CLASSES' },
  { path: '/token', label: 'TOKEN' },
];

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="border-b border-gray-800 bg-black">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-amber-500 text-[15px] hover:text-amber-400">
          ARCANIA
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[9px] transition-colors ${
                location.pathname === link.path
                  ? 'text-amber-500'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet Connect */}
        <div className="hidden md:flex items-center">
          <WalletConnect />
        </div>

        {/* Enter Button */}
        <Link
          to="/login"
          className="border border-amber-600 px-4 py-2 text-[9px] text-amber-500 hover:bg-amber-950 hover:text-amber-400 transition-colors"
        >
          ENTER NEXUS
        </Link>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-gray-800 px-4 py-2 flex flex-wrap gap-3 justify-center">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-[7px] transition-colors ${
              location.pathname === link.path
                ? 'text-amber-500'
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
