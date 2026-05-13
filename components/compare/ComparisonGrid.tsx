import type { ComparisonResult } from '@/lib/types';
import { STRATEGY_CONFIG } from './StrategyPicker';
import { formatRupiah } from '@/lib/format';

type ComparisonGridProps = {
  result: ComparisonResult;
};

export default function ComparisonGrid({ result }: ComparisonGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {result.strategies.map((s) => {
        const config = STRATEGY_CONFIG[s.strategy];
        const isWinner = s.strategy === result.winner;
        return (
          <div
            key={s.strategy}
            className="p-4 rounded-[20px] bg-[#f7f8f6] border border-black/[0.07] relative overflow-hidden"
            style={{ borderLeftWidth: 3, borderLeftColor: config.color }}
          >
            {isWinner && (
              <span className="absolute top-2 right-2 text-[9px] px-2 py-0.5 rounded-full bg-[#9fe870] text-[#0e0f0c] font-semibold">
                terbaik
              </span>
            )}
            <div className="text-[11px] text-[#868685] mb-0.5">{s.label}</div>
            <div className="text-[16px] font-bold text-[#0e0f0c]">
              {formatRupiah(s.finalValue, { compact: true })}
            </div>
            <div className="text-[11px] text-[#868685] mt-0.5">
              +{s.returnPct.toFixed(1)}% · XIRR {s.xirr.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
