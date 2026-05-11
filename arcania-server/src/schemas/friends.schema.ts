import { z } from 'zod';

export const SendFriendRequestSchema = z.object({
  username: z.string().min(1, 'username is required'),
});
