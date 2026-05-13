import xirr from 'xirr';
import { parseISO } from 'date-fns';
import type { BIRate, StrategyResult } from './types';

export function simulateLumpsumDeposito(input: {
  monthlyAmount: number;
  startDate: Date;
  endDate: Date;
  biRates: BIRate[];
}): StrategyResult {
  const { monthlyAmount, startDate, endDate, biRates } = input;

  const filtered = biRates.filter((r) => {
    const d = parseISO(r.date);
    return d >= startDate && d <= endDate;
  });

  if (filtered.length === 0) throw new Error('Tidak ada data BI Rate di rentang ini');

  const months = filtered.length;
  const totalInvested = monthlyAmount * months;
  let balance = totalInvested; // deposit penuh di awal

  const steps = filtered.map((r, i) => {
    if (i > 0) {
      const monthlyRate = r.rate / 100 / 12;
      balance = balance * (1 + monthlyRate);
    }
    return { date: r.date, invested: totalInvested, value: balance };
  });

  const gain = balance - totalInvested;
  const returnPct = (gain / totalInvested) * 100;

  let xirrValue = returnPct;
  try {
    xirrValue =
      xirr([
        { amount: -totalInvested, when: parseISO(filtered[0]!.date) },
        { amount: balance, when: parseISO(filtered[filtered.length - 1]!.date) },
      ]) * 100;
  } catch {
    // XIRR gagal konvergen — fallback
  }

  return {
    strategy: 'lumpsum-deposito',
    label: 'Lump sum Deposito',
    steps,
    totalInvested,
    finalValue: balance,
    gain,
    returnPct,
    xirr: xirrValue,
  };
}
