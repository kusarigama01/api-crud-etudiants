import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_jwt_secret';
export type JwtPayloadType = jwt.JwtPayload & { username?: string; sub?: string };
export const authenticateToken = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) { next(new Error('Token manquant')); return; }
  try {
    req.user = jwt.verify(token, JWT_SECRET) as JwtPayloadType;
    next();
  } catch (err) { next(new Error('Token invalide')); }
};
