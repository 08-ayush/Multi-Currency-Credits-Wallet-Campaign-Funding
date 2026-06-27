import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}
