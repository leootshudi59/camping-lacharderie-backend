import { Router } from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/booking.controller';

import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireAdmin }   from '../middlewares/requireAdmin';

const router = Router();

router.use(authenticateJWT);
router.use(requireAdmin);          // ⇢ admin-only

router.get('/',              getAllBookings);
router.get('/:booking_id',   getBookingById);
router.post('/',             createBooking);
router.put('/:booking_id',   updateBooking);
router.delete('/:booking_id', deleteBooking);

export default router;