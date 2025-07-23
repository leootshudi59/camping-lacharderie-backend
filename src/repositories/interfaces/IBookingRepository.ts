import { bookings as Booking, campsite } from '@prisma/client';
import { CreateBookingDto } from '../../dtos/create-booking.dto';
import { UpdateBookingDto } from '../../dtos/update-booking.dto';

export type BookingWithCampsite = Booking & { campsite: Pick<campsite, 'name'> | null };

export interface IBookingRepository {
  create(data: CreateBookingDto): Promise<Booking>;
  findAll(): Promise<BookingWithCampsite[]>;
  findById(id: string): Promise<BookingWithCampsite | null>;
  update(data: UpdateBookingDto): Promise<Booking>;

  /**
   * Returns bookings that overlap on the given range
   * @param campsite_id 
   * @param start 
   * @param end 
   */
  findOverlapping(campsite_id: string, start: Date, end: Date): Promise<Booking[]>;
  /**
   * Checks if the campsite exists in the campsite table
   * @param id 
   */
  campsiteExists(id: string): Promise<boolean>;
}