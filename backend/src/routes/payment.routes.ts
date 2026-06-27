import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { createCheckoutSchema } from '../validators/payment.validator';

const router = Router();

router.post(
  '/create-checkout-session',
  authenticate,
  validate(createCheckoutSchema),
  asyncHandler(paymentController.createCheckoutSession)
);

export default router;
