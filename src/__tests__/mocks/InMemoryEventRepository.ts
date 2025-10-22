import { IEventRepository } from '../../../src/repositories/interfaces/IEventRepository';
import { events as Event } from '@prisma/client';
import { CreateEventDto } from '../../../src/dtos/create-event.dto';
import { UpdateEventDto } from '../../../src/dtos/update-event.dto';
import { randomUUID } from 'crypto';

export class InMemoryEventRepository implements IEventRepository {
  private store = new Map<string, Event>();

  async create(data: CreateEventDto): Promise<Event> {
    const id = randomUUID();
    const entity: Event = {
      event_id: id,
      title: data.title,
      description: data.description ?? null,
      start_datetime: new Date(data.start_datetime),
      end_datetime: new Date(data.end_datetime),
      location: data.location ?? null,
      language: null,
      created_by: null,
      image: data.image ?? null, // Buffer ok en Node, étend Uint8Array
    };
    this.store.set(id, entity);
    return entity;
  }

  async findAll(): Promise<Event[]> {
    // Si tu veux filtrer/ordonner : gère ici
    return Array.from(this.store.values());
  }

  async findById(id: string): Promise<Event | null> {
    return this.store.get(id) ?? null;
  }

  async update(data: UpdateEventDto): Promise<Event> {
    const current = this.store.get(data.event_id);
    if (!current) throw new Error('Event not found');

    // IMPORTANT : ne modifie que les champs fournis
    const updated: Event = {
      ...current,
      title: data.title ?? current.title,
      description: data.description ?? current.description,
      start_datetime: data.start_datetime ? new Date(data.start_datetime) : current.start_datetime,
      end_datetime:   data.end_datetime   ? new Date(data.end_datetime)   : current.end_datetime,
      location: data.location ?? current.location,
      image: data.image ?? current.image,
      // language, created_by pas gérés par UpdateEventDto pour l’instant
    };

    this.store.set(updated.event_id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}