import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { campaignApi, currencyApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import { formatDate } from '../lib/format';
import { Campaign } from '../types';

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const campaignsQuery = useQuery({ queryKey: ['campaigns'], queryFn: campaignApi.list });
  const currenciesQuery = useQuery({ queryKey: ['currencies'], queryFn: currencyApi.list });

  // The campaign-fundable currency, derived from the backend module binding.
  const campaignCurrency = (currenciesQuery.data ?? []).find((c) => c.canFundCampaigns);

  const [name, setName] = useState('');
  const [requiredCredits, setRequiredCredits] = useState<number>(10);

  const createMutation = useMutation({
    mutationFn: () => campaignApi.create(name, requiredCredits),
    onSuccess: () => {
      setName('');
      setRequiredCredits(10);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const onCreate = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="space-y-8">
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Create campaign</h2>
        <form className="grid gap-4 sm:grid-cols-3" onSubmit={onCreate}>
          <div className="sm:col-span-2">
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spring launch"
              required
            />
          </div>
          <div>
            <label className="label">Required credits</label>
            <input
              className="input"
              type="number"
              min={1}
              value={requiredCredits}
              onChange={(e) => setRequiredCredits(Math.max(1, Number(e.target.value)))}
              required
            />
          </div>
          <div className="sm:col-span-3">
            {createMutation.isError && (
              <p className="mb-2 text-sm text-red-600">{extractErrorMessage(createMutation.error)}</p>
            )}
            <button className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating…' : 'Create campaign'}
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your campaigns</h2>
        <div className="grid gap-4">
          {campaignsQuery.isLoading ? (
            <p className="text-slate-500">Loading…</p>
          ) : campaignsQuery.data?.length ? (
            campaignsQuery.data.map((c) => (
              <CampaignCard key={c.id} campaign={c} fundCurrencyCode={campaignCurrency?.code} />
            ))
          ) : (
            <p className="text-slate-500">No campaigns yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function CampaignCard({
  campaign,
  fundCurrencyCode,
}: {
  campaign: Campaign;
  fundCurrencyCode?: string;
}) {
  const queryClient = useQueryClient();
  const fundMutation = useMutation({
    mutationFn: () => {
      if (!fundCurrencyCode) throw new Error('No campaign currency configured');
      return campaignApi.fund(campaign.id, fundCurrencyCode, campaign.requiredCredits);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['ledger'] });
    },
  });

  const funded = campaign.status === 'FUNDED';

  return (
    <div className="card flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold">{campaign.name}</p>
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              funded ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {campaign.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Requires {campaign.requiredCredits} {fundCurrencyCode ?? 'CAMPAIGN'} credits
        </p>
        {funded && (
          <p className="text-xs text-slate-400">Funded at {formatDate(campaign.fundedAt)}</p>
        )}
      </div>
      <div className="text-right">
        {!funded && (
          <button className="btn-primary" disabled={fundMutation.isPending} onClick={() => fundMutation.mutate()}>
            {fundMutation.isPending ? 'Funding…' : 'Fund campaign'}
          </button>
        )}
        {fundMutation.isError && (
          <p className="mt-2 max-w-[14rem] text-sm text-red-600">
            {extractErrorMessage(fundMutation.error)}
          </p>
        )}
      </div>
    </div>
  );
}
