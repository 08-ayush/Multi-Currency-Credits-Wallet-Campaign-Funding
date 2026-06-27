import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  // Unique-constraint violations surface as 409 conflicts.
  const anyErr = err as { name?: string; message?: string };
  if (anyErr?.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'Duplicate resource' } });
    return;
  }

  if (!env.isTest) {
    // eslint-disable-next-line no-console
    console.error('[UnhandledError]', err);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      ...(env.isProd ? {} : { detail: anyErr?.message }),
    },
  });
}
