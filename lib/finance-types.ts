export type SavingsRateType = 'percent' | 'fixed';
export type CompoundingFrequency = 'monthly' | 'quarterly' | 'annually';

export interface InvestmentScenario {
  id: string;
  name: string;
  color: string;
  currency: string;
  
  // Salary & Savings
  monthlySalary: number;
  salaryGrowthPercent: number; // annual raise %
  savingsRateType: SavingsRateType;
  savingsRateValue: number; // % of salary or fixed monthly amount
  annualBonus: number; // yearly extra savings
  
  // Investment parameters
  initialCapital: number;
  annualReturnRate: number; // %
  compoundingFrequency: CompoundingFrequency;
  investmentYears: number; // 1 to 40
  
  // Real economy & tax
  inflationRate: number; // %
  taxRatePercent: number; // % tax on capital gains (e.g. 0% for IIS or 13% NDFL)
  
  // Goals & Personal
  currentAge: number;
  targetCapital: number;
}

export interface YearlyProjection {
  year: number;
  age: number;
  monthlySalary: number;
  monthlyContribution: number;
  yearlyContribution: number;
  totalContributed: number;
  interestEarnedYear: number;
  totalInterestEarned: number;
  endingBalanceNominal: number;
  endingBalanceReal: number;
  monthlyPassiveIncomeAtRate: number;
  monthlyPassiveIncomeRule4Percent: number;
  milestone?: string;
}

export interface CalculationResult {
  projections: YearlyProjection[];
  finalNominalCapital: number;
  finalRealCapital: number;
  totalContributed: number;
  totalInterestEarned: number;
  interestSharePercent: number;
  multiplier: number; // finalCapital / totalContributed
  monthlyPassiveIncomeAtRate: number;
  monthlyPassiveIncomeRule4Percent: number;
  yearsToTargetCapital: number | null;
  yearsToFire: number | null; // year when safe passive income >= current salary
  crossoverYear: number | null; // year when annual investment return > annual salary contribution
}
