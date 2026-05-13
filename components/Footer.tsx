type FooterProps = {
  lastUpdated: string;
};

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="px-6 py-8 bg-[#0e0f0c] mt-2">
      <p className="text-[13px] text-[#e8ebe6]">Dollar Cost Average Apps</p>
      <p className="text-[12px] text-[#868685] mt-1">
        Data: Yahoo Finance · Terakhir diperbarui {lastUpdated}
      </p>
      <p className="text-[11px] text-[#868685] mt-3">
        Created by{' '}
        <a
          href="https://x.com/arif_muhamadroh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9fe870] hover:text-[#cdffad] transition-colors"
        >
          @arif_muhamadroh
        </a>
      </p>
    </footer>
  );
}
