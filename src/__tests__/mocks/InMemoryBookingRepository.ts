import { randomUUID } from 'crypto';
import { bookings as Booking } from '@prisma/client';
import { IBookingRepository } from '../../../src/repositories/interfaces/IBookingRepository';
import { CreateBookingDto } from '../../../src/dtos/create-booking.dto';
import { UpdateBookingDto } from '../../../src/dtos/update-booking.dto';

/**
 * Dépôt en mémoire – idéal pour les tests unitaires.
 */
export class InMemoryBookingRepository implements IBookingRepository {
  private store: Map<string, Booking> = new Map();

  constructor(private knownCampsites: Set<string> = new Set()) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    const booking: Booking = {
      ...data,
      booking_id: randomUUID(),
      start_date: new Date(data.start_date),
      end_date:   new Date(data.end_date),
      delete_date: null,
    } as Booking;
    this.store.set(booking.booking_id, booking);
    return booking;
  }

  async findAll(): Promise<Booking[]> {
    return [...this.store.values()].filter(b => !b.delete_date);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.store.get(id) ?? null;
  }

  async update(data: UpdateBookingDto): Promise<Booking> {
    const existing = this.store.get(data.booking_id);
    if (!existing) throw new Error('Booking not found');
    const updated: Booking = {
      ...existing,
      ...data,
      start_date: data.start_date ? new Date(data.start_date) : existing.start_date,
      end_date:   data.end_date   ? new Date(data.end_date)   : existing.end_date,
      delete_date: data.delete_date ? new Date(data.delete_date) : existing.delete_date,
    };
    this.store.set(updated.booking_id, updated);
    return updated;
  }

  /** Retourne les réservations qui se chevauchent (même locatif, non supprimées) */
  async findOverlapping(campsite_id: string, start: Date, end: Date): Promise<Booking[]> {
    return [...this.store.values()].filter(b =>
      b.campsite_id === campsite_id &&
      !b.delete_date &&
      b.start_date < end &&            // existing.start < newEnd
      b.end_date   > start             // existing.end   > newStart
    );
  }

  campsiteExists(id: string) {
    return Promise.resolve(this.knownCampsites.has(id));
  }
}