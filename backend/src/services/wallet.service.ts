import { walletRepository } from '../repositories/wallet.repository';
import { Currency } from '../models';

export const walletService = {
  async getWallet(userId: number) {
    const wallet = await walletRepository.findOrCreateByUserId(userId);
    const balances = await walletRepository.findBalances(wallet.id);

    return {
      walletId: wallet.id,
      balances: balances.map((b) => {
        const currency = (b as unknown as { currency?: Currency }).currency;
        return {
          currencyId: b.currency_id,
          balanceCredits: b.balance_credits,
          currency: currency
            ? {
                id: currency.id,
                name: currency.name,
                code: currency.code,
                moduleName: currency.module_name,
                pricePerCreditPaise: currency.price_per_credit_paise,
              }
            : null,
        };
      }),
    };
  },

  async getLedger(userId: number) {
    const wallet = await walletRepository.findOrCreateByUserId(userId);
    const entries = await walletRepository.findLedger(wallet.id);

    return entries.map((e) => {
      const currency = (e as unknown as { currency?: Currency }).currency;
      return {
        id: e.id,
        currencyId: e.currency_id,
        currencyCode: currency?.code ?? null,
        entryType: e.entry_type,
        creditsDelta: e.credits_delta,
        referenceType: e.reference_type,
        referenceId: e.reference_id,
        createdAt: e.created_at,
      };
    });
  },
};
