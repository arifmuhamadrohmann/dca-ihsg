import type { ComparisonResult } from '@/lib/types';
import { STRATEGY_CONFIG } from './StrategyPicker';
import { formatRupiah } from '@/lib/format';

type RankingRowProps = {
  result: ComparisonResult;
};

export default function RankingRow({ result }: RankingRowProps) {
  if (result.strategies.length < 2) return null;

  const winner = result.strategies.find((s) => s.strategy === result.winner);
  const loser = result.strategies.find((s) => s.strategy === result.loser);
  if (!winner || !loser) return null;

  return (
    <div className="mx-4 mb-3 px-3 py-2.5 rounded-lg border border-black/[0.08] text-[12px]">
      <span className="font-medium" style={{ color: STRATEGY_CONFIG[winner.strategy].color }}>
        Pemenang: {winner.label}
      </span>
      {' · '}
      <span className="text-gray-700">
        +{winner.returnPct.toFixed(0)}% · {formatRupiah(winner.finalValue, { compact: true })}
      </span>
      <br />
      <span className="text-gray-400">
        Terendah: {loser.label} · +{loser.returnPct.toFixed(0)}% ·{' '}
        {formatRupiah(loser.finalValue, { compact: true })}
      </span>
    </div>
  );
}
