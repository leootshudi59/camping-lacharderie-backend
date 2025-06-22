import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { users as User } from '@prisma/client';
import { randomUUID } from 'crypto';

export class UserService {
  constructor(private userRepo: IUserRepository) { }

  async create(data: CreateUserDto): Promise<User> {
    // TODO: hash password properly (bcrypt, argon2…)
    // Email uniqueness check
    if (data.email) {
      const existingByEmail = await this.userRepo.findByEmail?.(data.email);

      if (existingByEmail) {
        throw new Error('Email already in use');
      }
    }
    // Phone uniqueness check
    if (data.phone) {
      console.log('Phone uniqueness check');
      const existingByPhone = await this.userRepo.findByPhone?.(data.phone);
      console.log("all users: ", await this.userRepo.findAll());

      if (existingByPhone) {
        throw new Error('Phone already in use');
      }
    }

    const newUser: User = {
      ...data,
      user_id: randomUUID(),
      created_at: new Date(),
    } as User;
    return this.userRepo.create(newUser);
  }

  findAll() {
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
}