import type { ComparisonInput, ComparisonResult, Strategy, StrategyResult } from './types';
import { simulateDCA } from './dca';
import { simulateLumpsumIHSG } from './lumpsum-ihsg';
import { simulateDCADeposito } from './dca-deposito';
import { simulateLumpsumDeposito } from './lumpsum-deposito';

export function runComparison(input: ComparisonInput): ComparisonResult {
  const { monthlyAmount, startDate, endDate, strategies, ihsgPrices, biRates } = input;

  const results: StrategyResult[] = strategies.map((s): StrategyResult => {
    switch (s) {
      case 'dca-ihsg': {
        const r = simulateDCA({ monthlyAmount, startDate, endDate, prices: ihsgPrices });
        return {
          strategy: 'dca-ihsg' as Strategy,
          label: 'DCA IHSG',
          steps: r.steps.map((step) => ({
            date: step.date,
            value: step.portfolioValue,
            invested: step.cumulativeInvested,
          })),
          totalInvested: r.totalInvested,
          finalValue: r.finalValue,
          gain: r.gain,
          returnPct: r.returnPct,
          xirr: r.xirr,
        };
      }
      case 'lumpsum-ihsg':
        return simulateLumpsumIHSG({ monthlyAmount, startDate, endDate, prices: ihsgPrices });
      case 'dca-deposito':
        return simulateDCADeposito({ monthlyAmount, startDate, endDate, biRates });
      case 'lumpsum-deposito':
        return simulateLumpsumDeposito({ monthlyAmount, startDate, endDate, biRates });
    }
  });

  const sorted = [...results].sort((a, b) => b.finalValue - a.finalValue);

  return {
    input,
    strategies: results,
    winner: sorted[0]!.strategy,
    loser: sorted[sorted.length - 1]!.strategy,
  };
}
