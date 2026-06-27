import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createCampaignSchema,
  fundCampaignSchema,
  idParamSchema,
} from '../validators/campaign.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCampaignSchema), asyncHandler(campaignController.create));
router.get('/', asyncHandler(campaignController.list));
router.post(
  '/:id/fund',
  validate(idParamSchema, 'params'),
  validate(fundCampaignSchema),
  asyncHandler(campaignController.fund)
);

export default router;
