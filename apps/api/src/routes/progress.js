import express from 'express';
import {
  saveProgress,
  getCourseProgress,
  getLastLesson,
  getProgressStats,
} from '../controllers/progressController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/', authenticate, requireRole('student'), saveProgress);
router.get('/stats', authenticate, requireRole('student'), getProgressStats);
router.get('/course/:courseId', authenticate, requireRole('student'), getCourseProgress);
router.get('/last-lesson/:courseId', authenticate, requireRole('student'), getLastLesson);

export default router;
