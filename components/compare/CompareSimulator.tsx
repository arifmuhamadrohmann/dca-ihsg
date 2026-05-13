'use client';

import { useMemo, useState } from 'react';
import { parseISO } from 'date-fns';
import { runComparison } from '@/lib/compare';
import type { MonthlyPrice, BIRate, Strategy } from '@/lib/types';
import InputPanel from '@/components/InputPanel';
import StrategyPicker from './StrategyPicker';
import RankingRow from './RankingRow';
import ComparisonChart from './ComparisonChart';
import ComparisonGrid from './ComparisonGrid';
import CompareActionsBar from './CompareActionsBar';
import AIAnalysisPanel from './AIAnalysisPanel';
import MethodologyAccordion from '@/components/MethodologyAccordion';
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
          Bandingkan 4 strategi investasi historis IHSG vs Deposito
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
      <StrategyPicker selected={selectedStrategies} onChange={setSelectedStrategies} />
      {result && result.strategies.length > 0 ? (
        <>
          {result.strategies.length >= 2 && <RankingRow result={result} />}
          <div id="compare-export-card" className="bg-card">
            <ComparisonChart result={result} />
            <ComparisonGrid result={result} />
          </div>
          <CompareActionsBar />
          <AIAnalysisPanel result={result} />
        </>
      ) : (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-soft text-center text-[13px] text-gray-400">
          Pilih minimal 1 strategi untuk dibandingkan.
        </div>
      )}
      <MethodologyAccordion />
      <Disclaimer />
      <Footer lastUpdated={lastUpdated} />
    </>
  );
}
