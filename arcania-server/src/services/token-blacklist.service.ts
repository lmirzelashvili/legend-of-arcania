import { redis } from '../config/redis.js';

const BLACKLIST_PREFIX = 'token:blacklist:';

export async function blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
  // Store in Redis with TTL matching the token's remaining lifetime
  await redis.set(`${BLACKLIST_PREFIX}${token}`, '1', 'EX', expiresInSeconds);
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const result = await redis.get(`${BLACKLIST_PREFIX}${token}`);
  return result !== null;
}
