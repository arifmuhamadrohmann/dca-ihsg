export type MonthlyPrice = {
  date: string;
  close: number;
};

export type DCAInput = {
  monthlyAmount: number;
  startDate: Date;
  endDate: Date;
  prices: MonthlyPrice[];
};

export type DCAStep = {
  date: string;
  amountInvested: number;
  cumulativeInvested: number;
  unitsBought: number;
  cumulativeUnits: number;
  portfolioValue: number;
};

export type DCAResult = {
  steps: DCAStep[];
  totalInvested: number;
  finalValue: number;
  gain: number;
  returnPct: number;
  xirr: number;
  monthsInvested: number;
  periodLabel: string;
};

export type CrisisMarker = {
  year: number;
  label: string;
  startDate: string;
  endDate: string;
};

// ─── Phase B types ────────────────────────────────────────────────────────────

export type Strategy =
  | 'dca-ihsg'
  | 'lumpsum-ihsg'
  | 'dca-deposito'
  | 'lumpsum-deposito';

export type StrategyStep = {
  date: string;
  value: number;
  invested: number;
};

export type StrategyResult = {
  strategy: Strategy;
  label: string;
  steps: StrategyStep[];
  totalInvested: number;
  finalValue: number;
  gain: number;
  returnPct: number;
  xirr: number;
};

export type BIRate = {
  date: string; // "YYYY-MM-DD" hari terakhir bulan
  rate: number; // annual rate, e.g. 6.50 = 6.50% per tahun
};

export type ComparisonInput = {
  monthlyAmount: number;
  startDate: Date;
  endDate: Date;
  strategies: Strategy[];
  ihsgPrices: MonthlyPrice[];
  biRates: BIRate[];
};

export type ComparisonResult = {
  input: ComparisonInput;
  strategies: StrategyResult[];
  winner: Strategy;
  loser: Strategy;
};

export type AIAnalysis = {
  summary: string;
  winnerExplanation: string;
  contextAnalysis: string;
  importantNotes: string;
  generatedAt: string;
  fromCache: boolean;
};
