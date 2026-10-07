import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticateToken, requireAdmin, optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/', optionalAuthenticate, orderController.createOrder);

// User routes
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/', authenticateToken, orderController.getAllOrders);

// Public route
router.get('/:id', optionalAuthenticate, orderController.getOrderById);

// Admin-only routes
router.patch('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.patch('/:id/payment', authenticateToken, requireAdmin, orderController.updateOrderPayment);

export default router;
