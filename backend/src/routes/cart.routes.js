import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// User routes
router.get('/', authenticateToken, cartController.getCart);
router.post('/', authenticateToken, cartController.addItemToCart);
router.put('/item', authenticateToken, cartController.updateCartItemQuantity);
router.delete('/item', authenticateToken, cartController.removeCartItem);
router.delete('/', authenticateToken, cartController.clearCart);
router.post('/sync', authenticateToken, cartController.syncCart);

export default router;
