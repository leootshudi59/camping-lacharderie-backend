import { ICampsiteRepository } from '../repositories/interfaces/ICampsiteRepository';
import { CreateCampsiteDto } from '../dtos/create-campsite.dto';
import { UpdateCampsiteDto } from '../dtos/update-campsite.dto';
import { campsite as Campsite } from '@prisma/client';
import { randomUUID } from 'crypto';

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class CampsiteService {
  constructor(private campsiteRepo: ICampsiteRepository) {}

  create(data: CreateCampsiteDto): Promise<Campsite> {
    if (DEBUG_MODE) console.log("data: ", data);

    const safeData = {
      ...data,
      campsite_id: randomUUID(),
    } as Campsite;
    return this.campsiteRepo.create(safeData);
  }
  findAll(): Promise<Campsite[]> {
    return this.campsiteRepo.findAll();
  }
  findById(id: string): Promise<Campsite | null> {
    return this.campsiteRepo.findById(id);
  }
  update(data: UpdateCampsiteDto) {
    const updatedData = {
      ...data,
    };
    return this.campsiteRepo.update(updatedData);
  }
  delete(id: string): Promise<void> {
    return this.campsiteRepo.delete(id);
  }
}