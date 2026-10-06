import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRole } from '../models/user.model.js';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  name: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as AuthTokenPayload;
}

