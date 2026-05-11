import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SOLANA_RPC_ENDPOINT } from '@/config/solana';

// Global wallet-adapter modal styles — imported here so they ship with the bundle.
import '@solana/wallet-adapter-react-ui/styles.css';

/**
 * The wallet-adapter libraries ship React typings that pre-date @types/react@18.
 * The FC return type mismatch (ReactNode | Promise<ReactNode> vs ReactNode) is a
 * known upstream issue. Casting through unknown is the least-invasive workaround
 * until the libraries update their peer typings.
 */
type CompatFC<P> = React.FC<P & { children?: React.ReactNode }>;

const SafeConnectionProvider =
  ConnectionProvider as unknown as CompatFC<{ endpoint: string }>;

const SafeWalletProvider = WalletProvider as unknown as CompatFC<{
  wallets: PhantomWalletAdapter[];
  autoConnect: boolean;
}>;

const SafeWalletModalProvider =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WalletModalProvider as unknown as CompatFC<Record<string, any>>;

interface SolanaProviderProps {
  children: React.ReactNode;
}

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <SafeConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
      <SafeWalletProvider wallets={wallets} autoConnect>
        <SafeWalletModalProvider>{children}</SafeWalletModalProvider>
      </SafeWalletProvider>
    </SafeConnectionProvider>
  );
};

export default SolanaProvider;
