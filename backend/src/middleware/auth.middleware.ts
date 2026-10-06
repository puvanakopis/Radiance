import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthTokenPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}


