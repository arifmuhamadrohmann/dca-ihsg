'use client';

import type { Strategy } from '@/lib/types';

export const STRATEGY_CONFIG: Record<
  Strategy,
  { label: string; color: string; selectedClasses: string }
> = {
  'dca-ihsg': {
    label: 'DCA IHSG',
    color: '#1D9E75',
    selectedClasses: 'bg-[#EAF3DE] text-[#173404] border-[#1D9E75]',
  },
  'lumpsum-ihsg': {
    label: 'Lump sum IHSG',
    color: '#378ADD',
    selectedClasses: 'bg-[#E6F1FB] text-[#042C53] border-[#378ADD]',
  },
  'dca-deposito': {
    label: 'DCA Deposito',
    color: '#BA7517',
    selectedClasses: 'bg-[#FAEEDA] text-[#412402] border-[#BA7517]',
  },
  'lumpsum-deposito': {
    label: 'Lump sum Deposito',
    color: '#D85A30',
    selectedClasses: 'bg-[#FAECE7] text-[#4A1B0C] border-[#D85A30]',
  },
};

export const ALL_STRATEGIES: Strategy[] = [
  'dca-ihsg',
  'lumpsum-ihsg',
  'dca-deposito',
  'lumpsum-deposito',
];

type StrategyPickerProps = {
  selected: Strategy[];
  onChange: (strategies: Strategy[]) => void;
};

export default function StrategyPicker({ selected, onChange }: StrategyPickerProps) {
  function toggle(strategy: Strategy) {
    const isSelected = selected.includes(strategy);
    if (isSelected) {
      if (selected.length <= 1) return; // minimal 1 strategi
      onChange(selected.filter((s) => s !== strategy));
    } else {
      onChange([...selected, strategy]);
    }
  }

  return (
    <div className="mx-4 mb-4">
      <p className="text-[11px] text-gray-500 mb-2">Bandingkan strategi</p>
      <div className="flex flex-wrap gap-1.5">
        {ALL_STRATEGIES.map((strategy) => {
          const config = STRATEGY_CONFIG[strategy];
          const isSelected = selected.includes(strategy);
          return (
            <button
              key={strategy}
              onClick={() => toggle(strategy)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] border transition-colors
                ${isSelected ? config.selectedClasses : 'bg-card text-gray-500 border-black/15 hover:border-black/30'}
              `}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: isSelected ? config.color : '#ccc' }}
              />
              {isSelected ? '✓ ' : '+ '}
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
