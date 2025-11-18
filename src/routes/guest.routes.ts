import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { guestLogin } from '../controllers/guest.controller';
import { authenticateGuestJWT } from '../middlewares/authenticateGuestJWT';
import { enforceSelfBooking } from '../middlewares/enforceSelfBooking';
import { getBookingById } from '../controllers/booking.controller';
import { createInventory, getInventoryById } from '../controllers/inventory.controller';
import { createOrder, getAllOrdersByBookingId } from '../controllers/order.controller';
import { getAllProducts } from '../controllers/product.controller';

const router = Router();

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,  // 5 minutes
  max: 10,                  // 10 tentatives par IP
  standardHeaders: true,
  legacyHeaders: false,
});

/* Login */
router.post('/login', limiter, guestLogin);

/* Bookings */
router.get('/bookings/:booking_id', authenticateGuestJWT, enforceSelfBooking, getBookingById);

/* Inventories */
router.post('/bookings/:booking_id/inventories/', authenticateGuestJWT, enforceSelfBooking, createInventory);
router.get('/bookings/:booking_id/inventories/:inventory_id', authenticateGuestJWT, enforceSelfBooking, getInventoryById);

/* Orders */
router.get('/bookings/:booking_id/orders' , authenticateGuestJWT, enforceSelfBooking, getAllOrdersByBookingId);
router.post('/bookings/:booking_id/orders', authenticateGuestJWT, enforceSelfBooking, createOrder);

/* Products */
router.get('/products', authenticateGuestJWT, getAllProducts);

export default router;