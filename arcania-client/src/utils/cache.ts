export const CACHE_TTL = { default: 60_000, badges: 30_000 };

export function isStale(lastFetched: number | null, ttlMs = CACHE_TTL.default): boolean {
  return !lastFetched || Date.now() - lastFetched > ttlMs;
}
