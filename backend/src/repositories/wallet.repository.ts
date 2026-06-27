import { Transaction } from 'sequelize';
import { Wallet, WalletBalance, WalletLedger, Currency } from '../models';
import { LedgerEntryType, LedgerReferenceType } from '../models/WalletLedger';

export const walletRepository = {
  findByUserId(userId: number, tx?: Transaction) {
    return Wallet.findOne({ where: { user_id: userId }, transaction: tx });
  },

  create(userId: number, tx?: Transaction) {
    return Wallet.create({ user_id: userId }, { transaction: tx });
  },

  async findOrCreateByUserId(userId: number, tx?: Transaction) {
    const [wallet] = await Wallet.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId },
      transaction: tx,
    });
    return wallet;
  },

  findBalances(walletId: number, tx?: Transaction) {
    return WalletBalance.findAll({
      where: { wallet_id: walletId },
      include: [{ model: Currency, as: 'currency' }],
      order: [['currency_id', 'ASC']],
      transaction: tx,
    });
  },

  findBalance(walletId: number, currencyId: number, tx?: Transaction) {
    return WalletBalance.findOne({
      where: { wallet_id: walletId, currency_id: currencyId },
      transaction: tx,
    });
  },

  // Locks the balance row FOR UPDATE within the supplied transaction.
  findBalanceForUpdate(walletId: number, currencyId: number, tx: Transaction) {
    return WalletBalance.findOne({
      where: { wallet_id: walletId, currency_id: currencyId },
      transaction: tx,
      lock: Transaction.LOCK.UPDATE,
    });
  },

  // Ensures a balance row exists so it can subsequently be locked FOR UPDATE.
  async ensureBalanceRow(walletId: number, currencyId: number, tx: Transaction) {
    const [row] = await WalletBalance.findOrCreate({
      where: { wallet_id: walletId, currency_id: currencyId },
      defaults: { wallet_id: walletId, currency_id: currencyId, balance_credits: 0 },
      transaction: tx,
    });
    return row;
  },

  findLedger(walletId: number, tx?: Transaction) {
    return WalletLedger.findAll({
      where: { wallet_id: walletId },
      include: [{ model: Currency, as: 'currency' }],
      order: [['id', 'DESC']],
      transaction: tx,
    });
  },

  createLedgerEntry(
    params: {
      walletId: number;
      currencyId: number;
      entryType: LedgerEntryType;
      creditsDelta: number;
      referenceType: LedgerReferenceType;
      referenceId: number;
    },
    tx: Transaction
  ) {
    return WalletLedger.create(
      {
        wallet_id: params.walletId,
        currency_id: params.currencyId,
        entry_type: params.entryType,
        credits_delta: params.creditsDelta,
        reference_type: params.referenceType,
        reference_id: params.referenceId,
      },
      { transaction: tx }
    );
  },
};
