import { IBookingRepository } from '../repositories/interfaces/IBookingRepository';
import { bookings as Booking } from '@prisma/client';

export class GuestAuthService {
  constructor(private bookingRepo: IBookingRepository) {}

  async authenticate(resName: string, bookingNumber: string): Promise<Booking | null> {
    if (!resName?.trim() || !bookingNumber?.trim()) return null;
    const b = await this.bookingRepo.findByNameAndNumber(resName, bookingNumber);
    return b ?? null;
  }
}
