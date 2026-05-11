import crypto from 'crypto';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const masterSeed = crypto.randomBytes(32).toString('hex');
const hot = Keypair.generate();
const cold = Keypair.generate();

console.log('# Paste into arcania-server/.env');
console.log(`ARC_MASTER_SEED_HEX=${masterSeed}`);
console.log(`ARC_HOT_WALLET_SECRET_BASE58=${bs58.encode(hot.secretKey)}`);
console.log(`ARC_HOT_WALLET_ADDRESS=${hot.publicKey.toBase58()}  # informational`);
console.log(`ARC_COLD_WALLET_ADDRESS=${cold.publicKey.toBase58()}`);
console.log('');
console.log('# COLD WALLET SECRET (store offline, do NOT put in env):');
console.log(`# ${bs58.encode(cold.secretKey)}`);
console.log('');
console.log('# Defaults — uncomment to override:');
console.log('# SOLANA_RPC_URL=https://api.devnet.solana.com');
console.log('# SOLANA_CLUSTER=devnet');
console.log('# ARC_MINT_ADDRESS=DcYWNXRrXzQcNgYPu8e6fcn4gk4pwqEJhR8TJPzN5Tu8');
console.log('# ARC_DECIMALS=9');
console.log('# ARC_HOT_WALLET_CAP_RAW=10000000000000   # 10,000 ARC max per single withdrawal');
console.log('# ARC_MIN_WITHDRAW_RAW=1000000000         # 1 ARC minimum');
