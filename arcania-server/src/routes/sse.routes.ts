import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { addClient, removeClient } from '../services/sse.service.js';

const router = Router();

// GET /api/sse/connect — SSE endpoint
router.get('/connect', authMiddleware, (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Send initial connected event
  res.write(`event: connected\ndata: ${JSON.stringify({ userId: req.userId })}\n\n`);

  // Register this connection
  addClient(req.userId!, res);

  // Cleanup on disconnect
  req.on('close', () => {
    removeClient(req.userId!, res);
  });
});

export default router;
