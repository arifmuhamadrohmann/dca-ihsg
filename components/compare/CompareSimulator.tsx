'use client';

import { useMemo, useState } from 'react';
import { parseISO, format } from 'date-fns';
import { runComparison } from '@/lib/compare';
import type { MonthlyPrice, BIRate, Strategy } from '@/lib/types';
import InputPanel from '@/components/InputPanel';
import StrategyPicker from './StrategyPicker';
import RankingRow from './RankingRow';
import ComparisonChart from './ComparisonChart';
import ComparisonGrid from './ComparisonGrid';
import CompareActionsBar from './CompareActionsBar';
import AIAnalysisPanel from './AIAnalysisPanel';
import CompareMethodologyAccordion from './CompareMethodologyAccordion';
import Disclaimer from '@/components/Disclaimer';
import Footer from '@/components/Footer';

type CompareSimulatorProps = {
  ihsgPrices: MonthlyPrice[];
  biRates: BIRate[];
  lastUpdated: string;
};

const DEFAULT_STRATEGIES: Strategy[] = ['dca-ihsg', 'lumpsum-ihsg'];

export default function CompareSimulator({
  ihsgPrices,
  biRates,
  lastUpdated,
}: CompareSimulatorProps) {
  const minDate = parseISO(ihsgPrices[0]!.date);
  const maxDate = parseISO(ihsgPrices[ihsgPrices.length - 1]!.date);

  const [monthlyAmount, setMonthlyAmount] = useState(1_000_000);
  const [startDate, setStartDate] = useState(new Date('2010-01-01'));
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStrategies, setSelectedStrategies] = useState<Strategy[]>(DEFAULT_STRATEGIES);

  const effectiveEnd = endDate ?? maxDate;

  const result = useMemo(() => {
    try {
      return runComparison({
        monthlyAmount,
        startDate,
        endDate: effectiveEnd,
        strategies: selectedStrategies,
        ihsgPrices,
        biRates,
      });
    } catch {
      return null;
    }
  }, [monthlyAmount, startDate, effectiveEnd, selectedStrategies, ihsgPrices, biRates]);

  return (
    <>
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-[15px] font-medium text-gray-900">DCA Comparison Lab</h1>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Bandingkan DCA vs Lump sum investasi historis IHSG
        </p>
      </div>
      <InputPanel
        monthlyAmount={monthlyAmount}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        maxDate={maxDate}
        onMonthlyAmountChange={setMonthlyAmount}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      {result && result.strategies.length > 0 ? (
        <>
          {/* ─── Export card: seluruh konten yang masuk ke PNG ─── */}
          <div id="compare-export-card" className="bg-canvas">
            <StrategyPicker selected={selectedStrategies} onChange={setSelectedStrategies} />
            {result.strategies.length >= 2 && <RankingRow result={result} />}
            <ComparisonChart result={result} />
            {/* Stats + strategy cards */}
            <div className="mx-6 mb-4 bg-canvas border border-black/[0.06] rounded-[12px] overflow-hidden">
              {(() => {
                const ref = result.strategies[0];
                if (!ref) return null;
                const months = ref.steps.length;
                const firstDate = parseISO(ref.steps[0]!.date);
                const lastDate = parseISO(ref.steps[ref.steps.length - 1]!.date);
                const periodLabel = `${format(firstDate, 'MMM yyyy')} – ${format(lastDate, 'MMM yyyy')}`;
                const totalInvested = ref.totalInvested.toLocaleString('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  notation: 'compact',
                  maximumFractionDigits: 1,
                });
                return (
                  <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-3 border-b border-black/[0.06]">
                    {[
                      { label: 'Bulan investasi', value: `${months} bln` },
                      { label: 'Periode', value: periodLabel },
                      { label: 'Total setoran', value: totalInvested },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold text-[#868685] mb-0.5">{label}</p>
                        <p className="text-[11px] font-semibold text-[#0e0f0c] leading-tight">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <ComparisonGrid result={result} />
            </div>
          </div>

          {/* ─── Di luar export: actions + AI ─── */}
          <div className="mx-6 mb-5 bg-canvas border border-black/[0.06] rounded-[12px] overflow-hidden">
            <CompareActionsBar />
            <AIAnalysisPanel result={result} standalone={false} />
          </div>
        </>
      ) : (
        <>
          <StrategyPicker selected={selectedStrategies} onChange={setSelectedStrategies} />
          <div className="mx-4 mb-4 p-4 rounded-xl bg-soft text-center text-[13px] text-gray-400">
            Pilih minimal 1 strategi untuk dibandingkan.
          </div>
        </>
      )}
      <CompareMethodologyAccordion />
      <Disclaimer />
      <Footer lastUpdated={lastUpdated} />
    </>
  );
}
