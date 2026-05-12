type FooterProps = {
  lastUpdated: string;
};

export default function Footer({ lastUpdated }: FooterProps) {
  return (
    <footer className="px-4 py-3 border-t border-black/[0.08] text-center">
      <p className="text-[10px] text-gray-400">
        Data: Yahoo Finance · Terakhir diperbarui {lastUpdated}
      </p>
    </footer>
  );
}
