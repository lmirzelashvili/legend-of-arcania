import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-gray-800 bg-black py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Game */}
          <div>
            <h4 className="text-amber-500 text-[8px] mb-3">GAME</h4>
            <div className="space-y-2">
              <Link to="/about" className="block text-gray-600 text-[7px] hover:text-gray-400">About</Link>
              <Link to="/races" className="block text-gray-600 text-[7px] hover:text-gray-400">Races</Link>
              <Link to="/classes" className="block text-gray-600 text-[7px] hover:text-gray-400">Classes</Link>
            </div>
          </div>

          {/* World */}
          <div>
            <h4 className="text-amber-500 text-[8px] mb-3">WORLD</h4>
            <div className="space-y-2">
              <Link to="/lore" className="block text-gray-600 text-[7px] hover:text-gray-400">Lore</Link>
              <span className="block text-gray-700 text-[7px]">Dominions</span>
              <span className="block text-gray-700 text-[7px]">Factions</span>
            </div>
          </div>

          {/* Economy */}
          <div>
            <h4 className="text-amber-500 text-[8px] mb-3">ECONOMY</h4>
            <div className="space-y-2">
              <Link to="/token" className="block text-gray-600 text-[7px] hover:text-gray-400">Token</Link>
              <span className="block text-gray-700 text-[7px]">Marketplace</span>
              <span className="block text-gray-700 text-[7px]">Play-to-Earn</span>
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-amber-500 text-[8px] mb-3">COMMUNITY</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-600 text-[7px] hover:text-gray-400">Discord</a>
              <a href="#" className="block text-gray-600 text-[7px] hover:text-gray-400">Twitter</a>
              <a href="#" className="block text-gray-600 text-[7px] hover:text-gray-400">Docs</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-6 text-center">
          <p className="text-gray-800 text-[6px]">© 2024 LEGEND OF ARCANIA. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
