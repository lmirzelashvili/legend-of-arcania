import prisma from '../config/db.js';

export async function saveFailedEvent(channel: string, data: unknown, error: string): Promise<void> {
  await prisma.failedEvent.create({ data: { channel, data: data as any, error } });
}
