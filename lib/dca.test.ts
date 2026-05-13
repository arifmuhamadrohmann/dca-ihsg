import { describe, it, expect } from 'vitest';
import { simulateDCA } from './dca';
import type { MonthlyPrice } from './types';

const flat: MonthlyPrice[] = [
  { date: '2020-01-31', close: 1000 },
  { date: '2020-02-29', close: 1000 },
  { date: '2020-03-31', close: 1000 },
];

const rising: MonthlyPrice[] = [
  { date: '2020-01-31', close: 1000 },
  { date: '2020-02-29', close: 1500 },
  { date: '2020-03-31', close: 2000 },
];

describe('simulateDCA', () => {
  it('zero return when price is flat', () => {
    const result = simulateDCA({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: flat,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(3_000_000, 0);
    expect(result.returnPct).toBeCloseTo(0, 1);
    expect(result.monthsInvested).toBe(3);
    expect(result.periodLabel).toBe('3 bulan');
  });

  it('positive return when price rises', () => {
    const result = simulateDCA({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: rising,
    });
    expect(result.gain).toBeGreaterThan(0);
    expect(result.returnPct).toBeGreaterThan(0);
  });

  it('throws when monthlyAmount is zero', () => {
    expect(() =>
      simulateDCA({
        monthlyAmount: 0,
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-03-31'),
        prices: flat,
      })
    ).toThrow('monthlyAmount');
  });

  it('throws when endDate is before startDate', () => {
    expect(() =>
      simulateDCA({
        monthlyAmount: 1_000_000,
        startDate: new Date('2020-03-01'),
        endDate: new Date('2020-01-01'),
        prices: flat,
      })
    ).toThrow();
  });

  it('throws when no prices in range', () => {
    expect(() =>
      simulateDCA({
        monthlyAmount: 1_000_000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        prices: flat,
      })
    ).toThrow();
  });

  it('period label: 12 months = 1 tahun', () => {
    const twelveMonths: MonthlyPrice[] = Array.from({ length: 12 }, (_, i) => ({
      date: `2020-${String(i + 1).padStart(2, '0')}-28`,
      close: 1000,
    }));
    const result = simulateDCA({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-12-31'),
      prices: twelveMonths,
    });
    expect(result.periodLabel).toBe('1 tahun');
    expect(result.totalInvested).toBe(12_000_000);
  });
});
