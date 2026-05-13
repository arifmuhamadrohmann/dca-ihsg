import type { ComparisonResult } from '@/lib/types';
import { STRATEGY_CONFIG } from './StrategyPicker';
import { formatRupiah } from '@/lib/format';

type ComparisonGridProps = {
  result: ComparisonResult;
};

export default function ComparisonGrid({ result }: ComparisonGridProps) {
  return (
    <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
      {result.strategies.map((s) => {
        const config = STRATEGY_CONFIG[s.strategy];
        const isWinner = s.strategy === result.winner;
        return (
          <div
            key={s.strategy}
            className="p-3 rounded-lg border border-black/[0.08] bg-card relative overflow-hidden"
            style={{ borderLeftWidth: 3, borderLeftColor: config.color }}
          >
            {isWinner && (
              <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-soft text-gray-400">
                terbaik
              </span>
            )}
            <div className="text-[10px] text-gray-400 mb-0.5">{s.label}</div>
            <div className="text-[15px] font-medium text-gray-900">
              {formatRupiah(s.finalValue, { compact: true })}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">
              +{s.returnPct.toFixed(1)}% · XIRR {s.xirr.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
