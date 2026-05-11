import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.errors.map(e => e.message).join(', ');
    res.status(400).json({ error: message, message });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error', message: 'Internal server error' });
}
