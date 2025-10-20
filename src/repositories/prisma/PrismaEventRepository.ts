import { PrismaClient, events as Event } from '@prisma/client';
import { IEventRepository } from '../interfaces/IEventRepository';
import { CreateEventDto } from '../../dtos/create-event.dto';
import { UpdateEventDto } from '../../dtos/update-event.dto';

const prisma = new PrismaClient();

export class PrismaEventRepository implements IEventRepository {
  async create(data: CreateEventDto): Promise<Event> {
    return prisma.events.create({
      data: { 
        ...data, 
        event_id: crypto.randomUUID(),
        start_datetime: new Date(data.start_datetime),
        end_datetime: new Date(data.end_datetime),
        },
    });
  }

  async findAll(): Promise<Event[]> {
    return prisma.events.findMany();
  }

  async findById(id: string): Promise<Event | null> {
    return prisma.events.findUnique({ where: { event_id: id } });
  }

  async update(data: UpdateEventDto): Promise<Event> {
    return prisma.events.update({
      where: { event_id: data.event_id },
      data: {
        ...data,
        start_datetime: data.start_datetime ? new Date(data.start_datetime) : undefined,
        end_datetime: data.end_datetime ? new Date(data.end_datetime) : undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.events.delete({ where: { event_id: id } });
  }
}