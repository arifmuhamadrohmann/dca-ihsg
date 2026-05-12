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

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

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

  function setMonth(m: number) {
    onChange(new Date(curYear, m, 1));
  }

  function setYear(y: number) {
    const clampedMonth = Math.min(
      Math.max(curMonth, y === minYear ? min.getMonth() : 0),
      y === maxYear ? max.getMonth() : 11
    );
    onChange(new Date(y, clampedMonth, 1));
  }

  return (
    <div className="flex gap-1">
      <select
        value={curMonth}
        onChange={(e) => setMonth(parseInt(e.target.value, 10))}
        className="flex-1 px-2 py-2.5 bg-soft rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-success/40"
      >
        {MONTHS.map((label, i) => (
          <option key={i} value={i} disabled={i < minMonth || i > maxMonth}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={curYear}
        onChange={(e) => setYear(parseInt(e.target.value, 10))}
        className="w-[72px] px-2 py-2.5 bg-soft rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-success/40"
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
    <section className="px-4 py-4 bg-card">
      <p className="text-[12px] text-gray-400 mb-3">Simulasikan DCA-mu</p>

      <div className="mb-3">
        <label htmlFor="nominal" className="block text-[11px] text-gray-500 mb-1">
          Nominal per bulan
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-gray-900 pointer-events-none">
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
            className="w-full pl-9 pr-3 py-2.5 bg-soft rounded-lg text-[16px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-success/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Mulai</label>
          <MonthYearPicker
            value={startDate}
            min={minDate}
            max={isEndToday ? maxDate : endDate}
            onChange={onStartDateChange}
          />
        </div>
        <div>
          <label className="block text-[11px] text-gray-500 mb-1">Sampai</label>
          {isEndToday ? (
            <button
              onClick={() => onEndDateChange(maxDate)}
              className="w-full px-3 py-2.5 bg-soft rounded-lg text-[13px] text-gray-400 text-left hover:bg-gray-100 transition-colors"
            >
              Hari ini
            </button>
          ) : (
            <div className="space-y-1">
              <MonthYearPicker
                value={endDate}
                min={startDate}
                max={maxDate}
                onChange={onEndDateChange}
              />
              <button
                onClick={() => onEndDateChange(null)}
                className="w-full py-1 rounded-md text-[11px] text-brand-success-label bg-brand-success-bg hover:bg-brand-success-border/40 transition-colors"
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
