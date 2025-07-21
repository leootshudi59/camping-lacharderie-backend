import { Request, Response } from 'express';
import { PrismaBookingRepository } from '../repositories/prisma/PrismaBookingRepository';
import { BookingService } from '../services/booking.service';
import { CreateBookingSchema } from '../dtos/create-booking.dto';
import { UpdateBookingSchema } from '../dtos/update-booking.dto';

const repo = new PrismaBookingRepository();
const service = new BookingService(repo);
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export const getAllBookings = async (_: Request, res: Response) => {
  try {
    const bookings = await service.findAll();
    res.status(200).json(bookings);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const getBookingById = async (req: Request, res: Response): Promise<any> => {
  try {
    const booking = await service.findById(req.params.booking_id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const dto = CreateBookingSchema.parse(req.body);
    const booking = await service.create(dto);
    res.status(201).json(booking);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const dto = UpdateBookingSchema.parse({ ...req.body, booking_id: req.params.booking_id });
    const booking = await service.update(dto);
    res.status(200).json(booking);
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    await service.delete(req.params.booking_id);
    res.status(204).send();
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    res.status(400).json({ error: err.message });
  }
};