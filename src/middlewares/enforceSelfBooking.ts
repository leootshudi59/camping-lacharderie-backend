// src/middlewares/enforceSelfBooking.ts
import { Request, Response, NextFunction } from 'express';

/**
 * enforceSelfBooking
 * ------------------
 * Purpose:
 *   Protects guest routes that include a `:booking_id` param by ensuring the
 *   authenticated guest (from the guest JWT) can only access *their own* booking.
 *
 * How it works:
 *   - `authenticateGuestJWT` must run before this middleware. It parses and verifies
 *     the guest token and attaches `req.guest = { booking_id, campsite_id? }`.
 *   - This middleware compares `req.guest.booking_id` with `req.params.booking_id`.
 *   - If they are different, the request is rejected with 403 Forbidden.
 *
 * Why:
 *   Prevents horizontal privilege escalation (a guest trying to access another
 *   guest's booking by guessing/changing the URL).
 *
 * Responses:
 *   - 401 Unauthorized: if the request has no guest context (likely missing middleware).
 *   - 400 Bad Request: if the route has no `:booking_id` param.
 *   - 403 Forbidden: if the `booking_id` in the URL is not the same as the one in the token.
 *   - next(): if all checks pass, control is passed to the next handler.
 *
 * Usage:
 *   router.get(
 *     '/bookings/:booking_id',
 *     authenticateGuestJWT,        // must come first
 *     enforceSelfBooking,          // then enforce ownership
 *     getBookingById               // handler can now assume the guest owns this resource
 *   );
 */
export function enforceSelfBooking(req: Request, res: Response, next: NextFunction): any {
    const guest = (req as any).guest as { booking_id: string };
    if (!guest || guest.booking_id !== req.params.booking_id) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
}