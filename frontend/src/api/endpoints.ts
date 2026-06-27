import { api } from './client';
import {
  AuthResponse,
  Campaign,
  Currency,
  LedgerEntry,
  WalletResponse,
} from '../types';

export const authApi = {
  signup: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/signup', { email, password }).then((r) => r.data),
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/api/auth/login', { email, password }).then((r) => r.data),
};

export const walletApi = {
  get: () => api.get<WalletResponse>('/api/wallet').then((r) => r.data),
  ledger: () =>
    api.get<{ ledger: LedgerEntry[] }>('/api/wallet/ledger').then((r) => r.data.ledger),
};

export const currencyApi = {
  list: () =>
    api.get<{ currencies: Currency[] }>('/api/currencies').then((r) => r.data.currencies),
};

export const paymentApi = {
  createCheckout: (payload: { currencyId: number; planId?: number; quantity?: number }) =>
    api
      .post<{ checkoutUrl: string; sessionId: string }>(
        '/api/payments/create-checkout-session',
        payload
      )
      .then((r) => r.data),
};

export const campaignApi = {
  list: () =>
    api.get<{ campaigns: Campaign[] }>('/api/campaigns').then((r) => r.data.campaigns),
  create: (name: string, requiredCredits: number) =>
    api.post<Campaign>('/api/campaigns', { name, requiredCredits }).then((r) => r.data),
  fund: (id: number, currencyCode: string, credits: number) =>
    api
      .post<Campaign>(`/api/campaigns/${id}/fund`, { currencyCode, credits })
      .then((r) => r.data),
};
