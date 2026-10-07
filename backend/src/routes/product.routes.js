import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
} from '../middleware/validate.middleware.js';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post('/', validateCreateProduct, productController.createProduct);
router.put('/:id', validateUpdateProduct, productController.updateProductById);
router.delete('/:id', productController.deleteProductById);

export default router;