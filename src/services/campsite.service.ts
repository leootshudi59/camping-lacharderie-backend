import { ICampsiteRepository } from '../repositories/interfaces/ICampsiteRepository';
import { CreateCampsiteDto } from '../dtos/create-campsite.dto';
import { UpdateCampsiteDto } from '../dtos/update-campsite.dto';
import { campsite as Campsite } from '@prisma/client';

export class CampsiteService {
  constructor(private campsiteRepo: ICampsiteRepository) {}

  create(data: CreateCampsiteDto): Promise<Campsite> {
    return this.campsiteRepo.create(data);
  }
  findAll(): Promise<Campsite[]> {
    return this.campsiteRepo.findAll();
  }
  findById(id: string): Promise<Campsite | null> {
    return this.campsiteRepo.findById(id);
  }
  update(data: UpdateCampsiteDto): Promise<Campsite> {
    return this.campsiteRepo.update(data);
  }
  delete(id: string): Promise<void> {
    return this.campsiteRepo.delete(id);
  }
}