import 'dotenv/config';
import { PublicKey } from '@solana/web3.js';

function requireArcEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required ARC env var: ${key}`);
  return v;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

const SOLANA_RPC_URL = optionalEnv('SOLANA_RPC_URL', 'https://api.devnet.solana.com');
const SOLANA_CLUSTER = optionalEnv('SOLANA_CLUSTER', 'devnet');
const ARC_MINT = optionalEnv('ARC_MINT_ADDRESS', 'DcYWNXRrXzQcNgYPu8e6fcn4gk4pwqEJhR8TJPzN5Tu8');
const ARC_DECIMALS = parseInt(optionalEnv('ARC_DECIMALS', '9'), 10);

const ARC_MASTER_SEED_HEX = requireArcEnv('ARC_MASTER_SEED_HEX');
const ARC_HOT_WALLET_SECRET_BASE58 = requireArcEnv('ARC_HOT_WALLET_SECRET_BASE58');
const ARC_COLD_WALLET_ADDRESS = requireArcEnv('ARC_COLD_WALLET_ADDRESS');

const ARC_HOT_WALLET_CAP_RAW = BigInt(optionalEnv('ARC_HOT_WALLET_CAP_RAW', '10000000000000'));
const ARC_MIN_WITHDRAW_RAW = BigInt(optionalEnv('ARC_MIN_WITHDRAW_RAW', '1000000000'));

if (ARC_MASTER_SEED_HEX.length !== 64) {
  throw new Error('ARC_MASTER_SEED_HEX must be 32 bytes (64 hex chars)');
}

new PublicKey(ARC_MINT);
new PublicKey(ARC_COLD_WALLET_ADDRESS);

export const arcConfig = {
  rpcUrl: SOLANA_RPC_URL,
  cluster: SOLANA_CLUSTER,
  mint: new PublicKey(ARC_MINT),
  mintString: ARC_MINT,
  decimals: ARC_DECIMALS,
  masterSeed: Buffer.from(ARC_MASTER_SEED_HEX, 'hex'),
  hotWalletSecretBase58: ARC_HOT_WALLET_SECRET_BASE58,
  coldWalletAddress: new PublicKey(ARC_COLD_WALLET_ADDRESS),
  hotWalletCapRaw: ARC_HOT_WALLET_CAP_RAW,
  minWithdrawRaw: ARC_MIN_WITHDRAW_RAW,
};
