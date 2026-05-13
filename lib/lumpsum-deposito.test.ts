import { describe, it, expect } from 'vitest';
import { simulateLumpsumDeposito } from './lumpsum-deposito';
import type { BIRate } from './types';

const zeroRate: BIRate[] = [
  { date: '2020-01-31', rate: 0 },
  { date: '2020-02-29', rate: 0 },
  { date: '2020-03-31', rate: 0 },
];

const constantRate: BIRate[] = [
  { date: '2020-01-31', rate: 12 }, // 1% per bulan
  { date: '2020-02-29', rate: 12 },
  { date: '2020-03-31', rate: 12 },
];

describe('simulateLumpsumDeposito', () => {
  it('tidak ada pertumbuhan ketika rate 0%', () => {
    const result = simulateLumpsumDeposito({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      biRates: zeroRate,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(3_000_000, 0);
    expect(result.gain).toBeCloseTo(0, 0);
    expect(result.strategy).toBe('lumpsum-deposito');
    expect(result.label).toBe('Lump sum Deposito');
  });

  it('compound benar pada rate konstan 12% per tahun', () => {
    // totalInvested = 3jt (deposit penuh di awal)
    // Bulan 1: 3.000.000 (belum ada compound di bulan pertama)
    // Bulan 2: 3.000.000 * 1.01 = 3.030.000
    // Bulan 3: 3.030.000 * 1.01 = 3.060.300
    const result = simulateLumpsumDeposito({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      biRates: constantRate,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(3_060_300, -1);
    expect(result.gain).toBeGreaterThan(0);
  });

  it('steps.invested selalu sama dengan totalInvested', () => {
    const result = simulateLumpsumDeposito({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      biRates: zeroRate,
    });
    result.steps.forEach((s) => {
      expect(s.invested).toBe(3_000_000);
    });
  });

  it('throw ketika tidak ada data di range', () => {
    expect(() =>
      simulateLumpsumDeposito({
        monthlyAmount: 1_000_000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        biRates: zeroRate,
      })
    ).toThrow();
  });
});
