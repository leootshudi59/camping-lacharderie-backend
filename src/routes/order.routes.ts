// src/routes/order.routes.ts
import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller';

import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireAdmin } from '../middlewares/requireAdmin';
// import { requireBookingOwnerOrAdmin } from '../middlewares/requireBookingOwnerOrAdmin';

const router = Router();

router.use(authenticateJWT);

// Admin: liste + delete
router.get('/', requireAdmin, getAllOrders);
router.delete('/:order_id', requireAdmin, deleteOrder);

// Owner du booking lié OU admin : lecture d’une commande précise, création, update
// router.get('/:order_id', requireBookingOwnerOrAdmin, getOrderById);
// router.post('/', requireBookingOwnerOrAdmin, createOrder);
// router.put('/:order_id', requireBookingOwnerOrAdmin, updateOrder);
router.get('/:order_id', getOrderById);
router.post('/', createOrder);
router.put('/:order_id', updateOrder);
export default router;