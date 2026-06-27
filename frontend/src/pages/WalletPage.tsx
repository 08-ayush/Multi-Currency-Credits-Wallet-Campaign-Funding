import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { walletApi, currencyApi, paymentApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import { paiseToRupees, formatDate } from '../lib/format';

type Mode = 'plan' | 'quantity';

export function WalletPage() {
  const walletQuery = useQuery({ queryKey: ['wallet'], queryFn: walletApi.get });
  const ledgerQuery = useQuery({ queryKey: ['ledger'], queryFn: walletApi.ledger });
  const currenciesQuery = useQuery({ queryKey: ['currencies'], queryFn: currencyApi.list });

  const currencies = currenciesQuery.data ?? [];
  const [currencyId, setCurrencyId] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>('plan');
  const [planId, setPlanId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.id === (currencyId ?? currencies[0]?.id)),
    [currencies, currencyId]
  );

  const checkout = useMutation({
    mutationFn: () => {
      if (!selectedCurrency) throw new Error('Select a currency');
      const payload =
        mode === 'plan'
          ? { currencyId: selectedCurrency.id, planId: planId ?? selectedCurrency.plans[0]?.id }
          : { currencyId: selectedCurrency.id, quantity };
      return paymentApi.createCheckout(payload);
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });

  const estimatedPaise =
    mode === 'plan'
      ? selectedCurrency?.plans.find((p) => p.id === (planId ?? selectedCurrency?.plans[0]?.id))
          ?.pricePaise ?? 0
      : (selectedCurrency?.pricePerCreditPaise ?? 0) * quantity;

  return (
    <div className="space-y-8">
      {/* Balances */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Balances</h2>
        {walletQuery.isLoading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {walletQuery.data?.balances.length ? (
              walletQuery.data.balances.map((b) => (
                <div key={b.currencyId} className="card">
                  <p className="text-sm text-slate-500">{b.currency?.name ?? `#${b.currencyId}`}</p>
                  <p className="mt-1 text-3xl font-bold">{b.balanceCredits}</p>
                  <p className="text-xs text-slate-400">{b.currency?.code}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500">No balances yet. Buy some credits below.</p>
            )}
          </div>
        )}
      </section>

      {/* Buy credits */}
      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Buy credits</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Currency</label>
            <select
              className="input"
              value={selectedCurrency?.id ?? ''}
              onChange={(e) => {
                setCurrencyId(Number(e.target.value));
                setPlanId(null);
              }}
            >
              {currencies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({paiseToRupees(c.pricePerCreditPaise)}/credit)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Purchase type</label>
            <div className="flex gap-2">
              <button
                type="button"
                className={mode === 'plan' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
                onClick={() => setMode('plan')}
              >
                Plan
              </button>
              <button
                type="button"
                className={mode === 'quantity' ? 'btn-primary flex-1' : 'btn-secondary flex-1'}
                onClick={() => setMode('quantity')}
              >
                Custom quantity
              </button>
            </div>
          </div>

          {mode === 'plan' ? (
            <div>
              <label className="label">Plan</label>
              <select
                className="input"
                value={planId ?? selectedCurrency?.plans[0]?.id ?? ''}
                onChange={(e) => setPlanId(Number(e.target.value))}
              >
                {selectedCurrency?.plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.credits} credits — {paiseToRupees(p.pricePaise)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="label">Quantity (credits)</label>
              <input
                className="input"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
            </div>
          )}

          <div className="flex items-end">
            <div className="w-full">
              <p className="mb-2 text-sm text-slate-500">
                Total: <span className="font-semibold text-slate-800">{paiseToRupees(estimatedPaise)}</span>
              </p>
              <button
                className="btn-primary w-full"
                disabled={checkout.isPending || !selectedCurrency}
                onClick={() => checkout.mutate()}
              >
                {checkout.isPending ? 'Redirecting…' : 'Buy with Stripe'}
              </button>
            </div>
          </div>
        </div>
        {checkout.isError && (
          <p className="mt-3 text-sm text-red-600">{extractErrorMessage(checkout.error)}</p>
        )}
        <p className="mt-3 text-xs text-slate-400">
          Credits are granted only after Stripe confirms payment via webhook.
        </p>
      </section>

      {/* Ledger */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Ledger history</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Currency</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2 text-right">Delta</th>
                <th className="px-4 py-2">Reference</th>
              </tr>
            </thead>
            <tbody>
              {ledgerQuery.data?.length ? (
                ledgerQuery.data.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="px-4 py-2 text-slate-500">{formatDate(e.createdAt)}</td>
                    <td className="px-4 py-2">{e.currencyCode}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          e.entryType === 'PURCHASE'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {e.entryType}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-medium ${
                        e.creditsDelta >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {e.creditsDelta > 0 ? `+${e.creditsDelta}` : e.creditsDelta}
                    </td>
                    <td className="px-4 py-2 text-slate-500">
                      {e.referenceType} #{e.referenceId}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No ledger entries yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
