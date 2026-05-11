import type { Response } from 'express';
import { subscribeToEvent } from './event-bus.service.js';
import { logger } from '../config/logger.js';

const clients = new Map<string, Set<Response>>();

export function addClient(userId: string, res: Response) {
  if (!clients.has(userId)) clients.set(userId, new Set());
  clients.get(userId)!.add(res);
  logger.info({ userId, totalClients: countClients() }, 'SSE client connected');
}

export function removeClient(userId: string, res: Response) {
  clients.get(userId)?.delete(res);
  if (clients.get(userId)?.size === 0) clients.delete(userId);
  logger.info({ userId, totalClients: countClients() }, 'SSE client disconnected');
}

function countClients(): number {
  let count = 0;
  for (const set of clients.values()) count += set.size;
  return count;
}

export function broadcastToUser(userId: string, event: string, data: unknown) {
  const userClients = clients.get(userId);
  if (!userClients) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of userClients) {
    res.write(payload);
  }
}

// Subscribe to Redis events and broadcast to connected SSE clients
export function initSSESubscriptions() {
  const events = [
    'character.levelup', 'equipment.changed', 'combat.pvp_kill',
    'combat.pve_kill', 'combat.death', 'booster.activated',
    'trade.completed', 'character.deleted',
  ];

  for (const event of events) {
    subscribeToEvent(event, (data) => {
      // Events include userId in their payload
      if (data.userId) broadcastToUser(data.userId as string, event, data);
    });
  }
}
