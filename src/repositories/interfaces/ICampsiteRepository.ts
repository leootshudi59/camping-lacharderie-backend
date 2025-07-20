import { campsite } from '@prisma/client';
import { CreateCampsiteDto } from '../../dtos/create-campsite.dto';
import { UpdateCampsiteDto } from '../../dtos/update-campsite.dto';

export interface ICampsiteRepository {
  create(data: CreateCampsiteDto): Promise<campsite>;
  findAll(): Promise<campsite[]>;
  findById(id: string): Promise<campsite | null>;
  update(data: UpdateCampsiteDto): Promise<campsite>;
  delete(id: string): Promise<void>;
}