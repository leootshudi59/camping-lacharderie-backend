import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaUserRepository } from '../repositories/prisma/PrismaUserRepository';
import { UserService } from '../services/user.service';
import { CreateUserSchema } from '../dtos/create-user.dto';
import { UpdateUserSchema } from '../dtos/update-user.dto';
import { LoginUserSchema } from '../dtos/login-user.dto';
import { Role } from '../constants/roles';
import { ChangeRoleSchema } from '../dtos/change-role.dto';
dotenv.config();

const repo = new PrismaUserRepository();
const service = new UserService(repo);

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

/**
 * Get all users
 */
export const getAllUsers = async (_: Request, res: Response, next: NextFunction) => {
  try {
    if (DEBUG_MODE) console.log("\n=====  [ADMIN ONLY] getAllUsers  =====");
    const users = await service.findAll();
    res.status(200).json(users);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get a user by ID
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  getUserById  =====");
      console.log("received user_id: " + req.params.user_id);
    }
    const user = await service.findById(req.params.user_id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get a user by email
 */
export const getUserByEmail = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  [ADMIN ONLY] getUserByEmail  =====");
      console.log("received email: " + req.params.email);
    }

    const user = await service.findByEmail(req.params.email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get a user by phone
 */
export const getUserByPhone = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  [ADMIN ONLY] getUserByPhone  =====");
      console.log("received phone: " + req.params.phone);
    }
    
    const user = await service.findByPhone(req.params.phone);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response): Promise<any> => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  createUser  =====");
      console.log("received body: " + req.body);
    }

    const dto = CreateUserSchema.parse(req.body);
    const user = await service.create(dto);
    res.status(201).json(user);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);

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
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  updateUser  =====");
      console.log("received user_id: ", req.params.user_id, "body: ", req.body);
    }

    const dto = UpdateUserSchema.parse({ ...req.body, user_id: req.params.user_id });
    const user = await service.update(dto);
    res.status(200).json(user);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  deleteUser  =====");
      console.log("received user_id: " + req.params.user_id);
    }

    await service.delete(req.params.user_id);
    res.status(204).send();
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Login a user (via email or phone)
 */
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  loginUser  =====");
      console.log("received body: " + req.body);
    }

    const dto = LoginUserSchema.parse(req.body);
    const user = await service.login(dto.identifier, dto.password); // ✅ utilise dto

    // ---- JWT here
    const secret: Secret = process.env.JWT_SECRET!;
    DEBUG_MODE && console.log("JWT secret: ", secret);
    
    const token = jwt.sign(
      { sub: user.user_id, role: user.role as Role },            // payload
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' } as SignOptions
    );

    // Remove password_hash from response
    const { password_hash, ...safeUser } = user;
    res.status(200).json({ ...safeUser, token });
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  try {
    const dto = ChangeRoleSchema.parse(req.body);          // { role: 0|1 }
    const updated = await service.changeRole(req.params.user_id, dto.role);
    res.status(200).json(updated);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};