"""
Fetch monthly IHSG data from Yahoo Finance.
Output: public/data/jkse-monthly.json
"""
import json
import sys
from pathlib import Path

import yfinance as yf

TICKER = "^JKSE"
OUTPUT_PATH = Path(__file__).parent.parent / "public" / "data" / "jkse-monthly.json"


def fetch_monthly() -> list[dict]:
    df = yf.download(TICKER, start="1990-01-01", interval="1mo", progress=False)
    if df.empty:
        raise RuntimeError("yfinance returned empty data")

    # Flatten MultiIndex columns if present (newer yfinance versions)
    if hasattr(df.columns, "levels"):
        df.columns = df.columns.droplevel(1)

    df = df[["Close"]].dropna()
    df.index = df.index.to_period("M").to_timestamp("M")

    return [
        {"date": d.strftime("%Y-%m-%d"), "close": round(float(c), 2)}
        for d, c in zip(df.index, df["Close"])
    ]


def validate(records: list[dict]) -> None:
    assert len(records) >= 300, f"Too few records: {len(records)}"
    assert all(r["close"] > 0 for r in records), "Non-positive close price found"
    dates = [r["date"] for r in records]
    assert dates == sorted(dates), "Dates not monotonically increasing"


def main() -> int:
    try:
        records = fetch_monthly()
        validate(records)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(records, indent=2))
    print(f"Wrote {len(records)} records to {OUTPUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
