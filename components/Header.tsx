import Link from 'next/link';

export default function Header() {
  return (
    <header className="px-6 py-4 bg-canvas border-b border-black/[0.06] flex justify-between items-center">
      <div>
        <div className="text-[15px] font-semibold text-ink tracking-tight">DCA Time Machine</div>
        <div className="flex items-center gap-2 mt-0.5">
          <Link href="/" className="text-[12px] font-semibold text-[#868685] hover:text-ink transition-colors">
            Simulator
          </Link>
          <span className="text-[12px] text-[#e8ebe6]">·</span>
          <Link href="/compare" className="text-[12px] font-semibold text-[#868685] hover:text-ink transition-colors">
            Compare Lab
          </Link>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <Link href="/about" aria-label="About" className="text-[13px] font-semibold text-[#868685] hover:text-ink transition-colors">
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
    </header>
  );
}
