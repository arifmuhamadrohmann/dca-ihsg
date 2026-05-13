import { formatRupiah, formatPercent, formatXIRR } from '@/lib/format';
import type { DCAResult } from '@/lib/types';

type SummaryCardProps = {
  result: DCAResult;
};

export default function SummaryCard({ result }: SummaryCardProps) {
  const isPositive = result.gain >= 0;
  const bg = isPositive ? 'bg-brand-success-bg' : 'bg-brand-danger-bg';
  const label = isPositive ? 'text-brand-success-label' : 'text-brand-danger-text';
  const value = isPositive ? 'text-brand-success-text' : 'text-brand-danger-text';
  const border = isPositive ? 'border-brand-success-border' : 'border-brand-danger/30';

  return (
    <div id="share-card" className={`mx-4 mb-4 p-4 rounded-xl ${bg}`}>
      <p className={`text-[11px] ${label} mb-0.5`}>Nilai portofolio sekarang</p>
      <p className={`text-2xl font-medium ${value}`}>
        {formatRupiah(result.finalValue, { compact: true })}
      </p>
      <p className={`text-[13px] ${label} mt-0.5`}>
        {result.gain >= 0 ? '+' : ''}
        {formatRupiah(result.gain, { compact: true })} ({formatPercent(result.returnPct)})
      </p>

      <div className={`grid grid-cols-2 gap-2 mt-3 pt-3 border-t ${border}`}>
        <div>
          <p className={`text-[10px] ${label}`}>Total setoran</p>
          <p className={`text-[13px] font-medium ${value}`}>
            {formatRupiah(result.totalInvested, { compact: true })}
          </p>
        </div>
        <div>
          <p className={`text-[10px] ${label}`}>XIRR</p>
          <p className={`text-[13px] font-medium ${value}`}>{formatXIRR(result.xirr)}</p>
        </div>
        <div>
          <p className={`text-[10px] ${label}`}>Bulan investasi</p>
          <p className={`text-[13px] font-medium ${value}`}>{result.monthsInvested} bulan</p>
        </div>
        <div>
          <p className={`text-[10px] ${label}`}>Periode</p>
          <p className={`text-[13px] font-medium ${value}`}>{result.periodLabel}</p>
        </div>
      </div>
    </div>
  );
}
