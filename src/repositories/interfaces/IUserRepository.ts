import { users as User } from '@prisma/client';

export interface IUserRepository {
  create(data: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(data: Partial<User> & { user_id: string }): Promise<User>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}