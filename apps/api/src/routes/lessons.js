import express from 'express';
import {
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  watchLesson,
} from '../controllers/lessonsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Authenticated routes
router.get('/course/:courseId', authenticate, getCourseLessons);
router.get('/:id/watch', authenticate, watchLesson);

// Teacher routes
router.post('/course/:courseId', authenticate, requireRole('teacher'), createLesson);
router.put('/:id', authenticate, requireRole('teacher'), updateLesson);
router.delete('/:id', authenticate, requireRole('teacher'), deleteLesson);
router.patch('/reorder', authenticate, requireRole('teacher'), reorderLessons);

export default router;
