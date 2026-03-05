import express from 'express';
import {
  saveProgress,
  getCourseProgress,
} from '../controllers/progressController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Student routes
router.post('/', authenticate, requireRole('student'), saveProgress);
router.get('/course/:courseId', authenticate, requireRole('student'), getCourseProgress);

export default router;
