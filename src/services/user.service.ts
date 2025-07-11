import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { users as User } from '@prisma/client';
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Role } from '../constants/roles';
dotenv.config();

const SALT_ROUNDS = 10;

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class UserService {
  constructor(private userRepo: IUserRepository) { }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async validatePassword(plainPassword: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hash);
  }

  async create(data: CreateUserDto): Promise<User> {
    // Email uniqueness check
    if (data.email) {
      const existingByEmail = await this.userRepo.findByEmail?.(data.email);

      if (existingByEmail) {
        throw new Error('Email already in use');
      }
    }
    // Phone uniqueness check
    if (data.phone) {
      const existingByPhone = await this.userRepo.findByPhone?.(data.phone);
      if (existingByPhone) {
        throw new Error('Phone already in use');
      }
    }

    const hashedPassword = await this.hashPassword(data.password);

    const {
      password,    // on retire le champ du DTO
      ...safeData  // on garde le reste
    } = data;
    const newUser: User = {
      ...safeData,
      password_hash: hashedPassword,
      user_id: randomUUID(),
      created_at: new Date(),
    } as User;
    return this.userRepo.create(newUser);
  }

  findAll() {
    if (DEBUG_MODE) console.log("findAll");
    return this.userRepo.findAll();
  }

  findById(id: string) {
    return this.userRepo.findById(id);
  }

  findByEmail(email: string) {
    return this.userRepo.findByEmail?.(email);
  }

  findByPhone(phone: string) {
    return this.userRepo.findByPhone?.(phone);
  }

  update(data: UpdateUserDto) {
    const updatedData = {
      ...data,
      delete_date: data.delete_date ? new Date(data.delete_date) : undefined,
    };
    return this.userRepo.update(updatedData);
  }

  /**
   * Soft-delete a user
   */
  delete(id: string) {
    return this.userRepo.update({
      user_id: id,
      delete_date: new Date(),
    });
  }

  /**
   * Authenticates a user by email OR phone and password.
   * @param identifier email OR phone
   * @param password plain password (not hashed)
   * @throws Error if credentials are invalid
   * @returns User object
   */
  async login(identifier: string, password: string): Promise<User> {
    // Detect mail format
    let user: User | null = null;
    if (DEBUG_MODE) console.log("identifier: ", identifier);
    if (DEBUG_MODE) console.log("password: ", password);

    if (identifier.includes('@')) {
      user = await this.userRepo.findByEmail?.(identifier) ?? null;
    } else {
      user = await this.userRepo.findByPhone?.(identifier) ?? null;
    }

    if (DEBUG_MODE) console.log("user password_hash: ", user?.password_hash)

    if (!user) throw new Error('Invalid credentials');

    const isMatch = await this.validatePassword(password, user.password_hash);
    if (!isMatch) throw new Error('Invalid credentials');

    return user;
  }

  isAdmin(user: User): boolean {
    return user.role === Role.Admin;
  }

  hasRole(user: User, role: Role): boolean {
    return user.role === role;
  }

}