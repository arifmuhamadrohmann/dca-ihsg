'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { CRISIS_MARKERS } from '@/lib/crisis-markers';
import { formatRupiah } from '@/lib/format';
import type { DCAStep } from '@/lib/types';

type PortfolioChartProps = {
  steps: DCAStep[];
};

function pickTicks(steps: DCAStep[]): string[] {
  const byYear = new Map<string, string>();
  for (const s of steps) {
    const year = s.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, s.date);
  }
  const allYears = Array.from(byYear.keys());
  const step = Math.max(1, Math.ceil(allYears.length / 7));
  return allYears.filter((_, i) => i % step === 0).map((y) => byYear.get(y)!);
}

export default function PortfolioChart({ steps }: PortfolioChartProps) {
  if (steps.length === 0) return null;

  const data = steps.map((s) => ({
    date: s.date,
    portfolioValue: Math.round(s.portfolioValue),
    cumulativeInvested: Math.round(s.cumulativeInvested),
  }));

  const firstDate = steps[0]!.date;
  const lastDate = steps[steps.length - 1]!.date;
  const visibleCrises = CRISIS_MARKERS.filter(
    (c) => c.startDate >= firstDate && c.startDate <= lastDate
  );
  const ticks = pickTicks(steps);
  const maxVal = Math.max(...data.map((d) => d.portfolioValue));

  return (
    <div className="mx-4 mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[12px] text-gray-500">Pertumbuhan portofolio</span>
        <span className="text-[10px] text-gray-400">Nilai vs Setoran</span>
      </div>
      <div className="bg-soft rounded-lg py-2 pr-2" style={{ height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              ticks={ticks}
              tickFormatter={(d: string) => `'${d.slice(2, 4)}`}
              tick={{ fontSize: 9, fill: '#888780' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => formatRupiah(v, { compact: true })}
              tick={{ fontSize: 9, fill: '#888780' }}
              axisLine={false}
              tickLine={false}
              width={52}
              domain={[0, Math.round(maxVal * 1.1)]}
            />
            <Tooltip
              formatter={(v, name) => [
                formatRupiah(Number(v), { compact: true }),
                name === 'portfolioValue' ? 'Nilai portofolio' : 'Total setoran',
              ]}
              labelFormatter={(l) => String(l).slice(0, 7)}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '0.5px solid #e5e7eb' }}
            />
            {visibleCrises.map((c) => (
              <ReferenceLine
                key={c.year}
                x={c.startDate}
                stroke="#E24B4A"
                strokeWidth={0.5}
                strokeDasharray="3 2"
                opacity={0.7}
                label={{ value: `'${String(c.year).slice(2)}`, position: 'insideTopRight', fontSize: 8, fill: '#A32D2D' }}
              />
            ))}
            <Line type="monotone" dataKey="portfolioValue" stroke="#1D9E75" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="cumulativeInvested" stroke="#888780" strokeWidth={1.5} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-2">
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="inline-block w-3.5 h-0.5 bg-brand-success rounded" />
          Nilai portofolio
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
          <span className="inline-block w-3.5 border-t border-dashed border-gray-400" />
          Total setoran
        </span>
      </div>
    </div>
  );
}
