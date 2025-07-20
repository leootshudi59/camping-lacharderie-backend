import { PrismaClient, campsite } from '@prisma/client';
import { ICampsiteRepository } from '../interfaces/ICampsiteRepository';
import { CreateCampsiteDto } from '../../dtos/create-campsite.dto';
import { UpdateCampsiteDto } from '../../dtos/update-campsite.dto';

const prisma = new PrismaClient();

export class PrismaCampsiteRepository implements ICampsiteRepository {
  async create(data: CreateCampsiteDto): Promise<campsite> {
    return prisma.campsite.create({ data: { ...data, campsite_id: crypto.randomUUID() } });
  }
  async findAll(): Promise<campsite[]> {
    return prisma.campsite.findMany();
  }
  async findById(id: string): Promise<campsite | null> {
    return prisma.campsite.findUnique({ where: { campsite_id: id } });
  }
  async update(data: UpdateCampsiteDto): Promise<campsite> {
    return prisma.campsite.update({
      where: { campsite_id: data.campsite_id },
      data,
    });
  }
  async delete(id: string): Promise<void> {
    await prisma.campsite.delete({ where: { campsite_id: id } });
  }
}