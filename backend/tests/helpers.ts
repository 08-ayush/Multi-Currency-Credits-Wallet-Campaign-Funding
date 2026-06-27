import { QueryTypes } from 'sequelize';
import request from 'supertest';
import { createApp } from '../src/app';
import {
  sequelize,
  Currency,
  CurrencyPlan,
  Wallet,
  WalletBalance,
} from '../src/models';
import { stripe } from '../src/config/stripe';
import { env } from '../src/config/env';

export const app = createApp();

const SEED_CURRENCIES = [
  { name: 'Campaign Credits', code: 'CAMPAIGN_CREDITS', module_name: 'CAMPAIGN', price_per_credit_paise: 300, plans: [10, 50, 100] },
  { name: 'Report Credits', code: 'REPORT_CREDITS', module_name: 'REPORT', price_per_credit_paise: 1000, plans: [5, 20, 50] },
  { name: 'Discovery Credits', code: 'DISCOVERY_CREDITS', module_name: 'DISCOVERY', price_per_credit_paise: 500, plans: [10, 25, 100] },
];

// Truncate all transactional tables and (re)seed currencies + plans so each
// test starts from a known clean state. FK checks are toggled around TRUNCATE.
export async function resetDb(): Promise<void> {
  const tables = [
    'campaign_fundings',
    'campaigns',
    'wallet_ledger',
    'wallet_balances',
    'wallets',
    'stripe_payments',
    'processed_webhooks',
    'currency_plans',
    'currencies',
    'users',
  ];

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
  for (const table of tables) {
    await sequelize.query(`TRUNCATE TABLE \`${table}\`;`);
  }
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');

  for (const c of SEED_CURRENCIES) {
    const currency = await Currency.create({
      name: c.name,
      code: c.code,
      module_name: c.module_name,
      price_per_credit_paise: c.price_per_credit_paise,
    });
    for (const credits of c.plans) {
      await CurrencyPlan.create({
        currency_id: currency.id,
        credits,
        price_paise: credits * c.price_per_credit_paise,
      });
    }
  }
}

export async function signup(email: string, password = 'password123') {
  const res = await request(app).post('/api/auth/signup').send({ email, password });
  if (res.status !== 201) {
    throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  }
  return { token: res.body.token as string, userId: res.body.user.id as number };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getCurrencyByCode(code: string) {
  const currency = await Currency.findOne({ where: { code } });
  if (!currency) throw new Error(`currency ${code} not found`);
  return currency;
}

export async function getWalletByUserId(userId: number) {
  const wallet = await Wallet.findOne({ where: { user_id: userId } });
  if (!wallet) throw new Error(`wallet for user ${userId} not found`);
  return wallet;
}

// Directly seeds a balance row for test arrangement.
export async function setBalance(userId: number, currencyCode: string, credits: number) {
  const wallet = await getWalletByUserId(userId);
  const currency = await getCurrencyByCode(currencyCode);
  await WalletBalance.upsert({
    wallet_id: wallet.id,
    currency_id: currency.id,
    balance_credits: credits,
  });
}

// Inserts a PENDING stripe_payments row, returning the synthetic session id.
export async function createPendingPayment(params: {
  userId: number;
  currencyCode: string;
  credits: number;
  sessionId: string;
  paymentIntentId?: string;
}) {
  const currency = await getCurrencyByCode(params.currencyCode);
  await sequelize.query(
    `INSERT INTO stripe_payments
      (user_id, currency_id, checkout_session_id, payment_intent_id, credits_to_grant, amount_paise, status, created_at)
     VALUES (:userId, :currencyId, :sessionId, :pi, :credits, :amount, 'PENDING', NOW())`,
    {
      replacements: {
        userId: params.userId,
        currencyId: currency.id,
        sessionId: params.sessionId,
        pi: params.paymentIntentId ?? null,
        credits: params.credits,
        amount: params.credits * currency.price_per_credit_paise,
      },
      type: QueryTypes.INSERT,
    }
  );
}

// Builds a checkout.session.completed event with a VALID Stripe signature.
export function buildSignedWebhook(params: { eventId: string; sessionId: string; paymentIntentId?: string }) {
  const event = {
    id: params.eventId,
    object: 'event',
    api_version: '2024-06-20',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: params.sessionId,
        object: 'checkout.session',
        payment_intent: params.paymentIntentId ?? 'pi_test_123',
        payment_status: 'paid',
        status: 'complete',
      },
    },
  };

  const payload = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: env.stripe.webhookSecret,
  });

  return { payload, signature };
}

export async function countLedgerEntries(walletId: number): Promise<number> {
  const rows = await sequelize.query<{ c: number }>(
    'SELECT COUNT(*) AS c FROM wallet_ledger WHERE wallet_id = :walletId',
    { replacements: { walletId }, type: QueryTypes.SELECT }
  );
  return Number(rows[0].c);
}
