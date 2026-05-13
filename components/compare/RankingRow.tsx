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
    <div className="mx-6 mb-4 px-4 py-3 bg-[#e2f6d5] rounded-[16px] text-[12px]">
      <span className="font-semibold text-[#054d28]">Pemenang: {winner.label}</span>
      {' · '}
      <span className="text-[#0e0f0c]">
        +{winner.returnPct.toFixed(0)}% · {formatRupiah(winner.finalValue, { compact: true })}
      </span>
      <br />
      <span className="text-[#868685]">
        Terendah: {loser.label} · +{loser.returnPct.toFixed(0)}% ·{' '}
        {formatRupiah(loser.finalValue, { compact: true })}
      </span>
    </div>
  );
}
