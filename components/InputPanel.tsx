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

function toMonthValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function fromMonthValue(value: string): Date {
  const parts = value.split('-');
  const year = parseInt(parts[0] ?? '2010', 10);
  const month = parseInt(parts[1] ?? '1', 10);
  return new Date(year, month - 1, 1);
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
          <label htmlFor="start-date" className="block text-[11px] text-gray-500 mb-1">
            Mulai
          </label>
          <input
            id="start-date"
            type="month"
            value={toMonthValue(startDate)}
            min={toMonthValue(minDate)}
            max={toMonthValue(isEndToday ? maxDate : endDate)}
            onChange={(e) => onStartDateChange(fromMonthValue(e.target.value))}
            className="w-full px-3 py-2.5 bg-soft rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-success/40"
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
            <div className="relative">
              <input
                id="end-date"
                type="month"
                value={toMonthValue(endDate)}
                min={toMonthValue(startDate)}
                max={toMonthValue(maxDate)}
                onChange={(e) => onEndDateChange(fromMonthValue(e.target.value))}
                className="w-full px-3 py-2.5 bg-soft rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-success/40 pr-14"
              />
              <button
                onClick={() => onEndDateChange(null)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-gray-700"
              >
                reset
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
