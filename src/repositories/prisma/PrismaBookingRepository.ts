import { PrismaClient, bookings as Booking } from '@prisma/client';
import { BookingWithCampsite, IBookingRepository } from '../interfaces/IBookingRepository';
import { CreateBookingDto } from '../../dtos/create-booking.dto';
import { UpdateBookingDto } from '../../dtos/update-booking.dto';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });

export class PrismaBookingRepository implements IBookingRepository {
  async create(data: CreateBookingDto): Promise<Booking> {
    return prisma.bookings.create({
      data: {
        ...data,
        booking_id: randomUUID(),
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
      },
    });
  }

  async update(data: UpdateBookingDto): Promise<Booking> {
    return prisma.bookings.update({
      where: { booking_id: data.booking_id },
      data: {
        ...data,
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date:   data.end_date   ? new Date(data.end_date)   : undefined,
      },
    });
  }
  
  async findOverlapping(campsite_id: string, start: Date, end: Date) {
    return prisma.bookings.findMany({
      where: {
        campsite_id,
        delete_date: { equals: null },
        AND: [
          { start_date: { lt: end  } },   // existing.start < newEnd
          { end_date:   { gt: start } },  // existing.end   > newStart
        ],
      },
    });
  }


  async findAll(): Promise<BookingWithCampsite[]> {
    return prisma.bookings.findMany({ 
      where: { delete_date: { equals: null } }, 
      include: { campsite: { select: { name: true } } }
    });
  }

  async findById(id: string): Promise<BookingWithCampsite | null> {
    return prisma.bookings.findUnique({ 
      where: { booking_id: id }, 
      include: { campsite: { select: { name: true } } }
    });
  }

  async campsiteExists(id: string) {
    const cs = await prisma.campsite.findUnique({ where: { campsite_id: id } });
    return !!cs;
  }
}