import Stripe from 'stripe';
import env from '../config/env.js';

const stripe = new Stripe(env.stripe.secretKey);

export const stripeService = {
  // Create checkout session
  async createCheckoutSession({ courseId, courseTitle, price, studentEmail, studentId }) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'egp',
            product_data: {
              name: courseTitle,
              description: `دورة ${courseTitle} على منصة ليرنيفا`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.frontendUrl}/courses/${courseId}`,
      customer_email: studentEmail,
      metadata: {
        courseId,
        studentId,
      },
    });

    return session;
  },

  // Verify webhook signature
  verifyWebhook(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        env.stripe.webhookSecret
      );
    } catch (err) {
      console.error('Stripe webhook verification failed:', err.message);
      return null;
    }
  },

  // Create refund
  async createRefund(paymentIntentId, amount) {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return refund;
  },

  // Get payment details
  async getPaymentIntent(paymentIntentId) {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  },

  // Get checkout session details
  async getCheckoutSession(sessionId) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  },
};
