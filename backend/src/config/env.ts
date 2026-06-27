import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isTest = nodeEnv === 'test';

export const env = {
  nodeEnv,
  isTest,
  isProd: nodeEnv === 'production',
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: isTest
      ? process.env.DB_NAME_TEST || 'credits_wallet_test'
      : process.env.DB_NAME || 'credits_wallet',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  stripe: {
    // Allow empty in test so the suite can run without real Stripe keys.
    secretKey: isTest ? process.env.STRIPE_SECRET_KEY || 'sk_test_dummy' : required('STRIPE_SECRET_KEY', 'sk_test_dummy'),
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy',
    currency: process.env.STRIPE_CURRENCY || 'inr',
    successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/wallet?payment=success',
    cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/wallet?payment=cancel',
  },
};
