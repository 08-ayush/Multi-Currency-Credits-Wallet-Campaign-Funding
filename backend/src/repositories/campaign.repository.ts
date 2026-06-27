import { Transaction } from 'sequelize';
import { Campaign, CampaignFunding } from '../models';

export const campaignRepository = {
  create(userId: number, name: string, requiredCredits: number, tx?: Transaction) {
    return Campaign.create(
      { user_id: userId, name, required_credits: requiredCredits, status: 'DRAFT', funded_at: null },
      { transaction: tx }
    );
  },

  findById(id: number, tx?: Transaction) {
    return Campaign.findByPk(id, { transaction: tx });
  },

  // Locks the campaign row FOR UPDATE to serialize concurrent funding attempts.
  findByIdForUpdate(id: number, tx: Transaction) {
    return Campaign.findByPk(id, { transaction: tx, lock: Transaction.LOCK.UPDATE });
  },

  findByUserId(userId: number, tx?: Transaction) {
    return Campaign.findAll({
      where: { user_id: userId },
      include: [{ model: CampaignFunding, as: 'funding' }],
      order: [['id', 'DESC']],
      transaction: tx,
    });
  },

  findFundingByCampaignId(campaignId: number, tx?: Transaction) {
    return CampaignFunding.findOne({ where: { campaign_id: campaignId }, transaction: tx });
  },

  createFunding(campaignId: number, ledgerEntryId: number, tx: Transaction) {
    return CampaignFunding.create(
      { campaign_id: campaignId, ledger_entry_id: ledgerEntryId },
      { transaction: tx }
    );
  },

  async markFunded(id: number, fundedAt: Date, tx: Transaction) {
    await Campaign.update(
      { status: 'FUNDED', funded_at: fundedAt },
      { where: { id }, transaction: tx }
    );
  },
};
