import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255),
  requiredCredits: z.coerce.number().int().positive('requiredCredits must be a positive integer'),
});

export const fundCampaignSchema = z.object({
  currencyCode: z.string().min(1, 'currencyCode is required'),
  credits: z.coerce.number().int().positive('credits must be a positive integer'),
});

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type FundCampaignInput = z.infer<typeof fundCampaignSchema>;
