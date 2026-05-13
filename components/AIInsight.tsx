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

/** Render **bold** and plain text from simple markdown */
function renderLine(line: string, key: number) {
  const isBold = line.startsWith('**') && line.includes('**', 2);
  if (isBold) {
    const text = line.replace(/\*\*/g, '');
    return (
      <p key={key} className="text-[12px] font-semibold text-[#0e0f0c] mt-3 mb-0.5">
        {text}
      </p>
    );
  }
  return (
    <p key={key} className="text-[13px] text-[#454745] leading-relaxed">
      {line}
    </p>
  );
}

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

      const json = (await res.json()) as { narrative?: string; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? `Error ${res.status}`);
      setNarrative(json.narrative ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-6 mb-5 p-5 bg-canvas border border-black/[0.06] rounded-[24px]">
      {/* Header — always visible */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#0e0f0c]">Analisis AI</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#e8ebe6] text-[#868685]">
            Groq · Llama 3.1
          </span>
        </div>
        {narrative && (
          <button
            onClick={fetchNarrative}
            disabled={loading}
            className="text-[11px] text-[#868685] hover:text-[#0e0f0c] disabled:opacity-40 transition-colors"
          >
            Perbarui ↺
          </button>
        )}
      </div>

      {/* Idle — show CTA button */}
      {!narrative && !loading && !error && (
        <button
          onClick={fetchNarrative}
          className="w-full py-3 rounded-[24px] bg-[#9fe870] text-[#0e0f0c] text-[13px] font-semibold hover:bg-[#cdffad] transition-colors"
        >
          Analisis hasil investasi ini
        </button>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-2.5 w-28 bg-[#e8ebe6] rounded mb-2" />
              <div className="h-2.5 w-full bg-[#e8ebe6] rounded mb-1" />
              <div className="h-2.5 w-4/5 bg-[#e8ebe6] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-[12px] text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchNarrative}
            className="ml-2 px-2 py-1 rounded-[8px] bg-red-50 hover:bg-red-100 text-[11px] transition-colors"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Result */}
      {narrative && !loading && (
        <div>
          {narrative
            .split('\n')
            .filter(Boolean)
            .map((line, i) => renderLine(line, i))}
        </div>
      )}
    </div>
  );
}
