import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = crypto.randomUUID();
  req.requestId = requestId;

  const startTime = Date.now();
  const childLogger = logger.child({ requestId });

  childLogger.info({
    msg: 'request start',
    method: req.method,
    path: req.path,
    userId: req.userId,
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    childLogger.info({
      msg: 'request finish',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
}
