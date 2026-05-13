'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Simulator' },
  { href: '/compare', label: 'Compare Lab' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="px-6 py-4 bg-canvas border-b border-black/[0.06]">
      <div className="flex items-center justify-between">
        {/* Left: title + nav */}
        <div className="flex flex-col gap-2">
          <div className="text-[18px] font-bold text-ink tracking-tight">DCA Time Machine</div>
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#9fe870] text-[#0e0f0c]'
                      : 'text-[#868685] hover:text-ink hover:bg-[#e8ebe6]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: icon links */}
        <div className="flex gap-3 items-center justify-end">
          <Link
            href="/about"
            aria-label="About"
            className="text-[13px] font-semibold text-[#868685] hover:text-ink transition-colors"
          >
            i
          </Link>
          <a
            href="https://github.com/arifmuhamadrohman/dca-ihsg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="text-[13px] font-mono text-[#868685] hover:text-ink transition-colors"
          >
            {'{ }'}
          </a>
        </div>
      </div>
    </header>
  );
}
