export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface Plan {
  id: number;
  credits: number;
  pricePaise: number;
}

export interface Currency {
  id: number;
  name: string;
  code: string;
  moduleName: string;
  pricePerCreditPaise: number;
  canFundCampaigns: boolean;
  plans: Plan[];
}

export interface WalletBalance {
  currencyId: number;
  balanceCredits: number;
  currency: {
    id: number;
    name: string;
    code: string;
    moduleName: string;
    pricePerCreditPaise: number;
  } | null;
}

export interface WalletResponse {
  walletId: number;
  balances: WalletBalance[];
}

export interface LedgerEntry {
  id: number;
  currencyId: number;
  currencyCode: string | null;
  entryType: 'PURCHASE' | 'SPEND';
  creditsDelta: number;
  referenceType: 'PAYMENT' | 'CAMPAIGN';
  referenceId: number;
  createdAt: string;
}

export interface Campaign {
  id: number;
  userId: number;
  name: string;
  status: 'DRAFT' | 'FUNDED';
  requiredCredits: number;
  fundedAt: string | null;
  createdAt?: string;
  funding: { id: number; ledgerEntryId: number; createdAt?: string } | null;
}
