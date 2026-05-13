'use client';

import { useState } from 'react';
import { toPng } from 'html-to-image';

export default function ActionsBar() {
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);

  async function handleSavePNG() {
    const node = document.getElementById('export-card');
    if (!node) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'dca-ihsg.png';
      link.href = dataUrl;
      link.click();
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: 'DCA Time Machine IHSG', url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  return (
    <div className="mx-6 mb-5 grid grid-cols-2 gap-2">
      <button
        onClick={handleSavePNG}
        disabled={saving}
        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[24px] text-[13px] font-semibold text-[#0e0f0c] bg-[#e8ebe6] hover:bg-[#d4d8d1] transition-colors disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan PNG'}
      </button>
      <button
        onClick={handleShare}
        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[24px] text-[13px] font-semibold text-[#0e0f0c] bg-[#9fe870] hover:bg-[#cdffad] transition-colors"
      >
        {shared ? '✓ Disalin' : 'Bagikan'}
      </button>
    </div>
  );
}
