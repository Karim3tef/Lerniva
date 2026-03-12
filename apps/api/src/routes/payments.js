import express from 'express';
import {
  createCheckout,
  confirmCheckout,
  getMyPayments,
  getTeacherRevenue,
} from '../controllers/paymentsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/checkout', authenticate, requireRole('student'), createCheckout);
router.post('/confirm', authenticate, requireRole('student'), confirmCheckout);
router.get('/mine', authenticate, requireRole('student'), getMyPayments);

// Teacher routes
router.get('/teacher/revenue', authenticate, requireRole('teacher'), getTeacherRevenue);

export default router;
