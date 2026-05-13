# Handoff prompt untuk Claude Code

Cara pakai: buat folder kosong di laptop, copy ketiga file ini ke dalamnya:

- `dca-ihsg-mvp-spec.md`
- `dca-ihsg-wireframe.html`
- `dca-ihsg-tech-blueprint.md`

Jalankan Claude Code di folder itu, lalu paste prompt di bawah ini.

---

## Prompt untuk Claude Code (copy mulai sini)

Saya mau kamu bantu build project portfolio bernama **DCA Time Machine IHSG** — web app yang mensimulasikan strategi Dollar Cost Averaging di IHSG (Indeks Harga Saham Gabungan Indonesia).

Tiga file referensi sudah ada di folder ini:

- `dca-ihsg-mvp-spec.md` — product spec (apa yang dibangun, fitur, success criteria)
- `dca-ihsg-wireframe.html` — wireframe visual (buka di browser dulu untuk lihat layout)
- `dca-ihsg-tech-blueprint.md` — technical blueprint (folder structure, tech stack, code skeletons)

**Tolong baca ketiga file itu dulu sebelum mulai.** Jangan skip — di sana ada decision yang sudah final dan tidak perlu kamu tanyakan lagi.

### Goal akhir

Sebuah Next.js 14 (App Router) + TypeScript strict project yang:

1. Bisa di-deploy ke Vercel via `git push`
2. Menampilkan simulasi DCA IHSG sesuai wireframe
3. Mobile-first responsive (test di lebar 360px ke atas)
4. Punya unit test untuk DCA engine
5. Punya README rapi untuk portfolio piece
6. Punya GitHub Action untuk refresh data mingguan

### Urutan eksekusi yang aku minta

Jalankan secara berurutan. Setelah setiap step, kasih aku 1 paragraf ringkas hasilnya, baru lanjut.

**Step 1 — Scaffold project**

- `npx create-next-app@latest .` dengan TypeScript, Tailwind, App Router, ESLint
- Setup `tsconfig.json` ke strict mode + `noUncheckedIndexedAccess`
- Install dependencies sesuai blueprint section 3.1 (`recharts`, `date-fns`, `html-to-image`, `xirr`, `@vercel/analytics`, `vitest`, dst)
- Setup Vitest config + `vitest.config.ts`
- Setup Prettier
- Buat folder structure sesuai blueprint section 2

**Step 2 — Data pipeline**

- Buat `scripts/fetch_data.py` sesuai blueprint section 3.8
- Jalankan script-nya untuk generate `public/data/jkse-monthly.json` pertama kali
- Verifikasi data valid: ada minimal 300 row, harga > 0, tanggal monotonic
- Buat `.github/workflows/refresh-data.yml` sesuai blueprint section 3.9 (tapi jangan push dulu)

**Step 3 — DCA engine + test**

- Implementasi `lib/types.ts`, `lib/dca.ts`, `lib/format.ts`, `lib/crisis-markers.ts` sesuai blueprint
- Tulis test di `lib/dca.test.ts` (minimal 4 test seperti blueprint section 3.5)
- Pastikan `pnpm test` atau `npm test` pass

**Step 4 — UI components (mobile-first)**

Build komponen sesuai wireframe `dca-ihsg-wireframe.html`. Urutannya:

1. `components/InputPanel.tsx`
2. `components/SummaryCard.tsx`
3. `components/PortfolioChart.tsx`
4. `components/Header.tsx`, `Footer.tsx`, `Disclaimer.tsx`
5. `components/MethodologyAccordion.tsx`
6. `components/ActionsBar.tsx` (PNG export + Web Share)

Lalu wire di `app/page.tsx` dengan default state pre-filled: Rp 1.000.000/bulan dari Jan 2010 sampai hari ini.

**Step 5 — Polish & deploy**

- `app/layout.tsx` dengan metadata OpenGraph
- `app/opengraph-image.tsx` untuk auto-generated preview image
- `app/about/page.tsx` (singkat: siapa pembuat, link GitHub, tech stack)
- Vercel Analytics integration
- README.md sesuai blueprint section 5
- Run Lighthouse, perbaiki kalau Performance/Accessibility di bawah 90
- Manual checklist: test di Chrome desktop & mobile, Safari iOS kalau bisa

### Yang TIDAK perlu kamu lakukan

- Jangan tambah fitur di luar spec (saham individual, login, dark mode wajib, dst — lihat "Out of scope" di spec)
- Jangan ganti tech stack — sudah final
- Jangan setup database — pure frontend
- Jangan setup auth — tidak butuh
- Jangan lompat ke deployment sebelum step 1-4 selesai dan test pass

### Pertanyaan klarifikasi

Tolong tanya saya KALAU:

- Data dari `yfinance` tidak valid atau ada gap signifikan
- Recharts tidak bisa render crisis markers seperti di wireframe — sarankan alternatif
- Test gagal dan tidak jelas apa yang salah
- Lighthouse score di bawah 80 setelah optimasi reasonable

JANGAN tanya untuk:

- Pilihan styling minor (pakai judgement, ikuti wireframe)
- Naming komponen (sudah ada di blueprint)
- Apakah perlu fitur X (kalau X tidak ada di spec, jawabannya tidak)

### Quality bar

Sebelum bilang "selesai", pastikan:

- [ ] `npm run build` success tanpa error & warning
- [ ] `npm test` semua pass
- [ ] `tsc --noEmit` no error
- [ ] Tidak ada `any` di codebase
- [ ] Lighthouse mobile: Performance > 90, Accessibility > 90
- [ ] Responsif dari 320px ke atas
- [ ] DCA result default (Rp 1jt/bulan dari Jan 2010) menampilkan angka yang masuk akal (range Rp 300jt - Rp 500jt)
- [ ] PNG export hasilkan file yang readable
- [ ] README ada screenshot

Mulai dari Step 1. Setelah selesai step 1, kasih aku status singkat sebelum lanjut.

## Prompt selesai

---

## Setelah Claude Code selesai

Hal-hal yang harus kamu lakukan manual (bukan tugas Claude Code):

1. **Buat GitHub repo** publik bernama `dca-ihsg` (atau nama lain), push code
2. **Connect repo ke Vercel** via dashboard Vercel
3. **Set environment variable** kalau ada (untuk MVP ini gak ada)
4. **Aktifkan Vercel Analytics** di dashboard project
5. **Verifikasi GitHub Action data refresh** — manual trigger dulu sekali, pastikan workflow jalan
6. **Tambahkan link demo & GitHub ke LinkedIn/CV** sebagai portfolio piece
7. **Optional: post di X/LinkedIn** dengan screenshot hasil pre-filled

## Kalau ada bug pasca-deploy

Buka Claude Code lagi di folder yang sama, jelaskan bug-nya. Karena codebase-nya kamu yang punya, debugging round 2 akan jauh lebih cepat dibanding kalau kamu yang ngoding dari nol.
