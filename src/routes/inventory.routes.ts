import { Router } from 'express';
import {
  getAllInventories,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getAllInventoriesByBookingId,
} from '../controllers/inventory.controller';

import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

router.use(authenticateJWT);   // JWT compulsory everywhere
router.use(requireAdmin);      // Only admin

router.get('/',                   getAllInventories);
router.get('/:inventory_id',      getInventoryById);
router.get('/booking/:booking_id', getAllInventoriesByBookingId);
router.post('/',                  createInventory);
router.put('/:inventory_id',      updateInventory);
router.delete('/:inventory_id',   deleteInventory);

export default router;