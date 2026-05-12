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
