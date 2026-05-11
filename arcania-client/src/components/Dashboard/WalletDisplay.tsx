import React from 'react';
import { useWalletStore } from '@/store/useWalletStore';
import { useCharacterStore } from '@/store/useCharacterStore';

export const WalletDisplay: React.FC = () => {
  const { accountWallet } = useWalletStore();
  const { currentCharacter } = useCharacterStore();

  return (
    <div className="flex items-center gap-4 text-[10px]">
      {/* Gold */}
      <div className="flex items-center gap-1.5">
        <span className="text-yellow-500">G</span>
        <span className="text-yellow-400">{(currentCharacter?.resources?.gold || 0).toLocaleString()}</span>
      </div>

      {/* Arcanite */}
      <div className="flex items-center gap-1.5">
        <span className="text-cyan-500">A</span>
        <span className="text-cyan-400">{currentCharacter?.resources?.arcanite || 0}</span>
      </div>

      {/* Creation Tokens */}
      <div className="flex items-center gap-1.5">
        <span className="text-purple-500">T</span>
        <span className="text-purple-400">{accountWallet.creationTokens}</span>
      </div>
    </div>
  );
};

export default WalletDisplay;
