'use client';

import { useMemo, useState } from 'react';
import { parseISO, format } from 'date-fns';
import { simulateDCA } from '@/lib/dca';
import { CRISIS_MARKERS } from '@/lib/crisis-markers';
import type { MonthlyPrice, DCAResult } from '@/lib/types';
import InputPanel from './InputPanel';
import SummaryCard from './SummaryCard';
import PortfolioChart from './PortfolioChart';
import ActionsBar from './ActionsBar';
import AIInsight from './AIInsight';
import MethodologyAccordion from './MethodologyAccordion';
import Disclaimer from './Disclaimer';
import Footer from './Footer';

type DCASimulatorProps = {
  prices: MonthlyPrice[];
  lastUpdated: string;
};

export default function DCASimulator({ prices, lastUpdated }: DCASimulatorProps) {
  const minDate = parseISO(prices[0]!.date);
  const maxDate = parseISO(prices[prices.length - 1]!.date);

  const [monthlyAmount, setMonthlyAmount] = useState(1_000_000);
  const [startDate, setStartDate] = useState(new Date('2010-01-01'));
  const [endDate, setEndDate] = useState<Date | null>(null);

  const effectiveEnd = endDate ?? maxDate;

  const result = useMemo<DCAResult | null>(() => {
    try {
      return simulateDCA({ monthlyAmount, startDate, endDate: effectiveEnd, prices });
    } catch {
      return null;
    }
  }, [monthlyAmount, startDate, effectiveEnd, prices]);

  const visibleCrises = useMemo(() => {
    const firstDate = format(startDate, 'yyyy-MM-dd');
    const lastDate = format(effectiveEnd, 'yyyy-MM-dd');
    return CRISIS_MARKERS.filter((c) => c.startDate >= firstDate && c.startDate <= lastDate);
  }, [startDate, effectiveEnd]);

  return (
    <>
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
      {result ? (
        <>
          <div id="export-card" className="bg-card">
            <SummaryCard result={result} monthlyAmount={monthlyAmount} />
            <PortfolioChart steps={result.steps} />
          </div>
          <ActionsBar />
          <AIInsight
            result={result}
            startDate={startDate}
            endDate={effectiveEnd}
            visibleCrises={visibleCrises}
          />
        </>
      ) : (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-soft text-center text-[13px] text-gray-400">
          Tidak ada data untuk rentang tanggal ini.
        </div>
      )}
      <MethodologyAccordion />
      <Disclaimer />
      <Footer lastUpdated={lastUpdated} />
    </>
  );
}
