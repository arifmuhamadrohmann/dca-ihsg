import { describe, it, expect } from 'vitest';
import { runComparison } from './compare';
import type { MonthlyPrice, BIRate, ComparisonInput } from './types';

const prices: MonthlyPrice[] = [
  { date: '2020-01-31', close: 1000 },
  { date: '2020-02-29', close: 1100 },
  { date: '2020-03-31', close: 1200 },
];

const biRates: BIRate[] = [
  { date: '2020-01-31', rate: 6.0 },
  { date: '2020-02-29', rate: 6.0 },
  { date: '2020-03-31', rate: 6.0 },
];

const baseInput: ComparisonInput = {
  monthlyAmount: 1_000_000,
  startDate: new Date('2020-01-01'),
  endDate: new Date('2020-03-31'),
  strategies: ['dca-ihsg', 'lumpsum-ihsg'],
  ihsgPrices: prices,
  biRates,
};

describe('runComparison', () => {
  it('hanya jalankan strategi yang dipilih', () => {
    const result = runComparison(baseInput);
    expect(result.strategies).toHaveLength(2);
    const keys = result.strategies.map((s) => s.strategy);
    expect(keys).toContain('dca-ihsg');
    expect(keys).toContain('lumpsum-ihsg');
    expect(keys).not.toContain('dca-deposito');
  });

  it('winner memiliki finalValue tertinggi', () => {
    const result = runComparison(baseInput);
    const winner = result.strategies.find((s) => s.strategy === result.winner)!;
    result.strategies
      .filter((s) => s.strategy !== result.winner)
      .forEach((other) => {
        expect(winner.finalValue).toBeGreaterThanOrEqual(other.finalValue);
      });
  });

  it('loser memiliki finalValue terendah', () => {
    const result = runComparison(baseInput);
    const loser = result.strategies.find((s) => s.strategy === result.loser)!;
    result.strategies
      .filter((s) => s.strategy !== result.loser)
      .forEach((other) => {
        expect(loser.finalValue).toBeLessThanOrEqual(other.finalValue);
      });
  });

  it('semua 4 strategi berjalan ketika semuanya dipilih', () => {
    const result = runComparison({
      ...baseInput,
      strategies: ['dca-ihsg', 'lumpsum-ihsg', 'dca-deposito', 'lumpsum-deposito'],
    });
    expect(result.strategies).toHaveLength(4);
  });

  it('setiap StrategyResult memiliki shape yang konsisten', () => {
    const result = runComparison(baseInput);
    for (const s of result.strategies) {
      expect(typeof s.totalInvested).toBe('number');
      expect(typeof s.finalValue).toBe('number');
      expect(typeof s.gain).toBe('number');
      expect(typeof s.returnPct).toBe('number');
      expect(typeof s.xirr).toBe('number');
      expect(Array.isArray(s.steps)).toBe(true);
      expect(s.steps.length).toBeGreaterThan(0);
    }
  });
});
