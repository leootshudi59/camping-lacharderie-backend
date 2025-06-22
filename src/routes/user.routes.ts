import { Router } from 'express';
import { getAllUsers, getUserById, getUserByEmail, getUserByPhone, createUser, updateUser, deleteUser } from '../controllers/user.controller';

const router = Router();

router.get('/', getAllUsers);
router.get('/:user_id', getUserById);
router.get('/email/:email', getUserByEmail);
router.get('/phone/:phone', getUserByPhone);
router.post('/', createUser);
router.put('/:user_id', updateUser);
router.delete('/:user_id', deleteUser);

export default router;