import React, { useEffect, useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { shortenAddress } from '@/utils/solana';

const BALANCE_REFRESH_MS = 15_000;

export const WalletConnect: React.FC = () => {
  const { publicKey, disconnect, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    try {
      const lamports = await connection.getBalance(publicKey);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch {
      // Non-critical — leave balance as-is if fetch fails.
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance(null);
      return;
    }

    void fetchBalance();
    const id = setInterval(() => void fetchBalance(), BALANCE_REFRESH_MS);
    return () => clearInterval(id);
  }, [connected, publicKey, fetchBalance]);

  if (!connected || !publicKey) {
    return (
      // Wrapper overrides the default wallet-adapter button styles to match
      // the dark-fantasy pixel aesthetic: black background, amber border, tiny text.
      <div className="wallet-connect-override">
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-amber-500 border border-gray-800 bg-black px-2 py-1">
        {shortenAddress(publicKey.toBase58())}
        {balance !== null && (
          <> &middot; SOL: {balance.toFixed(3)}</>
        )}
      </span>
      <button
        onClick={() => void disconnect()}
        className="text-[9px] text-gray-500 hover:text-amber-500 border border-gray-800 bg-black px-2 py-1 transition-colors"
      >
        DISCONNECT
      </button>
    </div>
  );
};

export default WalletConnect;
