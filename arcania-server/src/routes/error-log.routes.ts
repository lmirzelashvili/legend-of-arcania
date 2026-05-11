import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as errorLogService from '../services/error-log.service.js';

const router = Router();

// POST is open (client sends errors before/without auth) but rate-limited by batch size
router.post('/', (req: Request, res: Response) => {
  const raw = Array.isArray(req.body) ? req.body : [req.body];
  errorLogService.appendErrors(raw).then(() => {
    res.json({ ok: true });
  }).catch((fsErr) => {
    console.error('Failed to write client error log:', fsErr);
    res.status(500).json({ ok: false });
  });
});

// GET and DELETE require authentication
router.get('/', authMiddleware, (_req: Request, res: Response) => {
  res.json(errorLogService.readErrors());
});

router.delete('/', authMiddleware, (_req: Request, res: Response) => {
  errorLogService.clearErrors();
  res.json({ ok: true, message: 'Log cleared' });
});

export default router;
