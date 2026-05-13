import { describe, it, expect } from 'vitest';
import { simulateDCADeposito } from './dca-deposito';
import type { BIRate } from './types';

const zeroRate: BIRate[] = [
  { date: '2020-01-31', rate: 0 },
  { date: '2020-02-29', rate: 0 },
  { date: '2020-03-31', rate: 0 },
];

const constantRate: BIRate[] = [
  { date: '2020-01-31', rate: 12 }, // 12% / 12 = 1% per bulan
  { date: '2020-02-29', rate: 12 },
  { date: '2020-03-31', rate: 12 },
];

const variableRate: BIRate[] = [
  { date: '2020-01-31', rate: 6.0 },
  { date: '2020-02-29', rate: 5.5 },
  { date: '2020-03-31', rate: 5.0 },
];

describe('simulateDCADeposito', () => {
  it('tidak ada bunga ketika rate 0%', () => {
    const result = simulateDCADeposito({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      biRates: zeroRate,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(3_000_000, 0);
    expect(result.gain).toBeCloseTo(0, 0);
    expect(result.strategy).toBe('dca-deposito');
    expect(result.label).toBe('DCA Deposito');
  });

  it('compound benar pada rate konstan 12% per tahun (1% per bulan)', () => {
    // Bulan 1: 0 * 1.01 + 1.000.000 = 1.000.000
    // Bulan 2: 1.000.000 * 1.01 + 1.000.000 = 2.010.000
    // Bulan 3: 2.010.000 * 1.01 + 1.000.000 = 3.030.100
    const result = simulateDCADeposito({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      biRates: constantRate,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(3_030_100, -1);
    expect(result.gain).toBeGreaterThan(0);
  });

  it('steps.invested bertambah setiap bulan', () => {
    const result = simulateDCADeposito({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      biRates: variableRate,
    });
    expect(result.steps).toHaveLength(3);
    expect(result.steps[0]!.invested).toBe(1_000_000);
    expect(result.steps[1]!.invested).toBe(2_000_000);
    expect(result.steps[2]!.invested).toBe(3_000_000);
  });

  it('throw ketika tidak ada data di range', () => {
    expect(() =>
      simulateDCADeposito({
        monthlyAmount: 1_000_000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        biRates: zeroRate,
      })
    ).toThrow();
  });
});
