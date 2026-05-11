import { Connection } from '@solana/web3.js';
import { arcConfig } from '../../config/arc.js';

let _conn: Connection | null = null;

export function getConnection(): Connection {
  if (!_conn) {
    _conn = new Connection(arcConfig.rpcUrl, 'confirmed');
  }
  return _conn;
}
