import { z } from 'zod';

export const RecordKillSchema = z.object({
  killerId: z.string().min(1, 'killerId is required'),
  victimId: z.string().min(1, 'victimId is required'),
});
