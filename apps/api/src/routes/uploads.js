import express from 'express';
import {
  uploadVideo,
  uploadThumbnail,
  deleteVideo,
} from '../controllers/uploadsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All upload routes require teacher authentication
router.post('/video', authenticate, requireRole('teacher'), uploadVideo);
router.post('/thumbnail', authenticate, requireRole('teacher'), uploadThumbnail);
router.delete('/video/:bunnyVideoId', authenticate, requireRole('teacher'), deleteVideo);

export default router;
