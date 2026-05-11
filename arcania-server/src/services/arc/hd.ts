import crypto from 'crypto';
import { Keypair, PublicKey } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import bs58 from 'bs58';
import { arcConfig } from '../../config/arc.js';

const HARDENED_MASK = 0x7fffffff;

function userIdToPathSegments(userId: string): [number, number] {
  const h = crypto.createHash('sha256').update(userId).digest();
  const a = h.readUInt32BE(0) & HARDENED_MASK;
  const b = h.readUInt32BE(4) & HARDENED_MASK;
  return [a, b];
}

export function deriveUserKeypair(userId: string): Keypair {
  const [a, b] = userIdToPathSegments(userId);
  const path = `m/44'/501'/${a}'/${b}'`;
  const { key } = derivePath(path, arcConfig.masterSeed.toString('hex'));
  return Keypair.fromSeed(key);
}

export function deriveUserPublicKey(userId: string): PublicKey {
  return deriveUserKeypair(userId).publicKey;
}

let _hot: Keypair | null = null;
export function getHotWalletKeypair(): Keypair {
  if (!_hot) {
    const secret = bs58.decode(arcConfig.hotWalletSecretBase58);
    _hot = Keypair.fromSecretKey(secret);
  }
  return _hot;
}

export function hotWalletPublicKey(): PublicKey {
  return getHotWalletKeypair().publicKey;
}
