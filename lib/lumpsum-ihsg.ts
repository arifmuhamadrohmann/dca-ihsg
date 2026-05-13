import xirr from 'xirr';
import { parseISO } from 'date-fns';
import type { MonthlyPrice, StrategyResult } from './types';

export function simulateLumpsumIHSG(input: {
  monthlyAmount: number;
  startDate: Date;
  endDate: Date;
  prices: MonthlyPrice[];
}): StrategyResult {
  const { monthlyAmount, startDate, endDate, prices } = input;

  const filtered = prices.filter((p) => {
    const d = parseISO(p.date);
    return d >= startDate && d <= endDate;
  });

  if (filtered.length === 0) throw new Error('Tidak ada data harga di rentang ini');

  const months = filtered.length;
  const totalInvested = monthlyAmount * months;
  const startPrice = filtered[0]!.close;
  const units = totalInvested / startPrice;

  const steps = filtered.map((p) => ({
    date: p.date,
    invested: totalInvested,
    value: units * p.close,
  }));

  const finalValue = units * filtered[filtered.length - 1]!.close;
  const gain = finalValue - totalInvested;
  const returnPct = (gain / totalInvested) * 100;

  let xirrValue = returnPct;
  try {
    xirrValue =
      xirr([
        { amount: -totalInvested, when: parseISO(filtered[0]!.date) },
        { amount: finalValue, when: parseISO(filtered[filtered.length - 1]!.date) },
      ]) * 100;
  } catch {
    // XIRR gagal konvergen untuk periode pendek/flat; fallback ke simple return
  }

  return {
    strategy: 'lumpsum-ihsg',
    label: 'Lump sum IHSG',
    steps,
    totalInvested,
    finalValue,
    gain,
    returnPct,
    xirr: xirrValue,
  };
}
