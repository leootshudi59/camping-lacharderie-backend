import { PrismaClient, campsite as Campsite } from '@prisma/client';
import { ICampsiteRepository } from '../interfaces/ICampsiteRepository';

const prisma = new PrismaClient();

export class PrismaCampsiteRepository implements ICampsiteRepository {
  async create(data: Campsite): Promise<Campsite> {
    return prisma.campsite.create({ data: { ...data, campsite_id: crypto.randomUUID() } });
  }
  async findAll(): Promise<Campsite[]> {
    return prisma.campsite.findMany();
  }
  async findById(id: string): Promise<Campsite | null> {
    return prisma.campsite.findUnique({ where: { campsite_id: id } });
  }
  async update(data: Partial<Campsite> & { campsite_id: string }): Promise<Campsite> {
    return prisma.campsite.update({
      where: { campsite_id: data.campsite_id },
      data,
    });
  }
  async delete(id: string): Promise<void> {
    await prisma.campsite.delete({ where: { campsite_id: id } });
  }
}