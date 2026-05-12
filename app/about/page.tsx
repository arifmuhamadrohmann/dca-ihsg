import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-page min-h-screen">
      <div className="max-w-[720px] mx-auto bg-card min-h-screen px-4 py-6 shadow-sm">
        <div className="mb-6">
          <Link href="/" className="text-[13px] text-gray-400 hover:text-gray-700 transition-colors">
            ← Kembali
          </Link>
        </div>
        <h1 className="text-xl font-medium text-gray-900 mb-2">DCA Time Machine IHSG</h1>
        <p className="text-[13px] text-gray-500 mb-8">
          Simulator Dollar Cost Averaging untuk IHSG, dibuat sebagai portfolio piece.
        </p>
        <section className="mb-6">
          <h2 className="text-[15px] font-medium text-gray-800 mb-2">Pembuat</h2>
          <p className="text-[13px] text-gray-600">Muhamad Arif Rohman — software engineer.</p>
        </section>
        <section className="mb-6">
          <h2 className="text-[15px] font-medium text-gray-800 mb-2">Tech stack</h2>
          <ul className="text-[13px] text-gray-600 space-y-1 list-disc list-inside">
            <li>Next.js 14 (App Router) · TypeScript strict</li>
            <li>Tailwind CSS · Recharts</li>
            <li>yfinance (Python) · GitHub Actions · Vercel</li>
          </ul>
        </section>
        <section className="mb-6">
          <h2 className="text-[15px] font-medium text-gray-800 mb-2">Source code</h2>
          <a href="https://github.com/arifmuhamadrohman/dca-ihsg" target="_blank" rel="noopener noreferrer" className="text-[13px] text-brand-success hover:underline">
            github.com/arifmuhamadrohman/dca-ihsg
          </a>
        </section>
        <p className="text-[11px] text-gray-400 border-t border-black/[0.08] pt-4 mt-8">
          Simulasi historis bukan jaminan kinerja masa depan. Bukan rekomendasi investasi.
        </p>
      </div>
    </div>
  );
}
