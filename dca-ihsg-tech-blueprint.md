# DCA Time Machine IHSG — Tech Blueprint

Dokumen teknis untuk eksekusi MVP. Pasangan dari `dca-ihsg-mvp-spec.md` dan `dca-ihsg-wireframe.html`.

---

## 1. Tech stack final

| Layer | Pilihan | Catatan |
|-------|---------|---------|
| Framework | Next.js 14+ (App Router) | Vercel-native, SSR/SSG free |
| Language | TypeScript (strict) | No `any` |
| Styling | Tailwind CSS | Mobile-first |
| Charting | Recharts | Lebih ringan dari D3 |
| Date | `date-fns` | Modular, tree-shakeable |
| PNG export | `html-to-image` | Browser-native, no canvas hassle |
| XIRR | `xirr` (npm) | Pre-tested implementation |
| Testing | Vitest + `@testing-library/react` | Faster than Jest |
| Data pipeline | Python 3 + `yfinance` | Hanya jalan di CI/lokal |
| CI | GitHub Actions | Refresh data mingguan |
| Hosting | Vercel (hobby plan) | Free, auto-deploy from main |
| Analytics | Vercel Analytics | Free di hobby plan |

---

## 2. Folder structure

```
dca-ihsg/
├── .github/
│   └── workflows/
│       └── refresh-data.yml          # Cron mingguan refresh data
├── app/
│   ├── layout.tsx                    # Root layout, metadata, OG image
│   ├── page.tsx                      # Single page utama
│   ├── about/
│   │   └── page.tsx                  # Halaman "about" / portfolio note
│   └── opengraph-image.tsx           # Auto-generated OG image
├── components/
│   ├── Header.tsx
│   ├── InputPanel.tsx
│   ├── SummaryCard.tsx
│   ├── PortfolioChart.tsx
│   ├── ActionsBar.tsx
│   ├── MethodologyAccordion.tsx
│   ├── Disclaimer.tsx
│   └── Footer.tsx
├── lib/
│   ├── dca.ts                        # DCA engine — pure function
│   ├── dca.test.ts                   # Unit tests
│   ├── format.ts                     # Format Rupiah, persen, periode
│   ├── crisis-markers.ts             # Daftar krisis untuk annotation
│   └── types.ts                      # Shared TypeScript types
├── public/
│   ├── data/
│   │   └── jkse-monthly.json         # Data IHSG bulanan
│   ├── favicon.ico
│   └── og-image.png
├── scripts/
│   └── fetch_data.py                 # Python script ambil data dari yfinance
├── .eslintrc.json
├── .gitignore
├── .prettierrc
├── LICENSE                            # MIT
├── README.md
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## 3. Key files — content reference

### 3.1 `package.json`

```json
{
  "name": "dca-ihsg",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "fetch-data": "python scripts/fetch_data.py"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "html-to-image": "^1.11.11",
    "xirr": "^2.0.0",
    "@vercel/analytics": "^1.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0",
    "vitest": "^1.5.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jsdom": "^24.0.0"
  }
}
```

### 3.2 `tsconfig.json`

Strict mode wajib. Pakai `"strict": true`, `"noUncheckedIndexedAccess": true`, alias `@/*` ke root.

### 3.3 `lib/types.ts`

```typescript
export type MonthlyPrice = {
  date: string;
  close: number;
};

export type DCAInput = {
  monthlyAmount: number;
  startDate: Date;
  endDate: Date;
  prices: MonthlyPrice[];
};

export type DCAStep = {
  date: string;
  amountInvested: number;
  cumulativeInvested: number;
  unitsBought: number;
  cumulativeUnits: number;
  portfolioValue: number;
};

export type DCAResult = {
  steps: DCAStep[];
  totalInvested: number;
  finalValue: number;
  gain: number;
  returnPct: number;
  xirr: number;
  monthsInvested: number;
  periodLabel: string;
};

export type CrisisMarker = {
  year: number;
  label: string;
  startDate: string;
  endDate: string;
};
```

### 3.4 `lib/dca.ts` — engine skeleton

```typescript
import xirr from 'xirr';
import { DCAInput, DCAResult, DCAStep, MonthlyPrice } from './types';
import { differenceInMonths, format, parseISO } from 'date-fns';

export function simulateDCA(input: DCAInput): DCAResult {
  const { monthlyAmount, startDate, endDate, prices } = input;

  if (monthlyAmount <= 0) {
    throw new Error('monthlyAmount harus > 0');
  }
  if (endDate < startDate) {
    throw new Error('endDate harus setelah startDate');
  }

  const filtered = prices.filter(p => {
    const d = parseISO(p.date);
    return d >= startDate && d <= endDate;
  });

  if (filtered.length === 0) {
    throw new Error('Tidak ada data harga di rentang ini');
  }

  let cumulativeInvested = 0;
  let cumulativeUnits = 0;
  const steps: DCAStep[] = filtered.map(p => {
    const units = monthlyAmount / p.close;
    cumulativeInvested += monthlyAmount;
    cumulativeUnits += units;
    return {
      date: p.date,
      amountInvested: monthlyAmount,
      cumulativeInvested,
      unitsBought: units,
      cumulativeUnits,
      portfolioValue: cumulativeUnits * p.close,
    };
  });

  const finalPrice = filtered[filtered.length - 1].close;
  const finalValue = cumulativeUnits * finalPrice;
  const totalInvested = cumulativeInvested;
  const gain = finalValue - totalInvested;
  const returnPct = (gain / totalInvested) * 100;

  const cashflows = [
    ...filtered.map(p => ({ amount: -monthlyAmount, when: parseISO(p.date) })),
    { amount: finalValue, when: parseISO(filtered[filtered.length - 1].date) },
  ];
  const xirrValue = xirr(cashflows) * 100;

  const monthsInvested = filtered.length;
  const periodLabel = formatPeriod(monthsInvested);

  return {
    steps,
    totalInvested,
    finalValue,
    gain,
    returnPct,
    xirr: xirrValue,
    monthsInvested,
    periodLabel,
  };
}

function formatPeriod(months: number): string {
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  if (years === 0) return `${months} bulan`;
  if (remainder === 0) return `${years} tahun`;
  return `${years} tahun ${remainder} bulan`;
}
```

### 3.5 `lib/dca.test.ts` — minimum tests

```typescript
import { describe, it, expect } from 'vitest';
import { simulateDCA } from './dca';
import { MonthlyPrice } from './types';

describe('simulateDCA', () => {
  const flat: MonthlyPrice[] = [
    { date: '2020-01-31', close: 1000 },
    { date: '2020-02-29', close: 1000 },
    { date: '2020-03-31', close: 1000 },
  ];

  it('zero return when price is flat', () => {
    const result = simulateDCA({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: flat,
    });
    expect(result.totalInvested).toBe(3_000_000);
    expect(result.finalValue).toBeCloseTo(3_000_000);
    expect(result.returnPct).toBeCloseTo(0);
  });

  it('positive return when price doubles', () => {
    const rising: MonthlyPrice[] = [
      { date: '2020-01-31', close: 1000 },
      { date: '2020-02-29', close: 1500 },
      { date: '2020-03-31', close: 2000 },
    ];
    const result = simulateDCA({
      monthlyAmount: 1_000_000,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: rising,
    });
    expect(result.gain).toBeGreaterThan(0);
    expect(result.returnPct).toBeGreaterThan(0);
  });

  it('throws when monthlyAmount is zero', () => {
    expect(() => simulateDCA({
      monthlyAmount: 0,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2020-03-31'),
      prices: flat,
    })).toThrow();
  });

  it('throws when endDate before startDate', () => {
    expect(() => simulateDCA({
      monthlyAmount: 1000,
      startDate: new Date('2020-03-01'),
      endDate: new Date('2020-01-01'),
      prices: flat,
    })).toThrow();
  });
});
```

### 3.6 `lib/crisis-markers.ts`

```typescript
import { CrisisMarker } from './types';

export const CRISIS_MARKERS: CrisisMarker[] = [
  { year: 1998, label: 'Krismon Asia', startDate: '1997-07-01', endDate: '1998-09-30' },
  { year: 2008, label: 'Global Financial Crisis', startDate: '2008-09-01', endDate: '2009-03-31' },
  { year: 2013, label: 'Taper Tantrum', startDate: '2013-05-01', endDate: '2013-08-31' },
  { year: 2015, label: 'Bear Market IDR', startDate: '2015-04-01', endDate: '2015-09-30' },
  { year: 2020, label: 'COVID-19 Crash', startDate: '2020-02-01', endDate: '2020-05-31' },
];
```

### 3.7 `lib/format.ts`

```typescript
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
```

### 3.8 `scripts/fetch_data.py`

```python
"""
Fetch monthly IHSG data dari Yahoo Finance.
Output: public/data/jkse-monthly.json
"""
import json
import sys
from pathlib import Path

import yfinance as yf
import pandas as pd

TICKER = "^JKSE"
OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "jkse-monthly.json"


def fetch_monthly() -> list[dict]:
    df = yf.download(TICKER, start="1990-01-01", interval="1mo", progress=False)
    if df.empty:
        raise RuntimeError("yfinance returned empty data")

    df = df[["Close"]].dropna()
    df.index = df.index.to_period("M").to_timestamp("M")

    records = [
        {"date": d.strftime("%Y-%m-%d"), "close": round(float(c), 2)}
        for d, c in zip(df.index, df["Close"])
    ]
    return records


def main() -> int:
    try:
        records = fetch_monthly()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(records, indent=2))
    print(f"Wrote {len(records)} records to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

### 3.9 `.github/workflows/refresh-data.yml`

```yaml
name: Refresh IHSG data

on:
  schedule:
    - cron: '0 0 * * 1'
  workflow_dispatch:

jobs:
  refresh:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install deps
        run: pip install yfinance pandas
      - name: Run fetch script
        run: python scripts/fetch_data.py
      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add public/data/jkse-monthly.json
          git diff --quiet --staged || git commit -m "chore(data): refresh IHSG monthly data"
          git push
```

---

## 4. UI implementation notes

### Color palette (Tailwind config)

```typescript
colors: {
  brand: {
    success: '#1D9E75',
    'success-bg': '#EAF3DE',
    'success-border': '#C0DD97',
    'success-text': '#173404',
    'success-label': '#3B6D11',
    danger: '#E24B4A',
    'danger-text': '#A32D2D',
  },
}
```

### Components order to build

1. `lib/dca.ts` + test — engine dulu, sebelum UI
2. `lib/format.ts` + `lib/crisis-markers.ts`
3. `components/InputPanel.tsx` — form state pakai `useState`
4. `components/SummaryCard.tsx` — pure presentational
5. `components/PortfolioChart.tsx` — Recharts integration
6. `app/page.tsx` — wire semua bersama
7. `components/ActionsBar.tsx` — html-to-image + Web Share API
8. `components/MethodologyAccordion.tsx`, `Disclaimer.tsx`, `Footer.tsx`, `Header.tsx`
9. `app/about/page.tsx`
10. `app/opengraph-image.tsx`

### State management

Karena single page, cukup `useState` di `app/page.tsx`:

```typescript
const [monthlyAmount, setMonthlyAmount] = useState(1_000_000);
const [startDate, setStartDate] = useState(new Date('2010-01-01'));
const [endDate, setEndDate] = useState<Date | null>(null);
const result = useMemo(
  () => simulateDCA({ monthlyAmount, startDate, endDate: endDate ?? new Date(), prices }),
  [monthlyAmount, startDate, endDate, prices]
);
```

Tidak butuh Redux/Zustand untuk MVP.

### Web Share API + fallback

```typescript
async function handleShare() {
  const url = window.location.href;
  if (navigator.share) {
    await navigator.share({ title: 'DCA Time Machine IHSG', url });
  } else {
    await navigator.clipboard.writeText(url);
    showToast('Link disalin');
  }
}
```

### PNG export

```typescript
import { toPng } from 'html-to-image';

async function handleSavePNG() {
  const node = document.getElementById('share-card');
  if (!node) return;
  const dataUrl = await toPng(node, {
    width: 1080,
    height: 1080,
    pixelRatio: 2,
  });
  const link = document.createElement('a');
  link.download = 'dca-ihsg.png';
  link.href = dataUrl;
  link.click();
}
```

---

## 5. README skeleton

```markdown
# DCA Time Machine IHSG

Simulator Dollar Cost Averaging untuk IHSG (Indeks Harga Saham Gabungan).
Eksplorasi historis: kalau kamu DCA Rp X per bulan sejak tanggal Y, berapa hasilnya hari ini?

[Live demo](https://dca-ihsg.vercel.app) · [About](./about)

![Screenshot](./public/og-image.png)

## Features

- Simulasi DCA bulanan untuk IHSG (`^JKSE`) sejak 1990-an
- Visualisasi pertumbuhan portofolio vs total setoran
- Crisis markers (1998, 2008, 2013, 2015, 2020)
- Save as PNG untuk share di media sosial
- Mobile-first, no auth, fast load

## Tech stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · Recharts · yfinance · GitHub Actions · Vercel

## Setup lokal

\`\`\`bash
pnpm install
pnpm fetch-data    # butuh Python 3 + yfinance
pnpm dev
\`\`\`

## Data

Data IHSG monthly close diambil dari Yahoo Finance via `yfinance`.
GitHub Action refresh setiap Senin 00:00 UTC.

## Methodology

Lihat section "Metodologi" di app, atau [docs/methodology.md](./docs/methodology.md).

## Disclaimer

Simulasi historis bukan jaminan kinerja masa depan. Bukan rekomendasi investasi.

## License

MIT
```

---

## 6. Quality gates sebelum dianggap done

- `pnpm test` pass — minimal 4 test untuk DCA engine
- `pnpm build` no error, no `any` warnings
- Lighthouse mobile: Performance > 90, Accessibility > 90, Best Practices > 90
- Manual test di Chrome desktop, Chrome Android, Safari iOS
- PNG export jalan di 3 browser di atas
- Share button jalan di mobile (Web Share API)
- Vercel deploy success, URL bisa diakses publik
- Open Graph preview di Twitter/LinkedIn ada gambar
- README ada screenshot dan demo link
