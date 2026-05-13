import pricesData from '@/public/data/jkse-monthly.json';
import biRateData from '@/public/data/bi-rate-monthly.json';
import type { MonthlyPrice, BIRate } from '@/lib/types';
import Header from '@/components/Header';
import CompareSimulator from '@/components/compare/CompareSimulator';

export const metadata = {
  title: 'DCA Comparison Lab — IHSG vs Deposito',
  description:
    'Bandingkan 4 strategi investasi: DCA IHSG, Lump sum IHSG, DCA Deposito, Lump sum Deposito',
};

export default function ComparePage() {
  const ihsgPrices = pricesData as MonthlyPrice[];
  const biRates = biRateData as BIRate[];
  const lastUpdated = ihsgPrices.at(-1)?.date ?? '';

  return (
    <div className="bg-page min-h-screen">
      <div className="max-w-[480px] mx-auto bg-card min-h-screen shadow-sm">
        <Header />
        <CompareSimulator ihsgPrices={ihsgPrices} biRates={biRates} lastUpdated={lastUpdated} />
      </div>
    </div>
  );
}
