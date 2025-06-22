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
  res.status(200).json(users);
};

/**
 * Get a user by ID
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const user = await service.findById(req.params.user_id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json(user);
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const debugMode = process.env.DEBUG_MODE === 'true';
    debugMode && console.log("received body: " + req.body);
    const dto = CreateUserSchema.parse(req.body);
    const user = await service.create(dto);
    res.status(201).json(user);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const debugMode = process.env.DEBUG_MODE === 'true';
    debugMode && console.log("received user_id: ", req.params.user_id, "body: ", req.body);
    const dto = UpdateUserSchema.parse({ ...req.body, user_id: req.params.user_id });
    const user = await service.update(dto);
    res.status(200).json(user);
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const debugMode = process.env.DEBUG_MODE === 'true';
    debugMode && console.log("received user_id: " + req.params.user_id);
    await service.delete(req.params.user_id);
    res.status(204).send();
  } catch (err: any) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};