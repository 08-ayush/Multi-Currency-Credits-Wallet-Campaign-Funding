import { Transaction } from 'sequelize';
import { StripePayment } from '../models';
import { StripePaymentStatus } from '../models/StripePayment';

export const paymentRepository = {
  create(
    params: {
      userId: number;
      currencyId: number;
      checkoutSessionId: string;
      creditsToGrant: number;
      amountPaise: number;
      paymentIntentId?: string | null;
    },
    tx?: Transaction
  ) {
    return StripePayment.create(
      {
        user_id: params.userId,
        currency_id: params.currencyId,
        checkout_session_id: params.checkoutSessionId,
        credits_to_grant: params.creditsToGrant,
        amount_paise: params.amountPaise,
        payment_intent_id: params.paymentIntentId ?? null,
        status: 'PENDING',
      },
      { transaction: tx }
    );
  },

  findBySessionId(sessionId: string, tx?: Transaction) {
    return StripePayment.findOne({ where: { checkout_session_id: sessionId }, transaction: tx });
  },

  // Locks the payment row FOR UPDATE so concurrent webhook deliveries serialize.
  findBySessionIdForUpdate(sessionId: string, tx: Transaction) {
    return StripePayment.findOne({
      where: { checkout_session_id: sessionId },
      transaction: tx,
      lock: Transaction.LOCK.UPDATE,
    });
  },

  findByUserId(userId: number, tx?: Transaction) {
    return StripePayment.findAll({
      where: { user_id: userId },
      order: [['id', 'DESC']],
      transaction: tx,
    });
  },

  async updateStatus(
    id: number,
    status: StripePaymentStatus,
    paymentIntentId: string | null,
    tx: Transaction
  ) {
    await StripePayment.update(
      { status, payment_intent_id: paymentIntentId },
      { where: { id }, transaction: tx }
    );
  },
};
