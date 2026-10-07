import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { optionalAuthenticate } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Generate PayHere payload & security hash
router.post('/payhere/initiate', optionalAuthenticate, paymentController.initiatePayHerePayment);

// 2. PayHere IPN notification callback webhook
router.post('/payhere/notify', paymentController.handlePayHereNotify);

// 3. Confirm payment after client-side completion
router.post('/payhere/confirm', optionalAuthenticate, paymentController.confirmPayHerePayment);

export default router;
