import { IBookingRepository } from '../repositories/interfaces/IBookingRepository';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { UpdateBookingDto } from '../dtos/update-booking.dto';
import { bookings as Booking } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export class BookingService {
    constructor(private bookingRepo: IBookingRepository) { }

    async create(dto: CreateBookingDto): Promise<Booking> {
        if (DEBUG_MODE) console.log("Creating: ", dto);

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

    findAll() {
        return this.bookingRepo.findAll();
    }

    findById(id: string) {
        return this.bookingRepo.findById(id);
    }

    update(dto: UpdateBookingDto) {
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