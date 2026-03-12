import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter, authActionLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes (with rate limiting)
router.post('/register', authActionLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authActionLimiter, authController.forgotPassword);
router.post('/reset-password', authActionLimiter, authController.resetPassword);
router.get('/verify-email', authActionLimiter, authController.verifyEmail);
router.post('/verify-email/request', authActionLimiter, authController.resendVerificationEmail);

// Refresh token (no auth middleware, uses cookie)
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);

export default router;
