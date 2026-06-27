import { Router } from 'express';
import express from 'express';
import { paymentController } from '../controllers/payment.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Stripe signature verification requires the raw, unparsed request body.
// This route MUST NOT be preceded by a JSON body parser.
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(paymentController.handleWebhook)
);

export default router;
