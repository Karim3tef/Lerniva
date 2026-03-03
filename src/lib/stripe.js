import Stripe from 'stripe';

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'placeholder', {
    apiVersion: '2024-06-20',
  });
}

export const stripe = getStripe();
