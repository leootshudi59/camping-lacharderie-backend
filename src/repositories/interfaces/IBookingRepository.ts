import { bookings as Booking } from '@prisma/client';
import { CreateBookingDto } from '../../dtos/create-booking.dto';
import { UpdateBookingDto } from '../../dtos/update-booking.dto';

export interface IBookingRepository {
  create(data: CreateBookingDto): Promise<Booking>;
  findAll(): Promise<Booking[]>;
  findById(id: string): Promise<Booking | null>;
  update(data: UpdateBookingDto): Promise<Booking>;

  /**
   * Returns bookings that overlap on the given range
   * @param campsite_id 
   * @param start 
   * @param end 
   */
  findOverlapping(campsite_id: string, start: Date, end: Date): Promise<Booking[]>;
}