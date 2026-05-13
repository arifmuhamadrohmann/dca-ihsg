import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dollar Cost Average Apps',
  description:
    'Simulator Dollar Cost Averaging untuk IHSG. Kalau kamu DCA Rp X per bulan sejak tanggal Y, berapa hasilnya hari ini?',
  openGraph: {
    title: 'Dollar Cost Average Apps',
    description: 'Simulasi DCA historis untuk IHSG (^JKSE)',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dollar Cost Average Apps',
    description: 'Simulasi DCA historis untuk IHSG (^JKSE)',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
