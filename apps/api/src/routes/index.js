import express from 'express';
import authRoutes from './auth.js';
// Import other routes as they are created
// import coursesRoutes from './courses.js';
// import lessonsRoutes from './lessons.js';
// import uploadsRoutes from './uploads.js';
// import enrollmentsRoutes from './enrollments.js';
// import progressRoutes from './progress.js';
// import paymentsRoutes from './payments.js';
// import webhooksRoutes from './webhooks.js';
// import reviewsRoutes from './reviews.js';
// import notificationsRoutes from './notifications.js';
// import certificatesRoutes from './certificates.js';
// import adminRoutes from './admin.js';
// import teachersRoutes from './teachers.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);

// TODO: Mount additional routes as they are implemented
// router.use('/courses', coursesRoutes);
// router.use('/lessons', lessonsRoutes);
// router.use('/upload', uploadsRoutes);
// router.use('/enrollments', enrollmentsRoutes);
// router.use('/progress', progressRoutes);
// router.use('/payments', paymentsRoutes);
// router.use('/webhooks', webhooksRoutes);
// router.use('/reviews', reviewsRoutes);
// router.use('/notifications', notificationsRoutes);
// router.use('/certificates', certificatesRoutes);
// router.use('/admin', adminRoutes);
// router.use('/teachers', teachersRoutes);

export default router;
