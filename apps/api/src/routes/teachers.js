import express from 'express';
import {
  getTeacherAnalytics,
  getTeacherStudents,
} from '../controllers/teachersController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All teacher routes require teacher role
router.get('/analytics', authenticate, requireRole('teacher'), getTeacherAnalytics);
router.get('/students', authenticate, requireRole('teacher'), getTeacherStudents);

export default router;
