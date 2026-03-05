import express from 'express';
import {
  getMyEnrollments,
  enrollInCourse,
  checkEnrollment,
} from '../controllers/enrollmentsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.get('/mine', authenticate, requireRole('student'), getMyEnrollments);
router.post('/', authenticate, requireRole('student'), enrollInCourse);
router.get('/:courseId/check', authenticate, checkEnrollment);

export default router;
