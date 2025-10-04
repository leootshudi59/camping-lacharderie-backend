// middleware/requireSelfOrAdmin.ts
import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles';

export function requireSelfOrAdmin(req: Request, res: Response, next: NextFunction) {
  const current = (req as any).user;
  const targetId = req.params.user_id;
  if (current.user_id === targetId || current.role === Role.Admin) {
    next();
    return;
  }
  res.status(403).json({ error: 'Forbidden' });
}