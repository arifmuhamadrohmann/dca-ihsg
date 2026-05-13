type FooterProps = {
  lastUpdated: string;
};

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="px-6 py-8 bg-[#0e0f0c] mt-2">
      <p className="text-[13px] text-[#e8ebe6]">
        DCA Time Machine
      </p>
      <p className="text-[12px] text-[#868685] mt-1">
        Data: Yahoo Finance · Terakhir diperbarui {lastUpdated}
      </p>
    </footer>
  );
}
