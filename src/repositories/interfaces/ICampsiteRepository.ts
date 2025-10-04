import { campsite as Campsite } from '@prisma/client';
import { CreateCampsiteDto } from '../../dtos/create-campsite.dto';
import { UpdateCampsiteDto } from '../../dtos/update-campsite.dto';

export interface ICampsiteRepository {
  create(data: Campsite): Promise<Campsite>;
  findAll(): Promise<Campsite[]>;
  findById(id: string): Promise<Campsite | null>;
  update(data: Partial<Campsite> & { campsite_id: string }): Promise<Campsite>;
  delete(id: string): Promise<void>;
}