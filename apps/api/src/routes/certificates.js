import express from 'express';
import {
  getMyCertificates,
  generateCertificate,
  verifyCertificate,
} from '../controllers/certificatesController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/verify/:certificateId', verifyCertificate);

// Student routes
router.get('/mine', authenticate, requireRole('student'), getMyCertificates);
router.post('/generate/:courseId', authenticate, requireRole('student'), generateCertificate);

export default router;
