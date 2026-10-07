import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
} from '../middleware/validate.middleware.js';

const router = Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// user feedback route
router.post('/:id/feedback', authenticateToken, productController.addFeedback);

// Admin-only routes
router.post('/', authenticateToken, requireAdmin, validateCreateProduct, productController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateUpdateProduct, productController.updateProductById);
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProductById);

export default router;