import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Get all products in wishlist
router.get('/', authenticateToken, wishlistController.getWishlist);

// Add one product to wishlist
router.post('/:productId', authenticateToken, wishlistController.addToWishlist);

// Remove all products in wishlist
router.delete('/', authenticateToken, wishlistController.clearWishlist);

// Remove one product from wishlist
router.delete('/:productId', authenticateToken, wishlistController.removeFromWishlist);

export default router;
