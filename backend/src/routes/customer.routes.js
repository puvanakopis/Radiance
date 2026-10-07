import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Admin-only customer management routes
router.get('/', authenticateToken, requireAdmin, customerController.getAllCustomers);
router.get('/:id', authenticateToken, requireAdmin, customerController.getCustomerById);
router.put('/:id', authenticateToken, requireAdmin, customerController.updateCustomerById);
router.patch('/:id', authenticateToken, requireAdmin, customerController.updateCustomerById);
router.patch('/:id/block', authenticateToken, requireAdmin, customerController.toggleBlockCustomer);
router.patch('/:id/status', authenticateToken, requireAdmin, customerController.toggleBlockCustomer);
router.delete('/:id', authenticateToken, requireAdmin, customerController.deleteCustomerById);

export default router;
