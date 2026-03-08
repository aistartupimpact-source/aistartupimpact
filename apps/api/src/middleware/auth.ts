import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Access token required',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({
      success: false,
      data: null,
      error: 'Invalid or expired token',
    });
  }
}

export function generateAccessToken(user: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(user: { id: string; email: string; role: string; name: string }) {
  const REFRESH_SECRET = process.env.REFRESH_SECRET || 'dev-refresh-secret';
  return jwt.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
}
