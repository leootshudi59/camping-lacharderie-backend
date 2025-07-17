// src/middlewares/requireAdmin.ts
import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== Role.Admin) {
    res.status(403).json({ error: 'Forbidden – admin only' });
    return;
  }
  next();
}