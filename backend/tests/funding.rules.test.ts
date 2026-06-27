import request from 'supertest';
import { app, resetDb, signup, authHeader, setBalance, getWalletByUserId, getCurrencyByCode } from './helpers';
import { WalletBalance } from '../src/models';

describe('Test 3 — Wrong currency cannot fund a campaign', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('rejects funding a campaign with REPORT credits (400)', async () => {
    const { token, userId } = await signup('wrongccy@example.com');
    await setBalance(userId, 'REPORT_CREDITS', 100);

    const campaign = await request(app)
      .post('/api/campaigns')
      .set(authHeader(token))
      .send({ name: 'Report-funded?', requiredCredits: 10 });
    expect(campaign.status).toBe(201);

    const res = await request(app)
      .post(`/api/campaigns/${campaign.body.id}/fund`)
      .set(authHeader(token))
      .send({ currencyCode: 'REPORT_CREDITS', credits: 10 });

    expect(res.status).toBe(400);

    // Nothing was deducted from the report balance.
    const wallet = await getWalletByUserId(userId);
    const currency = await getCurrencyByCode('REPORT_CREDITS');
    const balance = await WalletBalance.findOne({
      where: { wallet_id: wallet.id, currency_id: currency.id },
    });
    expect(balance?.balance_credits).toBe(100);
  });

  it('also rejects DISCOVERY credits (400)', async () => {
    const { token, userId } = await signup('disc@example.com');
    await setBalance(userId, 'DISCOVERY_CREDITS', 100);

    const campaign = await request(app)
      .post('/api/campaigns')
      .set(authHeader(token))
      .send({ name: 'Discovery-funded?', requiredCredits: 10 });

    const res = await request(app)
      .post(`/api/campaigns/${campaign.body.id}/fund`)
      .set(authHeader(token))
      .send({ currencyCode: 'DISCOVERY_CREDITS', credits: 10 });

    expect(res.status).toBe(400);
  });
});

describe('Test 4 — A campaign can be funded only once', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('rejects a second funding attempt on the same campaign', async () => {
    const { token, userId } = await signup('once@example.com');
    await setBalance(userId, 'CAMPAIGN_CREDITS', 100);

    const campaign = await request(app)
      .post('/api/campaigns')
      .set(authHeader(token))
      .send({ name: 'Fund once', requiredCredits: 30 });

    const first = await request(app)
      .post(`/api/campaigns/${campaign.body.id}/fund`)
      .set(authHeader(token))
      .send({ currencyCode: 'CAMPAIGN_CREDITS', credits: 30 });
    expect(first.status).toBe(200);
    expect(first.body.status).toBe('FUNDED');

    const second = await request(app)
      .post(`/api/campaigns/${campaign.body.id}/fund`)
      .set(authHeader(token))
      .send({ currencyCode: 'CAMPAIGN_CREDITS', credits: 30 });
    expect(second.status).toBe(409);

    // Only 30 credits were ever deducted (100 -> 70).
    const wallet = await getWalletByUserId(userId);
    const currency = await getCurrencyByCode('CAMPAIGN_CREDITS');
    const balance = await WalletBalance.findOne({
      where: { wallet_id: wallet.id, currency_id: currency.id },
    });
    expect(balance?.balance_credits).toBe(70);
  });
});
