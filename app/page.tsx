import pricesData from '@/public/data/jkse-monthly.json';
import type { MonthlyPrice } from '@/lib/types';
import Header from '@/components/Header';
import DCASimulator from '@/components/DCASimulator';

export default function Home() {
  const prices = pricesData as MonthlyPrice[];
  const lastUpdated = prices.at(-1)?.date ?? '';

  return (
    <div className="bg-page min-h-screen">
      <div className="max-w-[480px] mx-auto bg-card min-h-screen shadow-sm">
        <Header />
        <DCASimulator prices={prices} lastUpdated={lastUpdated} />
      </div>
    </div>
  );
}
