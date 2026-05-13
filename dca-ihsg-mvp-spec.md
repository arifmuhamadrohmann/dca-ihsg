# DCA Time Machine IHSG — MVP Spec v1.0

**Owner:** Ariff
**Tanggal:** 12 Mei 2026
**Target ship:** 2 minggu (side project)
**Status:** Draft untuk dieksekusi

---

## 1. Ringkasan

Web app yang mensimulasikan strategi Dollar Cost Averaging (DCA) di IHSG (`^JKSE`). User memasukkan nominal investasi bulanan dan periode, lalu melihat hasil simulasi dari tanggal mulai sampai hari ini, lengkap dengan chart dan share card.

**Positioning:** Portfolio piece + tools personal untuk eksplorasi DCA IHSG. Target audiens utama adalah recruiter/tech audience yang melihat portofolio, sekunder teman & followers di media sosial.

---

## 2. Goals & non-goals

### Goals
- Showcase keterampilan teknis: Next.js, TypeScript, data visualization, design sense, deploy pipeline
- User bisa menjalankan simulasi DCA IHSG dalam <30 detik dari landing
- Hasil visual yang shareable (PNG download + Web Share API)
- Transparansi penuh — assumptions, data source, dan metodologi jelas
- Open source di GitHub dengan README yang readable

### Non-goals
- Real-time / intraday data (monthly cukup)
- Multi-saham atau saham individual (untuk fase B nanti)
- Forecast / proyeksi masa depan / Monte Carlo (untuk fase C)
- User account, save scenarios, atau dashboard
- Advisor / rekomendasi investasi (hanya simulasi historis)

---

## 3. Success criteria

Karena tujuannya portfolio, ukurannya adalah quality signal — bukan jumlah pengguna:

- Deployed di Vercel dengan URL publik
- README rapi dengan screenshot, demo link, tech stack, setup steps
- Lighthouse Performance > 90, Accessibility > 90
- Mobile responsive dari 320px ke atas
- TypeScript strict mode, no `any`
- Setidaknya 1 unit test untuk engine DCA
- Commit history rapi (conventional commits direkomendasikan)
- MIT license, open source

---

## 4. User flow (happy path)

1. User buka landing → langsung lihat **pre-filled example** (mis. DCA Rp 1jt/bulan dari Jan 2010 sampai hari ini)
2. User adjust nominal / start date / end date via input panel
3. Summary card & chart update real-time
4. User klik **Save as image** → download PNG 1080×1080
5. (Optional) User klik **Share** → native share sheet via Web Share API

### Edge cases yang harus ditangani

- Start date di masa depan → error message friendly
- End date sebelum start date → swap otomatis atau tampilkan error
- Nominal Rp 0 atau negatif → default ke Rp 100.000
- Start date sebelum data tersedia → snap ke earliest available date
- No internet → static JSON sudah ada di build, app tetap jalan

---

## 5. Feature list

### P0 — Must have (untuk ship 2 minggu)

1. **Input panel** — nominal Rp/bulan, start date, end date (default "Hari ini")
2. **DCA engine** — pure function, monthly buy di harga close akhir bulan
3. **Summary card** — Total setoran · Nilai sekarang · Untung/rugi · Return % · XIRR · Periode (X tahun Y bulan)
4. **Chart** — line chart 2 series (Nilai portofolio vs Total setoran kumulatif), responsive mobile
5. **Crisis annotation** — vertical marker di 1998, 2008, 2020 dengan tooltip
6. **Methodology section** — accordion menjelaskan asumsi & data source
7. **Save as PNG** — download summary + chart sebagai 1080×1080 image
8. **About page** — siapa pembuat, GitHub link, tech stack

### P1 — Nice to have (kalau ada waktu sisa)

9. Web Share API integration untuk one-tap share
10. Preset scenarios — "10 tahun terakhir", "Sejak krisis 2008", "Sejak pandemic 2020"
11. DCA vs lump sum comparison (toggle simple)
12. Inflation-adjusted return (convert ke purchasing power tahun start)

### Out of scope — jangan tergoda

- Saham individual (BBCA, BBRI, dll)
- DCA mingguan / harian / custom interval
- Reinvestasi dividen yang precise
- Pajak final & biaya broker simulation
- Login / akun / save scenarios
- Multi-bahasa
- Dark mode (kecuali dapat gratis dari Tailwind config)

---

## 6. Data spec

**Source:** Yahoo Finance via `yfinance` Python library, ticker `^JKSE`
**Resolution:** Monthly — end-of-month adjusted close
**Range:** Sejak data tersedia (~April 1990) sampai bulan terakhir
**Format:** JSON di `/public/data/jkse-monthly.json`

```json
[
  { "date": "1990-04-30", "close": 366.78 },
  { "date": "1990-05-31", "close": 391.04 }
]
```

**Update mechanism:** GitHub Action mingguan via `.github/workflows/refresh-data.yml` (cron Senin 00:00 UTC), auto-commit kalau ada data baru.

**Fallback:** Jika fetch gagal, pakai data terakhir yang sudah committed — app tetap jalan dengan staleness max 1 minggu.

---

## 7. Calculation spec

### Asumsi

- Beli di harga close akhir bulan
- Tidak ada biaya transaksi (MVP)
- Tidak ada pajak final 0.1% (MVP)
- Dividen tidak dihitung (pakai price index, bukan total return)
- Fractional units allowed (untuk simulasi indeks, lot size tidak relevan)

### Formula

```
units_bulan_n   = nominal / close_bulan_n
total_units     = Σ units_bulan_1..n
total_setoran   = nominal × jumlah_bulan
nilai_sekarang  = total_units × close_terakhir
gain            = nilai_sekarang − total_setoran
return_pct      = (gain / total_setoran) × 100
xirr            = pakai library xirr atau hitung sendiri (Newton-Raphson)
```

### Unit test minimum

- DCA Rp 1jt/bulan, 12 bulan harga konstan → total setoran = 12jt, return = 0%
- DCA di periode harga naik 2x → return > 0
- DCA 1 bulan tunggal → return = (close_now − close_buy) / close_buy × 100
- Edge: start = end → throw error atau periode 0

---

## 8. UI structure

Single page app, no routing yet. Layout vertical, mobile-first:

```
┌─────────────────────────────────┐
│ HEADER                          │
│ DCA Time Machine IHSG           │
│ [About] [GitHub]                │
├─────────────────────────────────┤
│ INPUT PANEL                     │
│ Nominal/bulan: [Rp 1.000.000]   │
│ Mulai: [Jan 2010 ▾]             │
│ Sampai: [Hari ini ▾]            │
├─────────────────────────────────┤
│ SUMMARY CARD  (target screenshot)│
│ Total setoran:  Rp 187 juta     │
│ Nilai sekarang: Rp 412 juta     │
│ Untung:         Rp 225 juta     │
│ Return:         +120% (XIRR 12%)│
│ Periode:        15 tahun 6 bulan│
├─────────────────────────────────┤
│ CHART                           │
│ Line chart, 2 series            │
│ - Nilai portofolio              │
│ - Total setoran                 │
│ Crisis markers: 1998, 2008, 2020│
├─────────────────────────────────┤
│ [💾 Save as PNG] [↗ Share]      │
├─────────────────────────────────┤
│ METHODOLOGY (accordion)         │
│ - Data source                   │
│ - Asumsi & batasan              │
│ - Disclaimer                    │
└─────────────────────────────────┘
```

### Design tokens

- Color: 2 utama (emerald untuk naik, slate untuk neutral, red untuk turun)
- Typography: Geist atau Inter (default Next.js)
- Border radius: 12px (modern feel)
- Shadow: subtle (`shadow-sm` Tailwind)

---

## 9. Tech stack

**Frontend**

- Next.js 14+ (App Router) + TypeScript (strict)
- Tailwind CSS
- Recharts untuk visualisasi (lebih ringan dari D3, cocok untuk MVP)
- `html-to-image` untuk PNG download
- `date-fns` untuk date manipulation

**Data pipeline**

- Python script `scripts/fetch_data.py` pakai `yfinance`
- Output: JSON di `/public/data/`
- Trigger: GitHub Action weekly + manual

**Tooling**

- ESLint + Prettier
- Vitest (lebih cepat dari Jest untuk Next.js)
- Husky + lint-staged (optional, kalau gak menyulitkan)

**Deploy**

- Vercel free tier
- Custom subdomain (mis. `dca-ihsg.vercel.app`)
- Open Graph image untuk preview Twitter/LinkedIn

---

## 10. Timeline — 2 minggu, ~2–3 jam/hari

### Week 1 — Foundation

| Hari | Task |
|------|------|
| 1 | Project setup (Next.js + TS + Tailwind), data pipeline Python, commit initial JSON |
| 2 | DCA engine (pure function) + unit test |
| 3 | Input panel UI + state management |
| 4 | Summary card UI |
| 5 | Chart integration (Recharts) |
| 6–7 | Mobile responsive, polish styling, basic accessibility |

### Week 2 — Polish & ship

| Hari | Task |
|------|------|
| 8 | Save as PNG (`html-to-image`) |
| 9 | Crisis annotations, methodology section |
| 10 | About page, README, GitHub setup, Open Graph image |
| 11 | GitHub Action data refresh, edge case handling |
| 12 | Lighthouse audit, accessibility check, fix issues |
| 13 | Deploy ke Vercel, smoke test di HP nyata |
| 14 | Buffer + screenshot final, post di LinkedIn / Twitter |

**Buffer rule:** Kalau hari ke-7 di belakang jadwal, langsung potong P1 dan fokus P0 saja. Ship > perfect.

---

## 11. Quality checklist sebelum dianggap "done"

- [ ] README ada screenshot + demo link + tech stack + setup steps + lessons learned
- [ ] Commit history rapi (conventional commits)
- [ ] No `any` di TypeScript codebase
- [ ] Lighthouse Performance > 90, Accessibility > 90
- [ ] Responsive sampai 320px lebar
- [ ] DCA engine ada test yang pass
- [ ] Methodology section transparent, tidak menyembunyikan asumsi
- [ ] Disclaimer "not financial advice" jelas
- [ ] Open Graph image custom (untuk preview saat share)
- [ ] Favicon custom
- [ ] LICENSE file (MIT)
- [ ] Open Graph + meta tags untuk LinkedIn/Twitter preview

---

## 12. Risk register

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Data yfinance ada gap atau salah | Medium | Pre-validate sebelum commit, ada test sederhana |
| Chart lambat di HP lama | Low | Pakai Recharts, jangan render 360+ points raw |
| PNG generation buggy di Safari | Medium | Test di iOS Safari awal-awal, fallback "screenshot manually" |
| Scope creep | High | Strict enforcement P0, P1 hanya kalau ahead of schedule |
| Burnout side project | Medium | Hari ke-7 evaluasi jujur, potong scope kalau perlu |
| XIRR implementation salah | Medium | Pakai library `xirr` yang sudah teruji, atau cross-check dengan Excel |

---

## 13. Decisions log (sudah final)

- ✅ Scope IHSG indeks only — saham individual untuk fase B
- ✅ Pure frontend, no backend, data static JSON
- ✅ Update data mingguan via GitHub Action
- ✅ Mobile-first design
- ✅ Audience utama: portfolio (recruiter/dev), bukan mass-market
- ✅ Tech: Next.js + TS + Tailwind + Recharts

---

## 14. Decisions log — finalized

| # | Decision | Value |
|---|----------|-------|
| 1 | Domain | `*.vercel.app` (gratis, no custom domain) |
| 2 | License | MIT |
| 3 | Analytics | **Vercel Analytics** (free tier hobby plan) |
| 4 | Crisis markers | Semua: 1998 Asian crisis, 2008 GFC, 2013 taper tantrum, 2015 Indonesia bear, 2020 COVID |
| 5 | Pre-filled default | DCA **Rp 1.000.000/bulan dari Januari 2010 sampai hari ini** |

### Crisis markers detail (untuk annotation chart)

| Tahun | Label | Range tanggal (kira-kira) |
|-------|-------|---------------------------|
| 1998 | Krismon Asia | Jul 1997 – Sep 1998 |
| 2008 | Global Financial Crisis | Sep 2008 – Mar 2009 |
| 2013 | Taper tantrum | May – Aug 2013 |
| 2015 | Bear market IDR | Apr – Sep 2015 |
| 2020 | COVID-19 crash | Feb – May 2020 |
