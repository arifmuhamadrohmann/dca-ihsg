# DCA Time Machine IHSG

Simulator Dollar Cost Averaging untuk IHSG (Indeks Harga Saham Gabungan).

> Kalau kamu DCA Rp X per bulan sejak tanggal Y, berapa hasilnya hari ini?

**[Live demo](https://dca-ihsg.vercel.app)** · [About](https://dca-ihsg.vercel.app/about)

## Features

- Simulasi DCA bulanan IHSG (^JKSE) dari 1990 sampai hari ini
- Chart pertumbuhan portofolio vs total setoran
- Crisis markers: Krismon 1998 · GFC 2008 · Taper Tantrum 2013 · Bear 2015 · COVID 2020
- Simpan hasil sebagai PNG · Share via Web Share API
- Mobile-first, no auth, no backend

## Tech stack

Next.js 14 (App Router) · TypeScript strict · Tailwind CSS · Recharts · yfinance · GitHub Actions · Vercel

## Setup lokal

```
npm install
python scripts/fetch_data.py   # butuh Python 3 + pip install yfinance pandas
npm run dev
```

## Compare Lab (`/compare`)

Halaman perbandingan 4 strategi investasi side-by-side:

| Strategi | Deskripsi |
|---|---|
| DCA IHSG | Investasi rutin bulanan di indeks IHSG |
| Lump sum IHSG | Investasi sekaligus di awal periode |
| DCA Deposito | Setor rutin bulanan dengan bunga BI Rate |
| Lump sum Deposito | Deposito sekaligus dengan bunga BI Rate |

**Fitur:** overlay chart multi-line · ranking winner/loser · summary grid · AI analysis comparison-aware (Groq Llama 3.3 70B) · cache 24 jam · export PNG

**Update BI Rate data:**
```bash
python scripts/fetch_bi_rate.py data-input/bi-rate.csv
```
Download CSV dari [bi.go.id](https://www.bi.go.id/id/statistik/indikator/bi-rate.aspx).

**Environment variables (tambah di Vercel):**
```
GROQ_API_KEY=gsk_...
```

## Disclaimer

Simulasi historis bukan jaminan kinerja masa depan. Bukan rekomendasi investasi.

## License

MIT
