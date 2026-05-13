'use client';

import { useState } from 'react';

export default function CompareMethodologyAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-6 mb-5 rounded-[16px] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex justify-between items-center px-4 py-3 bg-[#e8ebe6] text-[13px] text-[#454745] hover:bg-[#d4d8d1] transition-colors"
      >
        <span>Metodologi &amp; asumsi</span>
        <span
          className="text-[#868685]"
          style={{
            display: 'inline-block',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="px-4 py-4 bg-canvas text-[12px] text-[#454745] leading-relaxed space-y-4">
          {/* Data sources */}
          <div>
            <p className="font-semibold text-[#0e0f0c] mb-1">Sumber data</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>
                <strong>IHSG</strong> — harga penutupan bulanan (<code>^JKSE</code>) dari Yahoo
                Finance via yfinance. Diperbarui otomatis setiap Senin.
              </li>
            </ul>
          </div>

          {/* 4 strategies */}
          <div>
            <p className="font-semibold text-[#0e0f0c] mb-2">2 Strategi yang dibandingkan</p>
            <div className="space-y-3">
              <div className="pl-3 border-l-2 border-[#1a6b55]">
                <p className="font-semibold text-[#0e0f0c]">DCA IHSG</p>
                <p>
                  Investasi nominal tetap setiap bulan ke IHSG. Unit yang diperoleh ={' '}
                  <code>nominal / close_bulan</code>. Total unit diakumulasi, nilai akhir ={' '}
                  <code>total_unit × close_terakhir</code>.
                </p>
              </div>
              <div className="pl-3 border-l-2 border-[#1a4d8f]">
                <p className="font-semibold text-[#0e0f0c]">Lump sum IHSG</p>
                <p>
                  Seluruh modal (<code>nominal × jumlah_bulan</code>) diinvestasikan sekaligus di
                  awal periode pada harga IHSG bulan pertama. Tidak ada setoran bulanan berikutnya.
                </p>
              </div>
            </div>
          </div>

          {/* Common assumptions */}
          <div>
            <p className="font-semibold text-[#0e0f0c] mb-1">Asumsi umum</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Pembelian IHSG di harga penutupan akhir bulan</li>
              <li>Tidak ada biaya transaksi &amp; pajak</li>
              <li>Dividen tidak diperhitungkan (IHSG price index)</li>

              <li>Unit/saldo fraksional diperbolehkan</li>
            </ul>
          </div>

          {/* XIRR */}
          <div>
            <p className="font-semibold text-[#0e0f0c] mb-1">XIRR</p>
            <p>
              Internal Rate of Return tahunan yang memperhitungkan timing setiap arus kas — setoran
              bulanan (DCA) atau setoran tunggal di awal (Lump sum). Memungkinkan perbandingan
              apples-to-apples antar strategi yang berbeda pola setorannya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
