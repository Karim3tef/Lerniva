import express from 'express';
import {
  getUsers,
  updateUserStatus,
  getPendingCourses,
  approveCourse,
  rejectCourse,
  getAllPayments,
  processRefund,
  getPlatformStats,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require admin role
router.use(authenticate, requireRole('admin'));

// User management
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

// Course management
router.get('/courses/pending', getPendingCourses);
router.patch('/courses/:id/approve', approveCourse);
router.patch('/courses/:id/reject', rejectCourse);

// Payment management
router.get('/payments', getAllPayments);
router.post('/refund/:paymentId', processRefund);

// Statistics and logs
router.get('/stats', getPlatformStats);
router.get('/audit-logs', getAuditLogs);

export default router;
