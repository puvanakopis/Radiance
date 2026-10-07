import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  validateLogin,
  validateSendOtp,
  validateResendOtp,
  validateVerifyOtp,
  validateForgotPasswordVerifyOtp,
  validateUpdateProfile,
  validateChangePassword,
} from '../middleware/validate.middleware.js';

const router = Router();

// Registration & OTP Flow
router.post('/register/send-otp', validateSendOtp, authController.sendRegistrationOtp);
router.post('/register/resend-otp', validateResendOtp, authController.resendRegistrationOtp);
router.post('/register/verify-otp', validateVerifyOtp, authController.verifyRegistrationOtp);

// Forgot Password & Reset Password OTP Flow
router.post('/forgot-password/send-otp', validateResendOtp, authController.sendForgotPasswordOtp);
router.post('/forgot-password/resend-otp', validateResendOtp, authController.resendForgotPasswordOtp);
router.post('/forgot-password/verify-otp', validateForgotPasswordVerifyOtp, authController.verifyForgotPasswordOtp);

// Sign In
router.post('/login', validateLogin, authController.login);

// Authenticated User Profile Routes
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, validateUpdateProfile, authController.updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);
router.delete('/account', authenticateToken, authController.deleteAccount);

export default router;