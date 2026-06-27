import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

type Source = 'body' | 'query' | 'params';

// Validates and replaces req[source] with the parsed (typed) value.
export const validate =
  (schema: ZodSchema, source: Source = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw AppError.badRequest('Validation failed', result.error.flatten());
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = result.data;
    next();
  };
