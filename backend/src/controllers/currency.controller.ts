import { Request, Response } from 'express';
import { currencyRepository } from '../repositories/currency.repository';

export const currencyController = {
  async list(_req: Request, res: Response) {
    const [currencies, plans] = await Promise.all([
      currencyRepository.findAll(),
      currencyRepository.findAllPlans(),
    ]);

    res.json({
      currencies: currencies.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        moduleName: c.module_name,
        pricePerCreditPaise: c.price_per_credit_paise,
        canFundCampaigns: c.module_name === 'CAMPAIGN',
        plans: plans
          .filter((p) => p.currency_id === c.id)
          .map((p) => ({ id: p.id, credits: p.credits, pricePaise: p.price_paise })),
      })),
    });
  },
};
