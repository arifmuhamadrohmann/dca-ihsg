import Link from 'next/link';

export default function Header() {
  return (
    <header className="px-4 py-4 border-b border-black/[0.08] flex justify-between items-center bg-card">
      <div>
        <div className="text-[15px] font-medium text-gray-900">DCA Time Machine</div>
        <div className="text-[11px] text-gray-400">IHSG · ^JKSE</div>
      </div>
      <div className="flex gap-3 items-center">
        <Link href="/about" aria-label="About" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">
          i
        </Link>
        <a
          href="https://github.com/arifmuhamadrohman/dca-ihsg"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          className="text-gray-400 hover:text-gray-900 text-sm font-mono transition-colors"
        >
          {'{ }'}
        </a>
      </div>
    </header>
  );
}
