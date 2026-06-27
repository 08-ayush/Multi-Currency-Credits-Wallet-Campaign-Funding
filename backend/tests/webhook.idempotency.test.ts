import request from 'supertest';
import {
  app,
  resetDb,
  signup,
  createPendingPayment,
  buildSignedWebhook,
  getWalletByUserId,
  countLedgerEntries,
} from './helpers';

describe('Test 1 — Duplicate webhook is idempotent', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('rejects an invalid Stripe signature', async () => {
    const res = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', 't=1,v1=deadbeef')
      .send(JSON.stringify({ id: 'evt_bad', type: 'checkout.session.completed' }));

    expect(res.status).toBe(400);
  });

  it('grants credits exactly once when the same event is delivered twice', async () => {
    const { userId } = await signup('dup@example.com');
    const sessionId = 'cs_test_dup_1';
    await createPendingPayment({
      userId,
      currencyCode: 'CAMPAIGN_CREDITS',
      credits: 10,
      sessionId,
    });

    const { payload, signature } = buildSignedWebhook({ eventId: 'evt_dup_1', sessionId });

    const first = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload);

    const second = await request(app)
      .post('/api/webhooks/stripe')
      .set('Content-Type', 'application/json')
      .set('stripe-signature', signature)
      .send(payload);

    expect(first.status).toBe(200);
    expect(first.body.status).toBe('granted');

    // The second delivery is recognised as a duplicate and grants nothing.
    expect(second.status).toBe(200);
    expect(second.body.status).toBe('duplicate');

    const wallet = await getWalletByUserId(userId);

    // Exactly one ledger entry was created despite two deliveries.
    const ledgerCount = await countLedgerEntries(wallet.id);
    expect(ledgerCount).toBe(1);

    // Balance increased exactly once.
    const { WalletBalance } = await import('../src/models');
    const balance = await WalletBalance.findOne({ where: { wallet_id: wallet.id } });
    expect(balance?.balance_credits).toBe(10);
  });
});
