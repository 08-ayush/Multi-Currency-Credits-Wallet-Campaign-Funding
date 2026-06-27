import { Request, Response } from 'express';
import { campaignService } from '../services/campaign.service';
import { CreateCampaignInput, FundCampaignInput } from '../validators/campaign.validator';

export const campaignController = {
  async create(req: Request, res: Response) {
    const { name, requiredCredits } = req.body as CreateCampaignInput;
    const campaign = await campaignService.createCampaign(req.user!.userId, name, requiredCredits);
    res.status(201).json(campaign);
  },

  async list(req: Request, res: Response) {
    const campaigns = await campaignService.listCampaigns(req.user!.userId);
    res.json({ campaigns });
  },

  async fund(req: Request, res: Response) {
    const campaignId = Number(req.params.id);
    const { currencyCode, credits } = req.body as FundCampaignInput;
    const campaign = await campaignService.fundCampaign(
      req.user!.userId,
      campaignId,
      currencyCode,
      credits
    );
    res.json(campaign);
  },
};
