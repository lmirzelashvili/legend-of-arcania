import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 10) return null; // Stop retrying after 10 attempts
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.warn('Redis error:', err.message));

// Separate client for pub/sub (ioredis requires dedicated connection for subscribers)
const redisSub = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 10) return null;
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

export { redis, redisSub };
export default redis;
