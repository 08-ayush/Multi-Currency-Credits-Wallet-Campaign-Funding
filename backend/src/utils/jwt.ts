import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: number;
  email: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn } as SignOptions);

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwt.secret) as JwtPayload;
