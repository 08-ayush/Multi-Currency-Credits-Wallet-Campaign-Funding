// Runs BEFORE any application module is imported (jest `setupFiles`).
// We pin deterministic test secrets here. dotenv (called later in env.ts)
// does not override already-set process.env values, so these win.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
process.env.STRIPE_CURRENCY = process.env.STRIPE_CURRENCY || 'inr';
