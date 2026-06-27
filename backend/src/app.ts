import express from 'express';
import cors from 'cors';
import { env } from './config/env';

// Ensure models + associations are registered before routes use them.
import './models';

import authRoutes from './routes/auth.routes';
import walletRoutes from './routes/wallet.routes';
import paymentRoutes from './routes/payment.routes';
import webhookRoutes from './routes/webhook.routes';
import campaignRoutes from './routes/campaign.routes';
import currencyRoutes from './routes/currency.routes';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.clientUrl, credentials: true }));

  // IMPORTANT: webhook routes are mounted BEFORE express.json() because Stripe
  // signature verification needs the raw request body. The webhook router
  // applies its own express.raw() parser.
  app.use('/api/webhooks', webhookRoutes);

  // JSON parser for every other route.
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/wallet', walletRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/campaigns', campaignRoutes);
  app.use('/api/currencies', currencyRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
