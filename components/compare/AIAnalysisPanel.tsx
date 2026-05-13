'use client';

import { useEffect, useState, useRef } from 'react';
import type { ComparisonResult, AIAnalysis } from '@/lib/types';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/ai-cache';

type AIAnalysisPanelProps = {
  result: ComparisonResult;
};

const SECTIONS: {
  key: keyof Pick<
    AIAnalysis,
    'summary' | 'winnerExplanation' | 'contextAnalysis' | 'importantNotes'
  >;
  title: string;
}[] = [
  { key: 'summary', title: 'Ringkasan hasil' },
  { key: 'winnerExplanation', title: 'Pemenang & selisih' },
  { key: 'contextAnalysis', title: 'Analisis konteks' },
  { key: 'importantNotes', title: 'Catatan penting' },
];

function makeResultKey(result: ComparisonResult): string {
  return [
    result.winner,
    result.loser,
    result.strategies.length,
    result.input.monthlyAmount,
    result.input.startDate instanceof Date
      ? result.input.startDate.toISOString().slice(0, 7)
      : String(result.input.startDate),
    result.input.endDate instanceof Date
      ? result.input.endDate.toISOString().slice(0, 7)
      : String(result.input.endDate),
  ].join('-');
}

export default function AIAnalysisPanel({ result }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastKey = useRef<string>('');

  async function fetchAnalysis(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = getCachedAnalysis(result);
      if (cached) {
        setAnalysis(cached);
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/compare-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });
      const json = (await res.json()) as AIAnalysis | { error: string };
      if ('error' in json) throw new Error(json.error);
      setCachedAnalysis(result, json);
      setAnalysis({ ...json, fromCache: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analisis tidak tersedia');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const key = makeResultKey(result);
    if (key === lastKey.current) return;
    lastKey.current = key;
    void fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeResultKey(result)]);

  return (
    <div className="mx-4 mb-4 p-4 rounded-xl border border-black/[0.08] bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-gray-900">Analisis AI</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-soft text-gray-400">
            Groq · Llama 3.3
          </span>
        </div>
        {(analysis || error) && (
          <button
            onClick={() => fetchAnalysis(true)}
            disabled={loading}
            className="text-[11px] text-blue-500 hover:text-blue-700 disabled:opacity-40 transition-colors"
          >
            Perbarui ↺
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {SECTIONS.map((s) => (
            <div key={s.key}>
              <div className="h-2.5 w-28 bg-soft rounded mb-2" />
              <div className="h-2.5 w-full bg-soft rounded mb-1" />
              <div className="h-2.5 w-4/5 bg-soft rounded" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-[12px] text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchAnalysis(true)}
            className="ml-2 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-[11px] transition-colors"
          >
            Coba lagi
          </button>
        </div>
      )}

      {analysis && !loading && (
        <>
          <div className="space-y-3">
            {SECTIONS.map((s) => (
              <div key={s.key}>
                <p className="text-[12px] font-medium text-gray-800 mb-0.5">{s.title}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed">{analysis[s.key]}</p>
              </div>
            ))}
          </div>
          {analysis.fromCache && (
            <p className="text-[10px] text-gray-300 mt-3 italic">
              Hasil dari cache · klik Perbarui untuk fetch ulang
            </p>
          )}
        </>
      )}
    </div>
  );
}
