import { redis, redisSub } from '../config/redis.js';
import { logger } from '../config/logger.js';

type EventHandler = (data: any) => void | Promise<void>;
const handlers = new Map<string, EventHandler[]>();

// Publish an event to Redis
export async function publishEvent(channel: string, data: Record<string, unknown>): Promise<void> {
  try {
    await redis.publish(channel, JSON.stringify({ channel, data, timestamp: new Date().toISOString() }));
  } catch (err) {
    logger.warn({ err, channel }, `Event publish failed`);
  }
}

// Subscribe to events (for Go server to publish, Express to consume)
export function subscribeToEvent(channel: string, handler: EventHandler): void {
  if (!handlers.has(channel)) {
    handlers.set(channel, []);
    redisSub.subscribe(channel).catch(err => logger.warn({ err, channel }, `Subscribe failed`));
  }
  handlers.get(channel)!.push(handler);
}

// Initialize subscriber message handling
redisSub.on('message', async (channel: string, message: string) => {
  const channelHandlers = handlers.get(channel);
  if (!channelHandlers) return;
  try {
    const parsed = JSON.parse(message);
    for (const handler of channelHandlers) {
      await handler(parsed.data);
    }
  } catch (err) {
    console.warn(`Event handler error (${channel}):`, err);
  }
});

// Connect both clients
export async function connectEventBus(): Promise<void> {
  try {
    await redis.connect();
    await redisSub.connect();
    console.log('Event bus connected');
  } catch (err) {
    console.warn('Event bus connection failed (running without Redis):', err);
  }
}

// Graceful disconnect
export async function disconnectEventBus(): Promise<void> {
  redis.disconnect();
  redisSub.disconnect();
}
