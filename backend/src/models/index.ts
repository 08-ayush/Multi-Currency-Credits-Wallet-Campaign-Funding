import { sequelize } from '../config/sequelize';
import { User } from './User';
import { Currency } from './Currency';
import { CurrencyPlan } from './CurrencyPlan';
import { Wallet } from './Wallet';
import { WalletBalance } from './WalletBalance';
import { WalletLedger } from './WalletLedger';
import { StripePayment } from './StripePayment';
import { ProcessedWebhook } from './ProcessedWebhook';
import { Campaign } from './Campaign';
import { CampaignFunding } from './CampaignFunding';

// ---- Associations ----
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Currency.hasMany(CurrencyPlan, { foreignKey: 'currency_id', as: 'plans' });
CurrencyPlan.belongsTo(Currency, { foreignKey: 'currency_id', as: 'currency' });

Wallet.hasMany(WalletBalance, { foreignKey: 'wallet_id', as: 'balances' });
WalletBalance.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
WalletBalance.belongsTo(Currency, { foreignKey: 'currency_id', as: 'currency' });

Wallet.hasMany(WalletLedger, { foreignKey: 'wallet_id', as: 'ledgerEntries' });
WalletLedger.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
WalletLedger.belongsTo(Currency, { foreignKey: 'currency_id', as: 'currency' });

User.hasMany(StripePayment, { foreignKey: 'user_id', as: 'payments' });
StripePayment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
StripePayment.belongsTo(Currency, { foreignKey: 'currency_id', as: 'currency' });

User.hasMany(Campaign, { foreignKey: 'user_id', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Campaign.hasOne(CampaignFunding, { foreignKey: 'campaign_id', as: 'funding' });
CampaignFunding.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });
CampaignFunding.belongsTo(WalletLedger, { foreignKey: 'ledger_entry_id', as: 'ledgerEntry' });

export {
  sequelize,
  User,
  Currency,
  CurrencyPlan,
  Wallet,
  WalletBalance,
  WalletLedger,
  StripePayment,
  ProcessedWebhook,
  Campaign,
  CampaignFunding,
};

export const db = {
  sequelize,
  User,
  Currency,
  CurrencyPlan,
  Wallet,
  WalletBalance,
  WalletLedger,
  StripePayment,
  ProcessedWebhook,
  Campaign,
  CampaignFunding,
};
