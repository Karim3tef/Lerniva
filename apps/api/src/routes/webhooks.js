import express from 'express';
import {
  handleStripeWebhook,
  handleBunnyWebhook,
} from '../controllers/webhooksController.js';

const router = express.Router();

// Webhook routes - NO authentication middleware (verified via signature)
// Note: Stripe webhook requires raw body, configured in main index.js
router.post('/stripe', handleStripeWebhook);
router.post('/bunny', handleBunnyWebhook);

export default router;
