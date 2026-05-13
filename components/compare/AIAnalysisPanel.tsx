'use client';

import { useState } from 'react';
import type { ComparisonResult, AIAnalysis } from '@/lib/types';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/ai-cache';

type AIAnalysisPanelProps = {
  result: ComparisonResult;
  /** When false, renders without outer card — used when nested inside a card wrapper */
  standalone?: boolean;
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

export default function AIAnalysisPanel({ result, standalone = true }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState(false);

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

  function handleRequest() {
    setRequested(true);
    void fetchAnalysis();
  }

  const outerClass = standalone
    ? 'mx-6 mb-5 p-5 bg-canvas border border-black/[0.06] rounded-[12px]'
    : 'p-5 border-t border-black/[0.06]';

  return (
    <div className={outerClass}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#0e0f0c]">Analisis AI</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#e8ebe6] text-[#868685]">
            Groq · Llama 3.3
          </span>
        </div>
        {(analysis || error) && (
          <button
            onClick={() => fetchAnalysis(true)}
            disabled={loading}
            className="text-[11px] text-[#868685] hover:text-[#0e0f0c] disabled:opacity-40 transition-colors"
          >
            Perbarui ↺
          </button>
        )}
      </div>

      {!requested && !analysis && !loading && (
        <button
          onClick={handleRequest}
          className="w-full py-3 rounded-[12px] bg-[#9fe870] text-[#0e0f0c] text-[13px] font-semibold hover:bg-[#cdffad] transition-colors"
        >
          Hasilkan Analisis
        </button>
      )}

      {loading && (
        <div className="space-y-4 animate-pulse">
          {SECTIONS.map((s) => (
            <div key={s.key}>
              <div className="h-2.5 w-28 bg-[#e8ebe6] rounded mb-2" />
              <div className="h-2.5 w-full bg-[#e8ebe6] rounded mb-1" />
              <div className="h-2.5 w-4/5 bg-[#e8ebe6] rounded" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-[12px] text-red-500 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchAnalysis(true)}
            className="ml-2 px-2 py-1 rounded-[8px] bg-red-50 hover:bg-red-100 text-[11px] transition-colors"
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
                <p className="text-[12px] font-semibold text-[#0e0f0c] mb-0.5">{s.title}</p>
                <p className="text-[11px] text-[#454745] leading-relaxed">{analysis[s.key]}</p>
              </div>
            ))}
          </div>
          {analysis.fromCache && (
            <p className="text-[10px] text-[#868685] mt-3 italic">
              Hasil dari cache · klik Perbarui untuk fetch ulang
            </p>
          )}
        </>
      )}
    </div>
  );
}
