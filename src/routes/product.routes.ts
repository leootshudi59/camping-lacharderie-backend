import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';

import { authenticateJWT } from '../middlewares/authenticateJWT';
import { requireAdmin } from '../middlewares/requireAdmin';

const router = Router();

/* Public (ou visibles par tous les users) */
router.get('/',              getAllProducts);
router.get('/:product_id',   getProductById);

/* Admin-only */
router.use(authenticateJWT);
router.use(requireAdmin);

router.post('/',             createProduct);
router.put('/:product_id',   updateProduct);
router.delete('/:product_id', deleteProduct);

export default router;