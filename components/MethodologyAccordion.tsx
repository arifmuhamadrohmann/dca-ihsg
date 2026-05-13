'use client';

import { useState } from 'react';

export default function MethodologyAccordion() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-4 mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex justify-between items-center px-3.5 py-3 bg-soft rounded-lg text-[13px] text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <span>Metodologi &amp; asumsi</span>
        <span className="text-gray-400" style={{ display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▾
        </span>
      </button>
      {open && (
        <div className="mt-2 px-3.5 py-3 bg-soft rounded-lg text-[12px] text-gray-600 leading-relaxed space-y-3">
          <div>
            <p className="font-medium text-gray-800 mb-1">Sumber data</p>
            <p>Harga penutupan bulanan IHSG (<code>^JKSE</code>) dari Yahoo Finance via yfinance. Diperbarui otomatis setiap Senin.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">Asumsi</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Pembelian di harga penutupan akhir bulan</li>
              <li>Tidak ada biaya transaksi</li>
              <li>Tidak ada pajak final (0,1%)</li>
              <li>Dividen tidak diperhitungkan (price index)</li>
              <li>Unit fraksional diperbolehkan</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">Formula</p>
            <pre className="font-mono text-[11px] bg-white rounded p-2 overflow-x-auto whitespace-pre-wrap">
              {`unit_n = nominal / close_n\ntotal_unit = Σ unit_1..n\nnilai = total_unit × close_terakhir\nreturn% = (nilai − setoran) / setoran × 100`}
            </pre>
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1">XIRR</p>
            <p>Internal Rate of Return tahunan — memperhitungkan timing setiap setoran. Dihitung dengan metode Newton-Raphson.</p>
          </div>
        </div>
      )}
    </div>
  );
}
