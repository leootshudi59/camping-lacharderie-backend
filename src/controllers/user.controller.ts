import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '../repositories/prisma/PrismaUserRepository';
import { UserService } from '../services/user.service';
import { CreateUserSchema } from '../dtos/create-user.dto';
import { UpdateUserSchema } from '../dtos/update-user.dto';

const repo = new PrismaUserRepository();
const service = new UserService(repo);

/**
 * Get all users
 */
export const getAllUsers = async (_: Request, res: Response, next: NextFunction) => {
  const users = await service.findAll();
  res.json(users);
};

/**
 * Get a user by ID
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const user = await service.findById(req.params.user_id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const dto = CreateUserSchema.parse(req.body);
    const user = await service.create(dto);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const dto = UpdateUserSchema.parse({ ...req.body, user_id: req.params.id });
    const user = await service.update(dto);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (req: Request, res: Response) => {
  await service.delete(req.params.id);
  res.status(204).send();
};