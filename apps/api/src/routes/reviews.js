import express from 'express';
import {
  getCourseReviews,
  submitReview,
  deleteReview,
} from '../controllers/reviewsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/course/:courseId', getCourseReviews);

// Student routes
router.post('/', authenticate, requireRole('student'), submitReview);
router.delete('/:courseId', authenticate, requireRole('student'), deleteReview);

export default router;
