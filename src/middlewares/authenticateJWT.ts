// src/middlewares/authenticateJWT.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;           // "Bearer <token>"
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      sub: string;
      role: number;
      iat: number;
      exp: number;
    };

    const user = await prisma.users.findUnique({ where: { user_id: payload.sub } });
    if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
    }

    (req as any).user = user;                          // attach à la request
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}