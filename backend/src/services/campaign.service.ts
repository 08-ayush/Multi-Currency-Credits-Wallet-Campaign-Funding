import { sequelize, CampaignFunding } from '../models';
import { campaignRepository } from '../repositories/campaign.repository';
import { currencyRepository } from '../repositories/currency.repository';
import { walletRepository } from '../repositories/wallet.repository';
import { AppError } from '../utils/AppError';

// The module that is allowed to fund campaigns. This is matched against the
// currency's DB-configured module_name, so the currency<->module binding is
// data-driven, not hardcoded per currency code.
const CAMPAIGN_MODULE = 'CAMPAIGN';

export const campaignService = {
  async createCampaign(userId: number, name: string, requiredCredits: number) {
    const campaign = await campaignRepository.create(userId, name, requiredCredits);
    return serializeCampaign(campaign, null);
  },

  async listCampaigns(userId: number) {
    const campaigns = await campaignRepository.findByUserId(userId);
    return campaigns.map((c) => {
      const funding = (c as unknown as { funding?: CampaignFunding }).funding ?? null;
      return serializeCampaign(c, funding);
    });
  },

  /**
   * Funds a campaign.
   *
   * Concurrency & integrity guarantees:
   *  - The campaign row is locked FOR UPDATE (serializes double-funding).
   *  - The wallet balance row is locked FOR UPDATE (serializes overspend).
   *  - balance >= credits is checked while holding the lock.
   *  - campaign_fundings.campaign_id UNIQUE is the final DB-level backstop.
   * All within a single transaction; any failure rolls everything back.
   */
  async fundCampaign(userId: number, campaignId: number, currencyCode: string, credits: number) {
    // Resolve currency and enforce the module binding BEFORE opening the txn.
    const currency = await currencyRepository.findByCode(currencyCode);
    if (!currency) {
      throw AppError.badRequest('Unknown currency code');
    }
    if (currency.module_name !== CAMPAIGN_MODULE) {
      // Report/Discovery credits cannot fund campaigns.
      throw AppError.badRequest(
        `Currency ${currency.code} (module ${currency.module_name}) cannot fund campaigns`
      );
    }

    return sequelize.transaction(async (tx) => {
      // 1) Lock the campaign row.
      const campaign = await campaignRepository.findByIdForUpdate(campaignId, tx);
      if (!campaign) {
        throw AppError.notFound('Campaign not found');
      }
      if (campaign.user_id !== userId) {
        throw AppError.forbidden('You do not own this campaign');
      }

      // 2) Already funded? (status + funding row both checked)
      if (campaign.status === 'FUNDED') {
        throw AppError.conflict('Campaign is already funded');
      }
      const existingFunding = await campaignRepository.findFundingByCampaignId(campaignId, tx);
      if (existingFunding) {
        throw AppError.conflict('Campaign is already funded');
      }

      // 3) Validate the funding amount matches what the campaign requires.
      if (credits !== campaign.required_credits) {
        throw AppError.badRequest(
          `Campaign requires exactly ${campaign.required_credits} credits`
        );
      }

      // 4) Lock the wallet balance row and verify sufficient funds.
      const wallet = await walletRepository.findOrCreateByUserId(userId, tx);
      await walletRepository.ensureBalanceRow(wallet.id, currency.id, tx);
      const balance = await walletRepository.findBalanceForUpdate(wallet.id, currency.id, tx);
      if (!balance) {
        throw new AppError(500, 'Wallet balance row missing after ensure');
      }
      if (balance.balance_credits < credits) {
        throw AppError.badRequest('Insufficient credits');
      }

      // 5) Deduct (balance can never go negative due to the check above).
      balance.balance_credits = balance.balance_credits - credits;
      await balance.save({ transaction: tx });

      // 6) Ledger SPEND entry (negative delta).
      const ledgerEntry = await walletRepository.createLedgerEntry(
        {
          walletId: wallet.id,
          currencyId: currency.id,
          entryType: 'SPEND',
          creditsDelta: -credits,
          referenceType: 'CAMPAIGN',
          referenceId: campaign.id,
        },
        tx
      );

      // 7) Funding record (UNIQUE campaign_id is the last line of defense).
      const funding = await campaignRepository.createFunding(campaign.id, ledgerEntry.id, tx);

      // 8) Flip campaign status.
      const fundedAt = new Date();
      await campaignRepository.markFunded(campaign.id, fundedAt, tx);
      campaign.status = 'FUNDED';
      campaign.funded_at = fundedAt;

      return serializeCampaign(campaign, funding);
    });
  },
};

function serializeCampaign(
  campaign: {
    id: number;
    user_id: number;
    name: string;
    status: string;
    required_credits: number;
    funded_at: Date | null;
    created_at?: Date;
  },
  funding: { id: number; ledger_entry_id: number; created_at?: Date } | null
) {
  return {
    id: campaign.id,
    userId: campaign.user_id,
    name: campaign.name,
    status: campaign.status,
    requiredCredits: campaign.required_credits,
    fundedAt: campaign.funded_at,
    createdAt: campaign.created_at,
    funding: funding
      ? { id: funding.id, ledgerEntryId: funding.ledger_entry_id, createdAt: funding.created_at }
      : null,
  };
}
