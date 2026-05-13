'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Simulator' },
  { href: '/compare', label: 'Compare' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="px-6 py-4 bg-[#0e0f0c]">
      <div className="text-[18px] font-bold text-[#e8ebe6] tracking-tight mb-2">
        Dollar Cost Average Apps
      </div>
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#9fe870] text-[#0e0f0c]'
                  : 'text-[#868685] hover:text-[#e8ebe6] hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
