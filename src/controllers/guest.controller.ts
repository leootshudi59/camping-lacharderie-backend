import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { PrismaBookingRepository } from '../repositories/prisma/PrismaBookingRepository';
import { GuestAuthService } from '../services/guest-auth.service';
import { LoginGuestSchema } from '../dtos/login-guest.dto';

const repo = new PrismaBookingRepository();
const guestAuth = new GuestAuthService(repo);
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

export const guestLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    if (DEBUG_MODE) {
      console.log("\n=====  loginGuest  =====");
      console.log("received body: " + req.body);
    }
    const dto = LoginGuestSchema.parse(req.body);
    const booking = await guestAuth.authenticate(dto.res_name, dto.booking_number);

    // Réponse générique pour limiter l’énumération
    if (!booking) return res.status(401).json({ error: 'Invalid credentials' });

    // ---- JWT here
    const secret: Secret = process.env.JWT_GUEST_SECRET!;
    DEBUG_MODE && console.log("JWT secret: ", secret);

    const token = jwt.sign(
          { booking_id: booking.booking_id, campsite_id: booking.campsite_id ?? null, scope: 'guest' },            // payload
          secret,
          { expiresIn:'12h', subject: booking.booking_id } as SignOptions
        );

    return res.status(200).json({
      token,
      booking: {
        booking_id: booking.booking_id,
        campsite_id: booking.campsite_id,
        email: booking.email,
        phone: booking.phone,
        booking_number: booking.booking_number,
        res_name: booking.res_name,
        inventory_id: booking.inventory_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        campsite_name: (booking as any)?.campsite?.name ?? null,
      },
    });
  } catch (err: any) {
    DEBUG_MODE && console.error(err);
    return res.status(400).json({ error: 'Invalid request' });
  }
};