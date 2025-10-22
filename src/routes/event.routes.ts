import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller';

import { requireAdmin } from '../middlewares/requireAdmin';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = Router();

router.use(authenticateJWT);  // partout JWT
router.use(requireAdmin);     // admin only (comme campsites)

router.get('/',             getAllEvents);
router.get('/:event_id',    getEventById);
router.post('/',            createEvent);
router.put('/:event_id',    updateEvent);
router.delete('/:event_id', deleteEvent);

export default router;