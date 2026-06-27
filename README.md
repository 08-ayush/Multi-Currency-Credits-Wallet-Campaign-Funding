# Multi-Currency Credits Wallet & Campaign Funding

A production-quality full-stack application where users buy **credits** in three
currencies via **Stripe Checkout**, hold them in a **multi-currency wallet**, and
spend **Campaign Credits** to fund campaigns. The system is built around
**correctness, idempotency, transactions, concurrency safety, and payment
integrity**.

- **Backend:** Node.js + TypeScript + Express + Sequelize (MySQL)
- **Frontend:** React + TypeScript + Vite + React Query + Tailwind CSS
- **Payments:** Stripe Checkout (Test Mode) + signed webhooks
- **Auth:** JWT + bcrypt
- **Validation:** Zod
- **Tests:** Jest + Supertest
- **Schema:** Sequelize CLI **migrations only** (`sequelize.sync()` is never used)

See [`DESIGN.md`](./DESIGN.md) for the ER diagram, idempotency strategy,
transaction boundaries, concurrency handling, and failure analysis.

---

## Currencies & module binding

| Currency          | Code               | Module     | Price/credit | Can fund campaigns? |
| ----------------- | ------------------ | ---------- | ------------ | ------------------- |
| Campaign Credits  | `CAMPAIGN_CREDITS` | `CAMPAIGN` | ₹3 (300p)    | ✅ Yes              |
| Report Credits    | `REPORT_CREDITS`   | `REPORT`   | ₹10 (1000p)  | ❌ No               |
| Discovery Credits | `DISCOVERY_CREDITS`| `DISCOVERY`| ₹5 (500p)    | ❌ No               |

Prices are stored in **paise**. The currency→module binding lives in the
`currencies.module_name` column (configurable via DB), **not** hardcoded. Only
currencies whose module is `CAMPAIGN` may fund campaigns.

---

## Project structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/         # env, sequelize, stripe clients
│   │   ├── controllers/    # HTTP layer
│   │   ├── services/       # business logic (transactions live here)
│   │   ├── repositories/   # data access (locks live here)
│   │   ├── middlewares/    # auth, validation, error handling
│   │   ├── routes/         # express routers
│   │   ├── models/         # Sequelize models + associations
│   │   ├── validators/     # Zod schemas
│   │   ├── utils/          # jwt, password, errors, asyncHandler
│   │   └── db/
│   │       ├── config.js   # Sequelize CLI config
│   │       ├── migrations/ # schema (CLI migrations ONLY)
│   │       └── seeders/    # currencies + plans
│   └── tests/              # Jest + Supertest
└── frontend/
    └── src/
        ├── api/            # axios client + endpoints
        ├── pages/          # Login, Signup, Wallet, Campaigns
        ├── components/     # Layout, ProtectedRoute
        ├── hooks/          # auth context
        └── lib/            # formatting helpers
```

---

## Prerequisites

- Node.js 18+ (tested on 24)
- MySQL 8+ (tested on 9.6)
- A Stripe **test mode** account + the [Stripe CLI](https://stripe.com/docs/stripe-cli) (for local webhooks)

---

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials + Stripe test keys
```

Create the database, run migrations, and seed currencies/plans:

```bash
npm run db:create     # creates the development database
npm run db:migrate    # runs all CLI migrations
npm run db:seed       # seeds currencies + plans
# Shortcut for a clean slate:
npm run db:reset
```

Run the API:

```bash
npm run dev           # ts-node-dev with reload  → http://localhost:4000
# or
npm run build && npm start
```

Health check: `GET http://localhost:4000/api/health` → `{ "status": "ok" }`.

### Required environment variables (`backend/.env`)

| Variable                | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `PORT`                  | API port (default 4000)                            |
| `CLIENT_URL`            | Frontend origin for CORS                           |
| `DB_HOST/PORT/USER/PASSWORD/NAME` | MySQL connection (development)           |
| `DB_NAME_TEST`          | Separate database used by the Jest suite           |
| `JWT_SECRET`            | JWT signing secret                                 |
| `JWT_EXPIRES_IN`        | Token TTL (e.g. `7d`)                              |
| `STRIPE_SECRET_KEY`     | Stripe **test** secret key (`sk_test_…`)           |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_…`)                 |
| `STRIPE_CURRENCY`       | Checkout currency (default `inr`)                  |
| `STRIPE_SUCCESS_URL`    | Redirect after successful checkout                 |
| `STRIPE_CANCEL_URL`     | Redirect after cancelled checkout                  |

---

## Stripe (Test Mode) setup

1. Put your test secret key in `STRIPE_SECRET_KEY`.
2. Start the webhook forwarder (this prints your `whsec_…` secret):

   ```bash
   stripe listen --forward-to localhost:4000/api/webhooks/stripe
   ```

3. Copy the printed signing secret into `STRIPE_WEBHOOK_SECRET` and restart the API.
4. Buy credits from the Wallet page → complete checkout with test card
   `4242 4242 4242 4242` → the webhook grants credits **exactly once**.

> **Credits are never granted at checkout creation.** They are granted solely by
> the verified `checkout.session.completed` webhook.

---

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # optional; dev proxy forwards /api → :4000 by default
npm run dev            # → http://localhost:5173
```

Pages: **Login**, **Signup**, **Wallet** (balances, ledger, buy credits),
**Campaigns** (create, list, fund).

---

## Running the tests

The suite uses a **separate** database (`DB_NAME_TEST`).

```bash
cd backend
# one-time: create + migrate + seed the test DB
npm run test:setup
# run all tests
npm test
```

The four required scenarios are covered:

| Test                              | File                                  |
| --------------------------------- | ------------------------------------- |
| 1. Duplicate webhook (grant once) | `tests/webhook.idempotency.test.ts`   |
| 2. Concurrent spend (no overspend)| `tests/concurrency.spend.test.ts`     |
| 3. Wrong currency rejected (400)  | `tests/funding.rules.test.ts`         |
| 4. Double funding rejected        | `tests/funding.rules.test.ts`         |

---

## API reference

All wallet/campaign/payment endpoints require `Authorization: Bearer <jwt>`.

### Auth
- `POST /api/auth/signup` → `{ email, password }` → `{ token, user }`
- `POST /api/auth/login` → `{ email, password }` → `{ token, user }`

### Wallet
- `GET /api/wallet` → `{ walletId, balances: [...] }`
- `GET /api/wallet/ledger` → `{ ledger: [...] }`

### Currencies
- `GET /api/currencies` → `{ currencies: [{ ..., plans, canFundCampaigns }] }`

### Payments
- `POST /api/payments/create-checkout-session`
  - body: `{ currencyId, planId }` **or** `{ currencyId, quantity }`
  - returns `{ checkoutUrl, sessionId }` and stores a **PENDING** payment.
  - **Does not grant credits.**

### Webhook
- `POST /api/webhooks/stripe` (raw body; Stripe-signed)
  - verifies signature, handles `checkout.session.completed`, idempotent.

### Campaigns
- `POST /api/campaigns` → `{ name, requiredCredits }`
- `GET /api/campaigns` → `{ campaigns: [...] }`
- `POST /api/campaigns/:id/fund` → `{ currencyCode, credits }`
  - only `CAMPAIGN`-module currency accepted; others → `400`.

---

## Acceptance criteria mapping

| Criterion                                   | How it is guaranteed                                                  |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Wallet balance = sum of ledger              | Every balance mutation writes a signed ledger row in the same txn    |
| Credits granted only via verified webhook   | Checkout only stores PENDING; webhook verifies signature then grants |
| Duplicate webhook grants once               | `processed_webhooks.stripe_event_id` UNIQUE + row lock + status guard|
| Campaign funded once                        | Campaign row lock + `campaign_fundings.campaign_id` UNIQUE           |
| Balance never negative                      | `SELECT … FOR UPDATE` + `balance >= credits` check inside the txn    |
| Wrong currency rejected                     | `module_name === 'CAMPAIGN'` check (DB-driven binding)               |
| Concurrent funding cannot overspend         | Balance row locked `FOR UPDATE`; concurrent txns serialize           |
```
