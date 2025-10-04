import { Router } from 'express';
import { getAllUsers, getUserById, getUserByEmail, getUserByPhone, createUser, updateUser, deleteUser, loginUser, changeUserRole } from '../controllers/user.controller';
import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireAdmin }   from '../middlewares/requireAdmin';
import { requireSelfOrAdmin } from '../middlewares/requireSelfOrAdmin';

const router = Router();

// Public routes (no JWT)
router.post('/login', loginUser);
router.post('/',      createUser);  // POST /api/users          (inscription)

/* ---------- JWT obligatoire à partir d’ici ---------- */
router.use(authenticateJWT);

// admin
router.get('/',              requireAdmin, getAllUsers);
router.get('/email/:email',  requireAdmin, getUserByEmail);
router.get('/phone/:phone',  requireAdmin, getUserByPhone);
router.patch('/:user_id/role', requireAdmin, changeUserRole);

// self or admin
router.get('/:user_id', requireSelfOrAdmin, getUserById);
router.put('/:user_id', requireSelfOrAdmin, updateUser);
router.delete('/:user_id', requireSelfOrAdmin, deleteUser);

export default router;