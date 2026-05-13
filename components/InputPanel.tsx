'use client';

import { useState, useEffect } from 'react';

function formatRibu(n: number): string {
  return n.toLocaleString('id-ID');
}

type InputPanelProps = {
  monthlyAmount: number;
  startDate: Date;
  endDate: Date | null;
  minDate: Date;
  maxDate: Date;
  onMonthlyAmountChange: (value: number) => void;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date | null) => void;
};

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function MonthYearPicker({
  value,
  min,
  max,
  onChange,
}: {
  value: Date;
  min: Date;
  max: Date;
  onChange: (date: Date) => void;
}) {
  const minYear = min.getFullYear();
  const maxYear = max.getFullYear();
  const curYear = value.getFullYear();
  const curMonth = value.getMonth();
  const minMonth = curYear === minYear ? min.getMonth() : 0;
  const maxMonth = curYear === maxYear ? max.getMonth() : 11;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  return (
    <div className="flex gap-1">
      <select
        value={curMonth}
        onChange={(e) => onChange(new Date(curYear, parseInt(e.target.value, 10), 1))}
        className="min-w-0 flex-1 px-2 py-2.5 bg-[#e8ebe6] rounded-[12px] text-[12px] font-medium text-[#0e0f0c] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#9fe870]/60 focus:border-[#9fe870]"
      >
        {MONTHS.map((label, i) => (
          <option key={i} value={i} disabled={i < minMonth || i > maxMonth}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={curYear}
        onChange={(e) => {
          const y = parseInt(e.target.value, 10);
          const clampedMonth = Math.min(
            Math.max(curMonth, y === minYear ? min.getMonth() : 0),
            y === maxYear ? max.getMonth() : 11
          );
          onChange(new Date(y, clampedMonth, 1));
        }}
        className="w-[58px] shrink-0 px-1.5 py-2.5 bg-[#e8ebe6] rounded-[12px] text-[12px] font-medium text-[#0e0f0c] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#9fe870]/60"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function InputPanel({
  monthlyAmount,
  startDate,
  endDate,
  minDate,
  maxDate,
  onMonthlyAmountChange,
  onStartDateChange,
  onEndDateChange,
}: InputPanelProps) {
  const isEndToday = endDate === null;
  const [displayValue, setDisplayValue] = useState(formatRibu(monthlyAmount));

  useEffect(() => {
    setDisplayValue(formatRibu(monthlyAmount));
  }, [monthlyAmount]);

  return (
    <section className="px-6 py-5 bg-canvas border-b border-black/[0.06]">
      <p className="text-[12px] font-semibold text-[#868685] uppercase tracking-wide mb-4">
        Simulasikan investasimu
      </p>

      <div className="mb-4">
        <label htmlFor="nominal" className="block text-[12px] font-semibold text-[#454745] mb-1.5">
          Nominal per bulan
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#0e0f0c] pointer-events-none">
            Rp
          </span>
          <input
            id="nominal"
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={(e) => {
              const raw = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
              setDisplayValue(raw === '' ? '' : formatRibu(parseInt(raw, 10)));
              const num = parseInt(raw, 10);
              if (!isNaN(num) && num > 0) onMonthlyAmountChange(num);
            }}
            onBlur={() => {
              const raw = displayValue.replace(/\./g, '');
              const num = parseInt(raw, 10);
              const safe = isNaN(num) || num <= 0 ? 100_000 : num;
              setDisplayValue(formatRibu(safe));
              onMonthlyAmountChange(safe);
            }}
            className="w-full pl-10 pr-4 py-3 bg-canvas border border-[#0e0f0c] rounded-[12px] text-[16px] font-semibold text-[#0e0f0c] focus:outline-none focus:ring-2 focus:ring-[#9fe870]/60"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-semibold text-[#454745] mb-1.5">Mulai</label>
          <MonthYearPicker
            value={startDate}
            min={minDate}
            max={isEndToday ? maxDate : endDate}
            onChange={onStartDateChange}
          />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-[#454745] mb-1.5">Sampai</label>
          {isEndToday ? (
            <button
              onClick={() => onEndDateChange(maxDate)}
              className="w-full px-3 py-2.5 bg-[#e8ebe6] rounded-[12px] text-[13px] font-medium text-[#868685] text-left hover:bg-[#d4d8d1] transition-colors"
            >
              Hari ini
            </button>
          ) : (
            <div className="space-y-1.5">
              <MonthYearPicker
                value={endDate}
                min={startDate}
                max={maxDate}
                onChange={onEndDateChange}
              />
              <button
                onClick={() => onEndDateChange(null)}
                className="w-full py-1.5 rounded-[9999px] text-[12px] font-semibold text-[#054d28] bg-[#e2f6d5] hover:bg-[#9fe870]/40 transition-colors"
              >
                ← Sampai hari ini
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
