import React, { useState } from 'react';

export const StoreTab: React.FC = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handlePurchase = () => {
    // Payment integration not yet implemented
    setShowPurchaseModal(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-amber-400 text-[12px] mb-2">STORE</div>
        <div className="text-gray-600 text-[8px]">Support the game and get instant access</div>
      </div>

      {/* Creation Token Product */}
      <div className="border border-gray-800 bg-black p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-purple-400 text-[11px] mb-1">CREATION TOKEN</div>
            <div className="text-gray-600 text-[7px]">Create a new character instantly</div>
          </div>
          <div className="text-amber-400 text-[14px]">$0.99</div>
        </div>

        <ul className="text-gray-500 text-[7px] space-y-1 mb-4">
          <li>- Required to create each character</li>
          <li>- Instant delivery</li>
          <li>- Supports game development</li>
        </ul>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="w-full border border-amber-700 hover:border-amber-600 bg-amber-900/20 hover:bg-amber-900/40 py-3 text-amber-400 text-[9px] transition-colors"
        >
          PURCHASE
        </button>
      </div>

      {/* Free Options */}
      <div className="border border-gray-800 bg-black p-6">
        <div className="text-gray-400 text-[10px] mb-4">FREE ALTERNATIVES</div>

        <div className="space-y-4 text-[8px]">
          <div className="flex items-start gap-3">
            <div className="text-amber-500 mt-0.5">1</div>
            <div>
              <div className="text-gray-300 mb-1">Daily Spin</div>
              <div className="text-gray-600">3 free spins per day with 10% token chance</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-amber-500 mt-0.5">2</div>
            <div>
              <div className="text-gray-300 mb-1">Discord Giveaways</div>
              <div className="text-gray-600">Join our Discord for daily token drops</div>
              <a
                href="https://discord.gg/arcania"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 mt-1 inline-block"
              >
                Join Discord →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowPurchaseModal(false)}
          />
          <div className="relative bg-black border border-gray-700 p-6 max-w-sm mx-4">
              <>
                <div className="text-center mb-5">
                  <div className="text-amber-400 text-[11px] tracking-wider mb-3">CONFIRM PURCHASE</div>
                  <div className="text-gray-300 text-[10px] mb-1">1x Creation Token</div>
                  <div className="text-amber-400 text-[14px]">$0.99</div>
                </div>

                <p className="text-gray-600 text-[7px] text-center mb-6">
                  This is a demo. In production, this would connect to a payment processor.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="flex-1 border border-gray-700 hover:border-gray-600 py-2 text-gray-400 hover:text-gray-300 text-[8px] transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="flex-1 border border-amber-700 hover:border-amber-600 py-2 text-amber-400 hover:text-amber-300 text-[8px] transition-colors"
                  >
                    CONFIRM
                  </button>
                </div>
              </>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreTab;
