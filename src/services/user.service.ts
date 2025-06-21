import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { users as User } from '@prisma/client';
import { randomUUID } from 'crypto';

export class UserService {
  constructor(private userRepo: IUserRepository) {}

  async create(data: CreateUserDto): Promise<User> {
    // TODO: hash password properly (bcrypt, argon2…)
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

  update(data: UpdateUserDto) {
    const updatedData = {
      ...data,
      delete_date: data.delete_date ? new Date(data.delete_date) : undefined,
    };
    return this.userRepo.update(updatedData);
  }

  delete(id: string) {
    return this.userRepo.delete(id);
  }
}