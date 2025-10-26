import { BookingWithCampsite, IBookingRepository } from '../repositories/interfaces/IBookingRepository';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { UpdateBookingDto } from '../dtos/update-booking.dto';
import { bookings as Booking } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class BookingService {
    constructor(private bookingRepo: IBookingRepository) { }

    async create(dto: CreateBookingDto): Promise<Booking> {
        if (DEBUG_MODE) console.log("data: ", dto)
        // end_date > start_date
        if (new Date(dto.end_date) <= new Date(dto.start_date)) {
            throw new Error('end_date must be after start_date');
        }

        if (!dto.email && !dto.phone) {
            throw new Error('Either email or phone is required');
        }

        if (dto.campsite_id && !(await this.bookingRepo.campsiteExists(dto.campsite_id))) {
            throw new Error('Campsite not found');
        }
        if (!dto.booking_number) {
            throw new Error('Booking number is required');
        }
        if (dto.booking_number.length > 10 || dto.booking_number.length < 1) {
            throw new Error('Booking number must be between 1 and 10 characters long');
        }
        if (await this.bookingRepo.bookingNumberExists(dto.booking_number)) {
            throw new Error('Booking number already exists');
        }

        if (dto.campsite_id) {
            const overlaps = await this.bookingRepo.findOverlapping(
                dto.campsite_id,
                new Date(dto.start_date),
                new Date(dto.end_date),
            );
            if (overlaps.length) {
                throw new Error('Booking overlaps an existing booking for this campsite');
            }
        }
        return this.bookingRepo.create(dto);
    }

    async findAll() {
        const list = await this.bookingRepo.findAll();
        return list.map(b => {
          const { campsite, ...plain } = b as BookingWithCampsite & { campsite?: any };
          return { ...plain, campsite_name: campsite?.name ?? null };
        });
    }

    async findById(id: string) {
        const b = await this.bookingRepo.findById(id);
        if (!b) return null;

        const { campsite, ...plain } = b as BookingWithCampsite & { campsite?: any };
        return { ...plain, campsite_name: campsite?.name ?? null };
    }

    update(dto: UpdateBookingDto) {
        if (DEBUG_MODE) console.log("data: ", dto)
        if (dto.start_date && dto.end_date &&
            new Date(dto.end_date) <= new Date(dto.start_date)) {
            throw new Error('end_date must be after start_date');
        }
        return this.bookingRepo.update(dto);
    }

    /** Soft-delete */
    delete(id: string) {
        return this.bookingRepo.update({
            booking_id: id,
            delete_date: new Date().toISOString(),
        });
    }
}