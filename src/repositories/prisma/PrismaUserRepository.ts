import { prisma } from '../../config/prisma';
import { IUserRepository } from '../interfaces/IUserRepository';
import { users as User } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
  async create(data: User): Promise<User> {
    return prisma.users.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { user_id: id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.users.findUnique({ where: { phone: phone } });
  }

  async findAll(): Promise<User[]> {
    return prisma.users.findMany();
  }

  async update(data: Partial<User> & { user_id: string }): Promise<User> {
    return prisma.users.update({
      where: { user_id: data.user_id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.users.delete({ where: { user_id: id } });
  }
}