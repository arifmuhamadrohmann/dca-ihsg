declare module 'xirr' {
  interface Cashflow {
    amount: number;
    when: Date;
  }
  function xirr(cashflows: Cashflow[], options?: { guess?: number }): number;
  export = xirr;
}
