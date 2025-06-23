import { Request, Response, NextFunction } from 'express';
import { PrismaUserRepository } from '../repositories/prisma/PrismaUserRepository';
import { UserService } from '../services/user.service';
import { CreateUserSchema } from '../dtos/create-user.dto';
import { UpdateUserSchema } from '../dtos/update-user.dto';
import { LoginUserSchema } from '../dtos/login-user.dto';

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
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = await service.findById(req.params.user_id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json(user);
};

/**
 * Get a user by email
 */
export const getUserByEmail = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const user = await service.findByEmail(req.params.email);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json(user);
};

/**
 * Get a user by phone
 */
export const getUserByPhone = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const debugMode = process.env.DEBUG_MODE === 'true';
  
  try {
    const user = await service.findByPhone(req.params.phone);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err: any) {
    debugMode && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response): Promise<any> => {
  const debugMode = process.env.DEBUG_MODE === 'true';

  try {
    debugMode && console.log("received body: " + req.body);
    const dto = CreateUserSchema.parse(req.body);
    const user = await service.create(dto);
    res.status(201).json(user);
  } catch (err: any) {
    debugMode && console.error(err);

    if (err instanceof Error && (err.message.includes('already in use'))) {
      return res.status(409).json({ error: err.message });
    }

    res.status(400).json({ error: err.message });
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (req: Request, res: Response) => {
  const debugMode = process.env.DEBUG_MODE === 'true';

  try {
    debugMode && console.log("received user_id: ", req.params.user_id, "body: ", req.body);
    const dto = UpdateUserSchema.parse({ ...req.body, user_id: req.params.user_id });
    const user = await service.update(dto);
    res.status(200).json(user);
  } catch (err: any) {
    debugMode && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (req: Request, res: Response) => {
  const debugMode = process.env.DEBUG_MODE === 'true';

  try {
    debugMode && console.log("received user_id: " + req.params.user_id);
    await service.delete(req.params.user_id);
    res.status(204).send();
  } catch (err: any) {
    debugMode && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Login a user (via email or phone)
 */
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const debugMode = process.env.DEBUG_MODE === 'true';

  try {
    debugMode && console.log("received body: " + req.body);
    const dto = LoginUserSchema.parse(req.body);
    const user = await service.login(dto.identifier, dto.password); // ✅ utilise dto

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (err: any) {
    debugMode && console.error(err);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};