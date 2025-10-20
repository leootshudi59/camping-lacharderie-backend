import { events as Event } from '@prisma/client';
import { CreateEventDto } from '../../dtos/create-event.dto';
import { UpdateEventDto } from '../../dtos/update-event.dto';

export interface IEventRepository {
  create(data: CreateEventDto): Promise<Event>;
  findAll(): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  update(data: Partial<UpdateEventDto> & { event_id: string }): Promise<Event>;
  delete(id: string): Promise<void>;
}