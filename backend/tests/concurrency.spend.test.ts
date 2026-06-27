import request from 'supertest';
import { app, resetDb, signup, authHeader, setBalance, getWalletByUserId } from './helpers';
import { WalletBalance } from '../src/models';
import { getCurrencyByCode } from './helpers';

describe('Test 2 — Concurrent spend cannot overspend', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('allows only one of two concurrent 80-credit spends against a 100 balance', async () => {
    const { token, userId } = await signup('race@example.com');

    // Arrange: wallet has exactly 100 CAMPAIGN credits.
    await setBalance(userId, 'CAMPAIGN_CREDITS', 100);

    // Two distinct campaigns, each requiring 80 credits.
    const campaignA = await request(app)
      .post('/api/campaigns')
      .set(authHeader(token))
      .send({ name: 'Campaign A', requiredCredits: 80 });
    const campaignB = await request(app)
      .post('/api/campaigns')
      .set(authHeader(token))
      .send({ name: 'Campaign B', requiredCredits: 80 });

    expect(campaignA.status).toBe(201);
    expect(campaignB.status).toBe(201);

    // Act: fire both funding requests concurrently.
    const [resA, resB] = await Promise.all([
      request(app)
        .post(`/api/campaigns/${campaignA.body.id}/fund`)
        .set(authHeader(token))
        .send({ currencyCode: 'CAMPAIGN_CREDITS', credits: 80 }),
      request(app)
        .post(`/api/campaigns/${campaignB.body.id}/fund`)
        .set(authHeader(token))
        .send({ currencyCode: 'CAMPAIGN_CREDITS', credits: 80 }),
    ]);

    const statuses = [resA.status, resB.status].sort();
    // Exactly one success (200) and one failure (400 insufficient credits).
    expect(statuses).toEqual([200, 400]);

    // Final balance is 20 and never went negative.
    const wallet = await getWalletByUserId(userId);
    const currency = await getCurrencyByCode('CAMPAIGN_CREDITS');
    const balance = await WalletBalance.findOne({
      where: { wallet_id: wallet.id, currency_id: currency.id },
    });
    expect(balance?.balance_credits).toBe(20);
    expect(balance!.balance_credits).toBeGreaterThanOrEqual(0);
  });
});
