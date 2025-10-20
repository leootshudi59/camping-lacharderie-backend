import { describe, it, expect, beforeEach } from 'vitest';
import { EventService } from '../../../src/services/event.service';
import { InMemoryEventRepository } from '../mocks/InMemoryEventRepository';
import { randomUUID } from 'crypto';

describe('EventService - unit tests with InMemory repository', () => {
  let service: EventService;
  const iso = (s: string) => new Date(s).toISOString();

  beforeEach(() => {
    service = new EventService(new InMemoryEventRepository());
  });

  it('creates an event and returns it', async () => {
    const created = await service.create({
      title: 'Feu de camp',
      description: 'Soirée conviviale',
      start_datetime: iso('2030-07-01T18:00:00Z'),
      end_datetime:   iso('2030-07-01T21:00:00Z'),
      location: 'Place centrale',
    });

    expect(created.event_id).toBeDefined();
    expect(created.title).toBe('Feu de camp');
    expect(created.location).toBe('Place centrale');
    expect(created.start_datetime).toBeInstanceOf(Date);
    expect(created.end_datetime).toBeInstanceOf(Date);
  });

  it('rejects when end_datetime <= start_datetime', async () => {
    await expect(
      service.create({
        title: 'Bad',
        start_datetime: iso('2030-07-01T20:00:00Z'),
        end_datetime:   iso('2030-07-01T19:00:00Z'),
      })
    ).rejects.toThrow('end_date must be after start_date');

    await expect(
      service.create({
        title: 'Equal',
        start_datetime: iso('2030-07-01T20:00:00Z'),
        end_datetime:   iso('2030-07-01T20:00:00Z'),
      })
    ).rejects.toThrow('end_date must be after start_date');
  });

  it('finds an event by id', async () => {
    const ev = await service.create({
      title: 'Tournoi de pétanque',
      description: 'Doublette',
      start_datetime: iso('2030-08-10T09:00:00Z'),
      end_datetime:   iso('2030-08-10T12:00:00Z'),
    });

    const found = await service.findById(ev.event_id);
    expect(found?.title).toBe('Tournoi de pétanque');
    expect(found?.description).toBe('Doublette');
  });

  it('updates an event (partial fields)', async () => {
    const ev = await service.create({
      title: 'Kermesse',
      start_datetime: iso('2030-06-20T10:00:00Z'),
      end_datetime:   iso('2030-06-20T16:00:00Z'),
      location: 'Parking',
    });

    const updated = await service.update({
      event_id: ev.event_id,
      title: 'Grande Kermesse',
      location: 'Prairie',
    });

    expect(updated.title).toBe('Grande Kermesse');
    expect(updated.location).toBe('Prairie');
    // date non modifiée
    expect(updated.start_datetime.toISOString()).toBe(iso('2030-06-20T10:00:00Z'));
  });

  it('deletes an event', async () => {
    const ev = await service.create({
      title: 'Cinéma plein air',
      start_datetime: iso('2030-07-05T20:30:00Z'),
      end_datetime:   iso('2030-07-05T22:30:00Z'),
    });

    await service.delete(ev.event_id);
    const after = await service.findById(ev.event_id);
    expect(after).toBeNull();
  });

  it('returns all events', async () => {
    await service.create({
      title: 'Yoga',
      start_datetime: iso('2030-07-02T07:00:00Z'),
      end_datetime:   iso('2030-07-02T08:00:00Z'),
    });
    await service.create({
      title: 'Concert',
      start_datetime: iso('2030-07-03T20:00:00Z'),
      end_datetime:   iso('2030-07-03T22:00:00Z'),
    });

    const all = await service.findAll();
    expect(all.length).toBe(2);
    expect(all.map(e => e.title)).toContain('Yoga');
    expect(all.map(e => e.title)).toContain('Concert');
  });

  it('throws if updating a non-existent event', async () => {
    await expect(
      service.update({ event_id: randomUUID(), title: 'Ghost' })
    ).rejects.toThrow('Event not found');
  });
});