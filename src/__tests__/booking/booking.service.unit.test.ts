import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import { BookingService } from '../../../src/services/booking.service';
import { InMemoryBookingRepository } from '../mocks/InMemoryBookingRepository';

describe('BookingService - unit tests with InMemory repository', () => {
  let service: BookingService;
  const iso = (d: string) => new Date(d).toISOString();   // aide pour lisibilité
  let campsiteIdOk: string;

  beforeEach(() => {
    campsiteIdOk = randomUUID();
    const repo = new InMemoryBookingRepository(new Set([campsiteIdOk]));    
    service = new BookingService(repo);
  });

  it('creates a booking and returns it', async () => {
    const created = await service.create({
      campsite_id: campsiteIdOk,
      email: 'guest@example.com',
      start_date: iso('2025-08-01T12:00:00Z'),
      end_date:   iso('2025-08-07T10:00:00Z'),
      res_name:   'Smith',
    });

    expect(created.booking_id).toBeDefined();
    expect(created.res_name).toBe('Smith');
    expect(created.start_date.toISOString()).toBe(iso('2025-08-01T12:00:00Z'));
  });

  it('requires email OR phone', async () => {
    await expect(
      service.create({
        campsite_id: campsiteIdOk,
        start_date: iso('2025-08-10T12:00:00Z'),
        end_date:   iso('2025-08-12T10:00:00Z'),
        res_name:   'NoContact',
      } as any)
    ).rejects.toThrow('Either email or phone is required');
  });

  it('rejects booking where end_date <= start_date', async () => {
    await expect(
      service.create({
        campsite_id: campsiteIdOk,
        email: 'bad@example.com',
        start_date: iso('2025-08-15T12:00:00Z'),
        end_date:   iso('2025-08-14T10:00:00Z'),
        res_name:   'BadDates',
      })
    ).rejects.toThrow('end_date must be after start_date');
  });

  it('throws if campsite_id does not exist', async () => {
    await expect(
      service.create({
        campsite_id: randomUUID(),
        email: 'bad@example.com',
        start_date: iso('2025-08-10T12:00:00Z'),
        end_date:   iso('2025-08-12T10:00:00Z'),
        res_name:   'NoCampsite',
      })
    ).rejects.toThrow('Campsite not found');
  });

  it('rejects overlapping booking on same campsite', async () => {
    // Première réservation valide
    await service.create({
      campsite_id: campsiteIdOk,
      phone: '0700000000',
      start_date: iso('2025-09-01T12:00:00Z'),
      end_date:   iso('2025-09-05T10:00:00Z'),
      res_name:   'Dupont',
    });

    // Overlap (commence avant fin) → doit throw
    await expect(
      service.create({
        campsite_id: campsiteIdOk,
        email: 'overlap@example.com',
        start_date: iso('2025-09-04T15:00:00Z'),
        end_date:   iso('2025-09-06T10:00:00Z'),
        res_name:   'Overlap',
      })
    ).rejects.toThrow('Booking overlaps an existing booking for this campsite');

    // Edge case OK : commence exactement quand l’autre se termine
    const nonOverlap = await service.create({
      campsite_id: campsiteIdOk,
      email: 'ok@example.com',
      start_date: iso('2025-09-05T10:00:00Z'), // = previous end
      end_date:   iso('2025-09-07T10:00:00Z'),
      res_name:   'EdgeCase',
    });
    expect(nonOverlap.res_name).toBe('EdgeCase');
  });

  it('finds a booking by id', async () => {
    const b = await service.create({
      campsite_id: campsiteIdOk,
      phone: '0711223344',
      start_date: iso('2025-10-01T12:00:00Z'),
      end_date:   iso('2025-10-03T10:00:00Z'),
      res_name:   'Finder',
    });

    const found = await service.findById(b.booking_id);
    expect(found?.res_name).toBe('Finder');
  });

  it('updates a booking', async () => {
    const b = await service.create({
      campsite_id: campsiteIdOk,
      email: 'update@example.com',
      start_date: iso('2025-11-01T12:00:00Z'),
      end_date:   iso('2025-11-03T10:00:00Z'),
      res_name:   'Old',
    });

    const updated = await service.update({
      booking_id: b.booking_id,
      res_name: 'NewName',
    });

    expect(updated.res_name).toBe('NewName');
  });

  it('soft-deletes a booking', async () => {
    const b = await service.create({
      campsite_id: campsiteIdOk,
      email: 'delete@example.com',
      start_date: iso('2025-12-01T12:00:00Z'),
      end_date:   iso('2025-12-03T10:00:00Z'),
      res_name:   'ToDelete',
    });

    await service.delete(b.booking_id);
    const after = await service.findById(b.booking_id);

    expect(after).not.toBeNull();
    expect(after?.delete_date).toBeInstanceOf(Date);
  });

  it('returns all active bookings only', async () => {
    await service.create({
      campsite_id: campsiteIdOk,
      email: 'a@ex.com',
      start_date: iso('2026-01-01T12:00:00Z'),
      end_date:   iso('2026-01-03T10:00:00Z'),
      res_name:   'A',
    });
    const b = await service.create({
      campsite_id: campsiteIdOk,
      phone: '0722334455',
      start_date: iso('2026-02-01T12:00:00Z'),
      end_date:   iso('2026-02-03T10:00:00Z'),
      res_name:   'B',
    });
    await service.delete(b.booking_id);

    const all = await service.findAll();
    expect(all.length).toBe(1);
    expect(all[0].res_name).toBe('A');
  });

  it('throws when updating a non-existent booking', async () => {
    await expect(
      service.update({ booking_id: randomUUID(), res_name: 'Ghost' })
    ).rejects.toThrow('Booking not found');
  });
});