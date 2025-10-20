import { IEventRepository } from '../repositories/interfaces/IEventRepository';
import { CreateEventDto } from '../dtos/create-event.dto';
import { UpdateEventDto } from '../dtos/update-event.dto';
import { events as Event } from '@prisma/client';
import { randomUUID } from 'crypto';

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class EventService {
  constructor(private eventRepo: IEventRepository) {}

  async create(dto: CreateEventDto): Promise<Event> {
    if (DEBUG_MODE) console.log("data: ", dto);

    if (new Date(dto.end_datetime) <= new Date(dto.start_datetime)) {
      throw new Error('end_date must be after start_date');
    }
    return this.eventRepo.create(dto);
  }

  findAll(): Promise<Event[]> {
    return this.eventRepo.findAll();
  }

  findById(id: string): Promise<Event | null> {
    return this.eventRepo.findById(id);
  }

  update(data: UpdateEventDto): Promise<Event> {
    const updatedData = { ...data };
    return this.eventRepo.update(updatedData);
  }

  delete(id: string): Promise<void> {
    return this.eventRepo.delete(id);
  }
}