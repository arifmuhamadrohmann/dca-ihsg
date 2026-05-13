'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { CRISIS_MARKERS } from '@/lib/crisis-markers';
import { formatRupiah, formatYAxis } from '@/lib/format';
import type { ComparisonResult, Strategy } from '@/lib/types';
import { STRATEGY_CONFIG } from './StrategyPicker';

type ComparisonChartProps = {
  result: ComparisonResult;
};

const SHORT_NAMES: Record<number, string> = {
  1998: 'Krismon',
  2008: 'GFC',
  2013: 'Taper',
  2015: 'Bear IDR',
  2020: 'COVID',
};

interface CrisisLabelProps {
  viewBox?: { x: number; y: number; width: number; height: number };
  year: number;
}

function CrisisLabel({ viewBox, year }: CrisisLabelProps) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <g>
      <text x={x + 3} y={y + 13} fontSize={8} fill="#A32D2D" fontWeight="600">
        &apos;{String(year).slice(2)}
      </text>
      <text x={x + 3} y={y + 23} fontSize={7} fill="#A32D2D" opacity={0.85}>
        {SHORT_NAMES[year] ?? String(year)}
      </text>
    </g>
  );
}

function pickTicks(dates: string[]): string[] {
  const byYear = new Map<string, string>();
  for (const d of dates) {
    const year = d.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, d);
  }
  const allYears = Array.from(byYear.keys());
  const step = Math.max(1, Math.ceil(allYears.length / 7));
  return allYears.filter((_, i) => i % step === 0).map((y) => byYear.get(y)!);
}

export default function ComparisonChart({ result }: ComparisonChartProps) {
  if (result.strategies.length === 0) return null;

  const refStrategy =
    result.strategies.find((s) => s.strategy === 'dca-ihsg') ?? result.strategies[0]!;

  const strategyMap = new Map(result.strategies.map((s) => [s.strategy, s]));
  const data = refStrategy.steps.map((step) => {
    const row: Record<string, number | string> = {
      date: step.date,
      invested: Math.round(step.invested),
    };
    for (const [key, stratResult] of strategyMap) {
      const match = stratResult.steps.find((s) => s.date === step.date);
      if (match) row[key] = Math.round(match.value);
    }
    return row;
  });

  const firstDate = refStrategy.steps[0]!.date;
  const lastDate = refStrategy.steps[refStrategy.steps.length - 1]!.date;
  const visibleCrises = CRISIS_MARKERS.filter(
    (c) => c.startDate >= firstDate && c.startDate <= lastDate
  );
  const ticks = pickTicks(refStrategy.steps.map((s) => s.date));
  const maxVal = Math.max(...result.strategies.flatMap((s) => s.steps.map((step) => step.value)));
  const selectedStrategies = result.strategies.map((s) => s.strategy);

  return (
    <div className="mx-4 mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[12px] text-gray-500">Pertumbuhan portofolio</span>
        <span className="text-[10px] text-gray-400">
          {firstDate.slice(0, 7)} — {lastDate.slice(0, 7)}
        </span>
      </div>
      <div className="bg-soft rounded-lg py-2 pr-2" style={{ height: 200 }}>
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
              tickFormatter={(v: number) => formatYAxis(v)}
              tick={{ fontSize: 9, fill: '#888780' }}
              axisLine={false}
              tickLine={false}
              width={58}
              domain={[0, Math.round(maxVal * 1.1)]}
            />
            <Tooltip
              formatter={(v, name) => [
                formatRupiah(Number(v), { compact: true }),
                name === 'invested'
                  ? 'Total setoran'
                  : (STRATEGY_CONFIG[name as Strategy]?.label ?? String(name)),
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
                label={<CrisisLabel year={c.year} />}
              />
            ))}
            <Line
              type="monotone"
              dataKey="invested"
              stroke="#888780"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
              name="invested"
            />
            {selectedStrategies.map((strategy) => (
              <Line
                key={strategy}
                type="monotone"
                dataKey={strategy}
                stroke={STRATEGY_CONFIG[strategy].color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                name={strategy}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {selectedStrategies.map((strategy) => (
          <span key={strategy} className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span
              className="inline-block w-3 h-0.5 rounded"
              style={{ backgroundColor: STRATEGY_CONFIG[strategy].color }}
            />
            {STRATEGY_CONFIG[strategy].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span className="inline-block w-3 border-t border-dashed border-gray-400" />
          Total setoran
        </span>
        {visibleCrises.length > 0 && (
          <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <svg width="10" height="14" viewBox="0 0 2 14" aria-hidden="true">
              <line
                x1="1"
                y1="0"
                x2="1"
                y2="14"
                stroke="#E24B4A"
                strokeWidth="1.5"
                strokeDasharray="3 2"
                strokeOpacity="0.7"
              />
            </svg>
            Krisis ({visibleCrises.map((c) => `'${String(c.year).slice(2)}`).join(', ')})
          </span>
        )}
      </div>
    </div>
  );
}
