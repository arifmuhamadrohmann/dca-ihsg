'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { DCAResult, CrisisMarker } from '@/lib/types';

type AIInsightProps = {
  result: DCAResult;
  startDate: Date;
  endDate: Date;
  visibleCrises: CrisisMarker[];
};

export default function AIInsight({ result, startDate, endDate, visibleCrises }: AIInsightProps) {
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchNarrative() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyAmount: result.totalInvested / result.monthsInvested,
          totalInvested: result.totalInvested,
          finalValue: result.finalValue,
          gain: result.gain,
          returnPct: result.returnPct,
          xirr: result.xirr,
          periodLabel: result.periodLabel,
          startDate: format(startDate, 'MMMM yyyy'),
          endDate: format(endDate, 'MMMM yyyy'),
          crises: visibleCrises.map((c) => c.label),
        }),
      });
      if (!res.ok) throw new Error('Gagal memuat cerita');
      const json = (await res.json()) as { narrative?: string; error?: string };
      if (json.error) throw new Error(json.error);
      setNarrative(json.narrative ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-4 mb-4">
      {!narrative && !loading && (
        <button
          onClick={fetchNarrative}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-brand-success/30 bg-brand-success-bg text-brand-success text-[13px] font-medium hover:bg-brand-success/10 transition-colors"
        >
          <span>✨</span>
          <span>Ceritakan perjalanan investasi ini</span>
        </button>
      )}

      {loading && (
        <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-success-bg text-brand-success text-[13px]">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Sedang merangkai cerita…</span>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 text-red-500 text-[13px]">
          {error}
          <button onClick={fetchNarrative} className="ml-2 underline">
            Coba lagi
          </button>
        </div>
      )}

      {narrative && (
        <div className="rounded-xl border border-brand-success/20 bg-brand-success-bg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-success">
              <span>✨</span>
              <span>Cerita Perjalanan Investasi</span>
            </span>
            <button
              onClick={fetchNarrative}
              disabled={loading}
              className="text-[11px] text-brand-success/70 hover:text-brand-success underline disabled:opacity-50"
            >
              Ceritakan ulang
            </button>
          </div>
          <div className="text-[13px] text-gray-700 leading-relaxed space-y-3">
            {narrative
              .split('\n')
              .filter(Boolean)
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
