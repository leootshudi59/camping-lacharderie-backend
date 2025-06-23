import { Router } from 'express';
import { getAllUsers, getUserById, getUserByEmail, getUserByPhone, createUser, updateUser, deleteUser, loginUser } from '../controllers/user.controller';

const router = Router();

router.post('/login', loginUser);
router.get('/email/:email', getUserByEmail);
router.get('/phone/:phone', getUserByPhone);

// Core routes
router.get('/', getAllUsers);
router.post('/', createUser);

// Dynamic user routes
router.get('/:user_id', getUserById);
router.put('/:user_id', updateUser);
router.delete('/:user_id', deleteUser);

export default router;