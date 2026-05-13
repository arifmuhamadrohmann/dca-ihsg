import xirr from 'xirr';
import { parseISO } from 'date-fns';
import type { BIRate, StrategyResult } from './types';

export function simulateDCADeposito(input: {
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

  let balance = 0;
  let totalInvested = 0;
  const cashflows: { amount: number; when: Date }[] = [];

  const steps = filtered.map((r) => {
    const monthlyRate = r.rate / 100 / 12;
    balance = balance * (1 + monthlyRate) + monthlyAmount;
    totalInvested += monthlyAmount;
    cashflows.push({ amount: -monthlyAmount, when: parseISO(r.date) });
    return { date: r.date, invested: totalInvested, value: balance };
  });

  const gain = balance - totalInvested;
  const returnPct = (gain / totalInvested) * 100;

  let xirrValue = returnPct;
  try {
    xirrValue =
      xirr([
        ...cashflows,
        { amount: balance, when: parseISO(filtered[filtered.length - 1]!.date) },
      ]) * 100;
  } catch {
    // XIRR gagal konvergen — fallback ke simple return
  }

  return {
    strategy: 'dca-deposito',
    label: 'DCA Deposito',
    steps,
    totalInvested,
    finalValue: balance,
    gain,
    returnPct,
    xirr: xirrValue,
  };
}
