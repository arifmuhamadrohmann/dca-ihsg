import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'DCA Time Machine IHSG';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ background: '#FAFAF7', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, fontFamily: 'sans-serif' }}>
        <div style={{ fontSize: 56, fontWeight: 500, color: '#1A1A19', marginBottom: 16 }}>DCA Time Machine</div>
        <div style={{ fontSize: 28, color: '#1D9E75', marginBottom: 32 }}>IHSG · ^JKSE</div>
        <div style={{ fontSize: 20, color: '#5F5E5A', textAlign: 'center', maxWidth: 700 }}>
          Simulasi Dollar Cost Averaging historis untuk IHSG. Eksplorasi: kalau kamu DCA Rp X per bulan sejak tanggal Y, berapa hasilnya?
        </div>
      </div>
    ),
    size
  );
}
