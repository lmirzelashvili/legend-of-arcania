import React from 'react';
import { Vault, VaultTier } from '@/types/game.types';

interface VaultUpgradeModalProps {
  vault: Vault;
  onUpgrade: () => void;
  onClose: () => void;
}

const VaultUpgradeModal: React.FC<VaultUpgradeModalProps> = ({ vault, onUpgrade, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-black border border-amber-700 p-6 max-w-sm mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-amber-400 text-[12px]">UPGRADE VAULT</div>
          <button onClick={onClose} aria-label="Close" className="text-gray-600 hover:text-gray-400">✕</button>
        </div>

        <div className="space-y-4">
          <div className="border border-gray-800 bg-gray-900/30 p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-500 text-[9px]">Current Tier</span>
              <span className="text-amber-400 text-[9px]">{vault.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-[9px]">Current Slots</span>
              <span className="text-gray-300 text-[9px]">{vault.maxSlots}</span>
            </div>
          </div>

          {vault.tier === VaultTier.BASE && (
            <div className="border border-amber-800 bg-amber-900/10 p-4">
              <div className="text-amber-400 text-[10px] mb-2">EXPANDED TIER</div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 text-[8px]">New Slots</span>
                <span className="text-green-400 text-[8px]">150 (+50)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-[8px]">Cost</span>
                <span className="text-yellow-400 text-[8px]">50,000 Gold</span>
              </div>
            </div>
          )}

          {vault.tier === VaultTier.EXPANDED && (
            <div className="border border-purple-800 bg-purple-900/10 p-4">
              <div className="text-purple-400 text-[10px] mb-2">PREMIUM TIER</div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500 text-[8px]">New Slots</span>
                <span className="text-green-400 text-[8px]">200 (+50)</span>
              </div>
              <div className="text-gray-500 text-[8px]">Requires Battle Pass</div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-700 py-2 text-gray-400 text-[9px]"
            >
              CANCEL
            </button>
            <button
              onClick={onUpgrade}
              disabled={vault.tier === VaultTier.EXPANDED}
              className="flex-1 border border-amber-700 hover:border-amber-500 bg-amber-900/20 py-2 text-amber-400 text-[9px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              UPGRADE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultUpgradeModal;
