"""
Convert CSV BI Rate (manual download dari bi.go.id) ke JSON.
Usage: python scripts/fetch_bi_rate.py input.csv

Expected CSV format (2 kolom, header wajib):
date,rate
2010-01-31,6.50
2010-02-28,6.50
"""
import csv
import json
import sys
from pathlib import Path
from datetime import datetime
from calendar import monthrange

OUTPUT = Path(__file__).parent.parent / "public" / "data" / "bi-rate-monthly.json"


def parse_csv(path: Path) -> list[dict]:
    records = []
    with open(path, newline='') as f:
        reader = csv.DictReader(f)
        for row in reader:
            d = datetime.fromisoformat(row['date'])
            last_day = monthrange(d.year, d.month)[1]
            iso = d.replace(day=last_day).strftime("%Y-%m-%d")
            records.append({"date": iso, "rate": float(row['rate'])})
    return sorted(records, key=lambda r: r['date'])


def fill_gaps(records: list[dict]) -> list[dict]:
    """BI Rate tidak berubah tiap bulan. Forward-fill bulan yang kosong."""
    if not records:
        return []
    filled = [records[0]]
    for r in records[1:]:
        last_date = datetime.fromisoformat(filled[-1]['date'])
        curr_date = datetime.fromisoformat(r['date'])
        m, y = last_date.month, last_date.year
        while True:
            m += 1
            if m > 12:
                m = 1
                y += 1
            if y > curr_date.year or (y == curr_date.year and m >= curr_date.month):
                break
            last_day = monthrange(y, m)[1]
            filled.append({"date": f"{y:04d}-{m:02d}-{last_day:02d}", "rate": filled[-1]['rate']})
        filled.append(r)
    return filled


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: python scripts/fetch_bi_rate.py input.csv", file=sys.stderr)
        return 1
    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"File not found: {input_path}", file=sys.stderr)
        return 1
    records = parse_csv(input_path)
    filled = fill_gaps(records)
    if len(filled) < 10:
        print(f"WARNING: hanya {len(filled)} records — cek format CSV", file=sys.stderr)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(filled, indent=2))
    print(f"Wrote {len(filled)} records to {OUTPUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
