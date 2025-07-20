import { Router } from 'express';
import {
  getAllCampsites,
  getCampsiteById,
  createCampsite,
  updateCampsite,
  deleteCampsite,
} from '../controllers/campsite.controller';

import { requireAdmin } from '../middlewares/requireAdmin';
import { authenticateJWT } from '../middlewares/authenticateJWT';

const router = Router();

router.use(authenticateJWT);   // JWT obligatoire partout
router.use(requireAdmin);      // Uniquement admin

router.get('/',        getAllCampsites);
router.get('/:campsite_id', getCampsiteById);
router.post('/',       createCampsite);
router.put('/:campsite_id', updateCampsite);
router.delete('/:campsite_id', deleteCampsite);

export default router;