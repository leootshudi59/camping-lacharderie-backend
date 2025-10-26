import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


/**
 * authenticateGuestJWT
 * --------------------
 * Purpose:
 *   Verifies a "guest" JWT on incoming requests and attaches a minimal guest context
 *   to `req.guest`. This is used for camper (non-admin) access to their own booking.
 *
 * How it works:
 *   - Expects an Authorization header with the "Bearer <token>" scheme.
 *   - Verifies the token using the guest secret (process.env.JWT_GUEST_SECRET).
 *   - Ensures the `scope` claim is exactly "guest".
 *   - On success, sets `req.guest = { booking_id, campsite_id? }` and calls `next()`.
 *
 * Why:
 *   Separates guest tokens from admin/user tokens with a distinct secret and scope,
 *   reducing privilege escalation risks and making route policies explicit.
 *
 * Responses:
 *   - 401 Unauthorized: missing/invalid/expired token.
 *   - 403 Forbidden: token is valid but not a "guest" scoped token.
 *   - next(): guest context is attached; downstream handlers/middlewares can trust `req.guest`.
 *
 * Usage:
 *   router.get(
 *     '/api/guest/bookings/me',
 *     authenticateGuestJWT,     // attaches req.guest
 *     handler                   // can use req.guest.booking_id
 *   );
 *
 * Notes:
 *   - Make sure JWT_GUEST_SECRET is set and different from the admin/user JWT secret.
 *   - Consider short TTLs for guest tokens (e.g., 6–12h).
 *   - Combine with route-level checks (e.g., `enforceSelfBooking`) if using `:booking_id` params.
 */
export function authenticateGuestJWT(req: Request, res: Response, next: NextFunction): any {
    const header = req.headers.authorization; // "Bearer <token>"
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing token' });
    }
    const token = header.slice(7);

    try {
        const claims = jwt.verify(token, process.env.JWT_GUEST_SECRET as string) as {
            scope: 'guest';
            booking_id: string;
            campsite_id?: string | null;
            iat: number;
            exp: number;
        };
        if (claims.scope !== 'guest') return res.status(403).json({ error: 'Forbidden' });
        (req as any).guest = { booking_id: claims.booking_id, campsite_id: claims.campsite_id ?? null };
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}