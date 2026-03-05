import Stripe from 'stripe';
import { requireEnv } from './env';

export function getStripe() {
  return new Stripe(requireEnv('STRIPE_SECRET_KEY') || 'placeholder', {
    apiVersion: '2024-06-20',
  });
}

export const stripe = getStripe();
