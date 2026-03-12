import express from 'express';
import {
  listCourses,
  listCategories,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  getTeacherCourses,
  getCourseStats,
} from '../controllers/coursesController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', listCourses);
router.get('/categories', listCategories);

// Teacher routes (specific routes before dynamic :id routes)
router.get('/teacher/mine', authenticate, requireRole('teacher'), getTeacherCourses);
router.post('/', authenticate, requireRole('teacher'), createCourse);
router.put('/:id', authenticate, requireRole('teacher'), updateCourse);
router.delete('/:id', authenticate, requireRole('teacher'), deleteCourse);
router.patch('/:id/publish', authenticate, requireRole('teacher'), togglePublish);
router.get('/:id/stats', authenticate, requireRole('teacher'), getCourseStats);

// Public route (must be after specific routes)
router.get('/:id', getCourse);

export default router;
