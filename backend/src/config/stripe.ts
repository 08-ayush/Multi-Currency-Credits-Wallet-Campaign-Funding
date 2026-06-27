import Stripe from 'stripe';
import { env } from './env';

// Single Stripe client. apiVersion pinned for deterministic behaviour.
export const stripe = new Stripe(env.stripe.secretKey, {
  apiVersion: '2024-06-20',
});
