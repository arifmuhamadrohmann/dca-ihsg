# Design: DCA Time Machine IHSG

**Date:** 2026-05-12
**Status:** Approved — ready for implementation
**Owner:** Muhamad Arif Rohman
**Build directory:** `/Users/arifmuhamadrohman/Projects/dca-ihsg/` (branch: `main`)

---

## 1. What we're building

A single-page Next.js web app that simulates a Dollar Cost Averaging strategy on the Indonesian stock market index (IHSG / `^JKSE`). User inputs a monthly investment amount and date range; the app computes historical results and renders an interactive chart.

Primary purpose: portfolio piece for recruiter/dev audiences. Secondary: shareable via PNG + Web Share API.

---

## 2. Architecture

**Pure frontend — no backend, no database.**

- Data: static JSON at `public/data/jkse-monthly.json` (refreshed weekly via GitHub Actions)
- Computation: pure TypeScript function (`lib/dca.ts`) running client-side via `useMemo`
- State: `useState` in `app/page.tsx` — no Redux, no Zustand
- Routing: single page (`/`) + About page (`/about`)
- Deploy: Vercel free tier, auto-deploy on `git push main`

### Data flow

```
jkse-monthly.json (static)
        ↓
app/page.tsx (loads JSON, holds input state)
        ↓
simulateDCA() — lib/dca.ts (pure function, useMemo)
        ↓
DCAResult
        ↓
SummaryCard + PortfolioChart (presentational)
```

---

## 3. Tech stack (locked — do not change)

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript strict (`"strict": true`, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS, mobile-first |
| Charting | Recharts |
| Date utils | date-fns |
| PNG export | html-to-image |
| XIRR | xirr (npm) |
| Testing | Vitest + @testing-library/react |
| Data pipeline | Python 3 + yfinance |
| CI | GitHub Actions (weekly cron) |
| Hosting | Vercel (hobby plan) |
| Analytics | Vercel Analytics |

---

## 4. Folder structure

```
dca-ihsg/
├── .github/workflows/refresh-data.yml
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/page.tsx
│   └── opengraph-image.tsx
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
│   ├── dca.ts
│   ├── dca.test.ts
│   ├── format.ts
│   ├── crisis-markers.ts
│   └── types.ts
├── public/data/jkse-monthly.json
├── scripts/fetch_data.py
└── [config files]
```

---

## 5. Key component designs

### InputPanel
- Three fields: nominal/bulan (Rp, currency format), start date (month/year picker), end date (default "Hari ini" toggle)
- Input changes debounced 200ms before triggering recalculation
- Desktop (>640px): 3 fields in one row

### SummaryCard
- Hero metric: Nilai portofolio sekarang (large, emerald green when positive)
- Delta: +/- absolut dan persen
- 2×2 stat grid: Total setoran · XIRR · Bulan investasi · Periode
- Color: emerald/green background when gain > 0, red when loss
- This card is the PNG export target

### PortfolioChart
- Recharts LineChart, 2 series:
  - Solid emerald line: nilai portofolio
  - Dashed gray line: total setoran kumulatif
- 5 ReferenceLine crisis markers: 1998 (Krismon), 2008 (GFC), 2013 (Taper Tantrum), 2015 (Bear IDR), 2020 (COVID)
- Responsive: height 180px mobile, 280px desktop
- X-axis: year labels, Y-axis: Rupiah compact format

### ActionsBar
- "Simpan PNG": `html-to-image` capturing summary+chart div, 1080×1080, pixelRatio 2
- "Bagikan": Web Share API; fallback → clipboard copy + toast

### MethodologyAccordion
- Collapsed by default
- Content: data source (Yahoo Finance), asumsi (no fees, no tax, no dividend, fractional units), formula, batasan

---

## 6. DCA engine spec

```typescript
// lib/dca.ts
simulateDCA(input: DCAInput): DCAResult

// Buys at end-of-month close price
// Fractional units allowed
// XIRR: uses xirr npm package (Newton-Raphson internally)
```

**Validation:**
- `monthlyAmount <= 0` → throw
- `endDate < startDate` → throw
- No prices in range → throw

**Minimum 4 unit tests** (Vitest):
1. Flat price → 0% return
2. Rising price → positive gain
3. `monthlyAmount = 0` → throws
4. `endDate < startDate` → throws

---

## 7. Data pipeline

- `scripts/fetch_data.py`: downloads `^JKSE` monthly close from Yahoo Finance (1990→today)
- Output format: `[{ "date": "1990-04-30", "close": 366.78 }, ...]`
- GitHub Action: cron `0 0 * * 1` (every Monday 00:00 UTC), auto-commits if new data

---

## 8. Default state (pre-filled)

- Monthly amount: **Rp 1.000.000**
- Start date: **January 2010**
- End date: **today** (latest available data)

---

## 9. Edge cases

| Case | Handling |
|------|----------|
| Start date in future | Red helper text, summary shows dashes |
| End before start | Throw error, show friendly message |
| Amount ≤ 0 | Default to Rp 100.000 |
| Start before data available | Snap to earliest date in JSON |
| Period < 1 month | Warning: "Periode terlalu pendek" |
| No internet | Static JSON already bundled, app works offline |

---

## 10. P0 features (must ship)

1. Input panel
2. DCA engine + tests
3. Summary card
4. Line chart + crisis markers
5. Methodology accordion
6. Save as PNG
7. About page
8. GitHub Action data refresh
9. README with screenshot + demo link

## P1 (only if ahead of schedule)

- Web Share API
- Preset scenarios (10 tahun, sejak 2008, sejak 2020)
- DCA vs lump-sum toggle
- Inflation-adjusted return

---

## 11. Quality gates

- `npm run build` — no errors, no `any`
- `npm test` — all 4+ tests pass
- `tsc --noEmit` — clean
- Lighthouse mobile: Performance >90, Accessibility >90
- Responsive from 320px
- DCA default result in range Rp 300jt–Rp 500jt
- PNG export produces readable file
- OG image renders on Twitter/LinkedIn preview

---

## 12. Build sequence

1. Scaffold (create-next-app, install deps, config)
2. Data pipeline (fetch_data.py → run → validate JSON)
3. DCA engine + unit tests
4. UI components (InputPanel → SummaryCard → PortfolioChart → Header/Footer/Disclaimer → MethodologyAccordion → ActionsBar)
5. Wire in page.tsx
6. Polish (OG image, About page, README, Lighthouse fix)
