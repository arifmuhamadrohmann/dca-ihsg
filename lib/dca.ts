import xirr from 'xirr';
import { parseISO } from 'date-fns';
import type { DCAInput, DCAResult, DCAStep } from './types';

export function simulateDCA(input: DCAInput): DCAResult {
  const { monthlyAmount, startDate, endDate, prices } = input;

  if (monthlyAmount <= 0) throw new Error('monthlyAmount harus > 0');
  if (endDate < startDate) throw new Error('endDate harus setelah startDate');

  const filtered = prices.filter((p) => {
    const d = parseISO(p.date);
    return d >= startDate && d <= endDate;
  });

  if (filtered.length === 0) throw new Error('Tidak ada data harga di rentang ini');

  let cumulativeInvested = 0;
  let cumulativeUnits = 0;

  const steps: DCAStep[] = filtered.map((p) => {
    const units = monthlyAmount / p.close;
    cumulativeInvested += monthlyAmount;
    cumulativeUnits += units;
    return {
      date: p.date,
      amountInvested: monthlyAmount,
      cumulativeInvested,
      unitsBought: units,
      cumulativeUnits,
      portfolioValue: cumulativeUnits * p.close,
    };
  });

  const lastPrice = filtered[filtered.length - 1]!.close;
  const lastDate = filtered[filtered.length - 1]!.date;
  const finalValue = cumulativeUnits * lastPrice;
  const totalInvested = cumulativeInvested;
  const gain = finalValue - totalInvested;
  const returnPct = (gain / totalInvested) * 100;

  let xirrValue = returnPct;
  try {
    const cashflows = [
      ...filtered.map((p) => ({ amount: -monthlyAmount, when: parseISO(p.date) })),
      { amount: finalValue, when: parseISO(lastDate) },
    ];
    xirrValue = xirr(cashflows) * 100;
  } catch {
    // XIRR may fail to converge for very short periods; fall back to simple return
  }

  return {
    steps,
    totalInvested,
    finalValue,
    gain,
    returnPct,
    xirr: xirrValue,
    monthsInvested: filtered.length,
    periodLabel: formatPeriod(filtered.length),
  };
}

function formatPeriod(months: number): string {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years === 0) return `${months} bulan`;
  if (remainder === 0) return `${years} tahun`;
  return `${years} tahun ${remainder} bulan`;
}
