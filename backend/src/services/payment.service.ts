import Stripe from 'stripe';
import { sequelize, ProcessedWebhook } from '../models';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { currencyRepository } from '../repositories/currency.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { walletRepository } from '../repositories/wallet.repository';
import { AppError } from '../utils/AppError';

interface CreateCheckoutParams {
  userId: number;
  currencyId: number;
  planId?: number;
  quantity?: number;
}

export const paymentService = {
  /**
   * Creates a Stripe Checkout Session and records a PENDING payment.
   * IMPORTANT: credits are NEVER granted here — only the webhook grants credits.
   */
  async createCheckoutSession(params: CreateCheckoutParams) {
    const { userId, currencyId, planId, quantity } = params;

    const currency = await currencyRepository.findById(currencyId);
    if (!currency) {
      throw AppError.notFound('Currency not found');
    }

    let credits: number;
    let amountPaise: number;

    if (planId !== undefined) {
      const plan = await currencyRepository.findPlanById(planId);
      if (!plan || plan.currency_id !== currency.id) {
        throw AppError.badRequest('Plan does not belong to the specified currency');
      }
      credits = plan.credits;
      amountPaise = plan.price_paise;
    } else {
      // quantity-based pricing
      credits = quantity as number;
      amountPaise = credits * currency.price_per_credit_paise;
    }

    if (credits <= 0 || amountPaise <= 0) {
      throw AppError.badRequest('Invalid credits/amount');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: env.stripe.successUrl,
      cancel_url: env.stripe.cancelUrl,
      client_reference_id: String(userId),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: env.stripe.currency,
            unit_amount: amountPaise,
            product_data: {
              name: `${currency.name} x ${credits}`,
              description: `${credits} ${currency.code} credits`,
            },
          },
        },
      ],
      // Metadata is the source of truth used by the webhook to grant credits.
      metadata: {
        userId: String(userId),
        currencyId: String(currency.id),
        credits: String(credits),
      },
    });

    await paymentRepository.create({
      userId,
      currencyId: currency.id,
      checkoutSessionId: session.id,
      creditsToGrant: credits,
      amountPaise,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
    });

    return { checkoutUrl: session.url, sessionId: session.id };
  },

  /**
   * Verifies a raw webhook payload and returns the parsed Stripe event.
   * Throws 400 on invalid signature.
   */
  constructEvent(rawBody: Buffer, signature: string | undefined): Stripe.Event {
    if (!signature) {
      throw AppError.badRequest('Missing Stripe signature');
    }
    try {
      return stripe.webhooks.constructEvent(rawBody, signature, env.stripe.webhookSecret);
    } catch {
      throw AppError.badRequest('Invalid Stripe signature');
    }
  },

  /**
   * Idempotently processes a Stripe event.
   *
   * Idempotency contract: every event is inserted into processed_webhooks
   * (UNIQUE stripe_event_id) at the very start of the transaction. A duplicate
   * delivery hits the unique constraint, we roll back and return early — so
   * credits are granted EXACTLY ONCE regardless of how many times Stripe
   * delivers the same event.
   */
  async handleStripeEvent(event: Stripe.Event): Promise<{ status: string }> {
    // We only act on completed checkout sessions. Other event types are still
    // recorded as processed so Stripe stops retrying them.
    const isCheckoutCompleted = event.type === 'checkout.session.completed';

    try {
      return await sequelize.transaction(async (tx) => {
        // 1) Claim this event. Duplicate -> unique violation -> caught below.
        await ProcessedWebhook.create({ stripe_event_id: event.id }, { transaction: tx });

        if (!isCheckoutCompleted) {
          return { status: 'ignored' };
        }

        const session = event.data.object as Stripe.Checkout.Session;
        const sessionId = session.id;

        // 2) Lock the payment row so concurrent deliveries serialize.
        const payment = await paymentRepository.findBySessionIdForUpdate(sessionId, tx);
        if (!payment) {
          // No matching payment recorded — nothing to grant. Mark processed.
          return { status: 'no_payment' };
        }

        // 3) Guard: if already completed, do not grant again.
        if (payment.status === 'COMPLETED') {
          return { status: 'already_completed' };
        }

        // 4) Mark payment completed.
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : payment.payment_intent_id ?? null;
        await paymentRepository.updateStatus(payment.id, 'COMPLETED', paymentIntentId, tx);

        // 5) Resolve wallet + balance row (locked) and credit it.
        const wallet = await walletRepository.findOrCreateByUserId(payment.user_id, tx);
        await walletRepository.ensureBalanceRow(wallet.id, payment.currency_id, tx);
        const balance = await walletRepository.findBalanceForUpdate(
          wallet.id,
          payment.currency_id,
          tx
        );
        if (!balance) {
          throw new AppError(500, 'Wallet balance row missing after ensure');
        }

        // 6) Ledger PURCHASE entry (positive delta) referencing the payment.
        await walletRepository.createLedgerEntry(
          {
            walletId: wallet.id,
            currencyId: payment.currency_id,
            entryType: 'PURCHASE',
            creditsDelta: payment.credits_to_grant,
            referenceType: 'PAYMENT',
            referenceId: payment.id,
          },
          tx
        );

        // 7) Update materialized balance.
        balance.balance_credits = balance.balance_credits + payment.credits_to_grant;
        await balance.save({ transaction: tx });

        return { status: 'granted' };
      });
    } catch (err) {
      // Duplicate event delivery: the processed_webhooks insert failed.
      if ((err as { name?: string })?.name === 'SequelizeUniqueConstraintError') {
        return { status: 'duplicate' };
      }
      throw err;
    }
  },
};
