import { formatRupiah, formatPercent, formatXIRR } from '@/lib/format';
import type { DCAResult } from '@/lib/types';

type SummaryCardProps = {
  result: DCAResult;
  monthlyAmount: number;
};

export default function SummaryCard({ result, monthlyAmount }: SummaryCardProps) {
  const isPositive = result.gain >= 0;

  return (
    <div
      id="share-card"
      className={`mx-6 mb-5 p-5 rounded-[12px] ${isPositive ? 'bg-[#e2f6d5]' : 'bg-[#320707]'}`}
    >
      <p
        className={`text-[12px] font-semibold mb-1 ${isPositive ? 'text-[#054d28]' : 'text-[#868685]'}`}
      >
        Nilai portofolio
      </p>
      <p
        className={`text-[28px] font-bold tracking-tight ${isPositive ? 'text-[#0e0f0c]' : 'text-[#e8ebe6]'}`}
      >
        {formatRupiah(result.finalValue, { compact: true })}
      </p>
      <p
        className={`text-[14px] font-semibold mt-0.5 ${isPositive ? 'text-[#054d28]' : 'text-[#d03238]'}`}
      >
        {result.gain >= 0 ? '+' : ''}
        {formatRupiah(result.gain, { compact: true })} ({formatPercent(result.returnPct)})
      </p>

      <div
        className={`mt-4 pt-4 border-t ${isPositive ? 'border-[#9fe870]/40' : 'border-white/10'}`}
      >
        {/* Nominal — full width highlight row */}
        <div className="mb-3">
          <p className={`text-[11px] font-semibold ${isPositive ? 'text-[#054d28]' : 'text-[#868685]'}`}>
            Nominal / bulan
          </p>
          <p className={`text-[14px] font-semibold mt-0.5 ${isPositive ? 'text-[#0e0f0c]' : 'text-[#e8ebe6]'}`}>
            {formatRupiah(monthlyAmount, { compact: true })}
          </p>
        </div>
        {/* Other stats — 2 column grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total setoran', value: formatRupiah(result.totalInvested, { compact: true }) },
            { label: 'XIRR', value: formatXIRR(result.xirr) },
            { label: 'Bulan investasi', value: `${result.monthsInvested} bulan` },
            { label: 'Periode', value: result.periodLabel },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className={`text-[11px] font-semibold ${isPositive ? 'text-[#054d28]' : 'text-[#868685]'}`}>
                {label}
              </p>
              <p className={`text-[14px] font-semibold mt-0.5 ${isPositive ? 'text-[#0e0f0c]' : 'text-[#e8ebe6]'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
