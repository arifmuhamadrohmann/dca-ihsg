export function formatRupiah(value: number, options?: { compact?: boolean }): string {
  if (options?.compact) {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

export function formatXIRR(value: number): string {
  return `${value.toFixed(1)}% / tahun`;
}

/** Clean Y-axis label for chart — no "Rp" prefix, rounded */
export function formatYAxis(value: number): string {
  if (value === 0) return '0';
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)} jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} rb`;
  return String(value);
}
