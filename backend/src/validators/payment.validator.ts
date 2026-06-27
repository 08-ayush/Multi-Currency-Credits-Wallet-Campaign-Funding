import { z } from 'zod';

// Either { currencyId, planId } OR { currencyId, quantity } is accepted.
export const createCheckoutSchema = z
  .object({
    currencyId: z.coerce.number().int().positive('currencyId is required'),
    planId: z.coerce.number().int().positive().optional(),
    quantity: z.coerce.number().int().positive().optional(),
  })
  .refine((data) => data.planId !== undefined || data.quantity !== undefined, {
    message: 'Either planId or quantity must be provided',
    path: ['planId'],
  })
  .refine((data) => !(data.planId !== undefined && data.quantity !== undefined), {
    message: 'Provide either planId or quantity, not both',
    path: ['quantity'],
  });

export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
