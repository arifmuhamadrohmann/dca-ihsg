import { describe, it, expect } from 'vitest';
import { simulateLumpsumIHSG } from './lumpsum-ihsg';
import type { MonthlyPrice } from './types';

const flat: MonthlyPrice[] = [
  { date: '2020-01-31', close: 1000 },
  { date: '2020-02-29', close: 1000 },
  { date: '2020-03-31', close: 1000 },
];

const doubling: MonthlyPrice[] = [
  { date: '2020-01-31', close: 1000 },
  { date: '2020-02-29', close: 1500 },
  { date: '2020-03-31', close: 2000 },
];

const halving: MonthlyPrice[] = [
  { date: '2020-01-31', close: 1000 },
  { date: '2020-02-29', close: 750 },
  { date: '2020-03-31', close: 500 },
];

describe('simulateLumpsumIHSG', () => {
  it('return nol ketika harga flat', () => {
    const result = simulateLumpsumIHSG({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: flat,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(3_000_000, 0);
    expect(result.returnPct).toBeCloseTo(0, 1);
    expect(result.strategy).toBe('lumpsum-ihsg');
    expect(result.label).toBe('Lump sum IHSG');
  });

  it('nilai dua kali lipat ketika harga naik 2x', () => {
    const result = simulateLumpsumIHSG({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: doubling,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(6_000_000, 0);
    expect(result.returnPct).toBeCloseTo(100, 1);
  });

  it('rugi 50% ketika harga turun setengah', () => {
    const result = simulateLumpsumIHSG({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: halving,
    });
    expect(result.gain).toBeLessThan(0);
    expect(result.returnPct).toBeCloseTo(-50, 1);
  });

  it('steps.invested selalu sama dengan totalInvested (lump sum dari awal)', () => {
    const result = simulateLumpsumIHSG({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: flat,
    });
    expect(result.steps).toHaveLength(3);
    result.steps.forEach((s) => {
      expect(s.invested).toBe(result.totalInvested);
    });
  });

  it('throw ketika tidak ada data di range', () => {
    expect(() =>
      simulateLumpsumIHSG({
        monthlyAmount: 1_000_000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        prices: flat,
      })
    ).toThrow();
  });
});
