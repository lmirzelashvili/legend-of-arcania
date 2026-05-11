import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as friendsService from '../services/friends.service.js';
import { SendFriendRequestSchema } from '../schemas/friends.schema.js';

const router = Router();
router.use(authMiddleware);

// GET /api/friends — list all friends
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const friends = await friendsService.getFriends(req.userId!);
    res.json(friends);
  } catch (err) { next(err); }
});

// GET /api/friends/requests — get pending incoming + outgoing requests
router.get('/requests', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await friendsService.getPendingRequests(req.userId!);
    res.json(requests);
  } catch (err) { next(err); }
});

// POST /api/friends/request — send a friend request
router.post('/request', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = SendFriendRequestSchema.parse(req.body);
    const result = await friendsService.sendFriendRequest(req.userId!, username);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/friends/accept/:id — accept a friend request
router.post('/accept/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await friendsService.acceptFriendRequest(req.userId!, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/friends/reject/:id — reject a friend request
router.post('/reject/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await friendsService.rejectFriendRequest(req.userId!, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

// DELETE /api/friends/:id — remove a friend
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await friendsService.removeFriend(req.userId!, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
