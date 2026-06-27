import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { CreateCheckoutInput } from '../validators/payment.validator';

export const paymentController = {
  async createCheckoutSession(req: Request, res: Response) {
    const { currencyId, planId, quantity } = req.body as CreateCheckoutInput;
    const result = await paymentService.createCheckoutSession({
      userId: req.user!.userId,
      currencyId,
      planId,
      quantity,
    });
    res.status(201).json(result);
  },

  // Raw body is required for Stripe signature verification — see route wiring.
  async handleWebhook(req: Request, res: Response) {
    const signature = req.headers['stripe-signature'] as string | undefined;
    const event = paymentService.constructEvent(req.body as Buffer, signature);
    const result = await paymentService.handleStripeEvent(event);
    res.status(200).json({ received: true, ...result });
  },
};
