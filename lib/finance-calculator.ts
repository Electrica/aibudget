import { InvestmentScenario, YearlyProjection, CalculationResult } from './finance-types';

export function calculateProjections(scenario: InvestmentScenario): CalculationResult {
  const {
    initialCapital,
    monthlySalary,
    salaryGrowthPercent,
    savingsRateType,
    savingsRateValue,
    annualBonus,
    annualReturnRate,
    compoundingFrequency,
    investmentYears,
    inflationRate,
    taxRatePercent,
    currentAge,
    targetCapital,
  } = scenario;

  // Effective annual interest rate after tax
  const effectiveAnnualRate = (annualReturnRate * (1 - Math.max(0, taxRatePercent) / 100)) / 100;
  
  // Compounding periods per year
  const periodsPerYear = compoundingFrequency === 'monthly' ? 12 : compoundingFrequency === 'quarterly' ? 4 : 1;
  const ratePerPeriod = effectiveAnnualRate / periodsPerYear;

  const projections: YearlyProjection[] = [];
  let currentBalance = initialCapital;
  let totalContributed = initialCapital;
  let totalInterestEarned = 0;

  let yearsToTargetCapital: number | null = null;
  let yearsToFire: number | null = null;
  let crossoverYear: number | null = null;

  for (let year = 1; year <= investmentYears; year++) {
    // Current year salary with growth
    const salaryGrowthFactor = Math.pow(1 + salaryGrowthPercent / 100, year - 1);
    const currentYearMonthlySalary = Math.round(monthlySalary * salaryGrowthFactor);
    
    // Monthly contribution
    const monthlyContribution = savingsRateType === 'percent'
      ? Math.round(currentYearMonthlySalary * (savingsRateValue / 100))
      : Math.round(savingsRateValue);
    
    const yearlySalaryContribution = monthlyContribution * 12;
    const yearlyTotalContribution = yearlySalaryContribution + annualBonus;
    
    const yearStartBalance = currentBalance;
    const contributionPerPeriod = yearlyTotalContribution / periodsPerYear;

    // Simulate compounding across periods in the year
    for (let p = 0; p < periodsPerYear; p++) {
      // Interest on existing balance
      const interestPeriod = currentBalance * ratePerPeriod;
      currentBalance += interestPeriod;
      // Add periodic contribution
      currentBalance += contributionPerPeriod;
    }

    const yearEndBalance = currentBalance;
    const interestEarnedYear = yearEndBalance - yearStartBalance - yearlyTotalContribution;
    
    totalContributed += yearlyTotalContribution;
    totalInterestEarned += interestEarnedYear;

    // Inflation discounting for real purchasing power
    const accumulatedInflation = Math.pow(1 + inflationRate / 100, year);
    const endingBalanceReal = Math.round(yearEndBalance / accumulatedInflation);

    // Passive monthly income
    const monthlyPassiveIncomeAtRate = Math.round((yearEndBalance * (annualReturnRate / 100)) / 12);
    const monthlyPassiveIncomeRule4Percent = Math.round((yearEndBalance * 0.04) / 12);

    // Milestones detection
    let milestone: string | undefined = undefined;
    if (targetCapital > 0 && yearEndBalance >= targetCapital && yearsToTargetCapital === null) {
      yearsToTargetCapital = year;
      milestone = `🎯 Цель достигнута (${formatCurrencyCompact(targetCapital, scenario.currency)})`;
    }

    if (monthlyPassiveIncomeRule4Percent >= currentYearMonthlySalary && yearsToFire === null) {
      yearsToFire = year;
      milestone = milestone ? `${milestone} • 🏖️ Финансовая свобода (FIRE)` : '🏖️ Финансовая свобода (FIRE)';
    }

    if (interestEarnedYear >= yearlyTotalContribution && crossoverYear === null) {
      crossoverYear = year;
      if (!milestone) {
        milestone = '⚡ Доход от инвестиций превысил взносы!';
      }
    }

    projections.push({
      year,
      age: currentAge + year,
      monthlySalary: currentYearMonthlySalary,
      monthlyContribution,
      yearlyContribution: yearlyTotalContribution,
      totalContributed: Math.round(totalContributed),
      interestEarnedYear: Math.round(interestEarnedYear),
      totalInterestEarned: Math.round(totalInterestEarned),
      endingBalanceNominal: Math.round(yearEndBalance),
      endingBalanceReal,
      monthlyPassiveIncomeAtRate,
      monthlyPassiveIncomeRule4Percent,
      milestone,
    });
  }

  const finalNominalCapital = Math.round(currentBalance);
  const finalRealCapital = projections[projections.length - 1]?.endingBalanceReal || finalNominalCapital;
  const multiplier = totalContributed > 0 ? Number((finalNominalCapital / totalContributed).toFixed(2)) : 1;
  const interestSharePercent = finalNominalCapital > 0 ? Number(((totalInterestEarned / finalNominalCapital) * 100).toFixed(1)) : 0;

  return {
    projections,
    finalNominalCapital,
    finalRealCapital,
    totalContributed: Math.round(totalContributed),
    totalInterestEarned: Math.round(totalInterestEarned),
    interestSharePercent,
    multiplier,
    monthlyPassiveIncomeAtRate: Math.round((finalNominalCapital * (annualReturnRate / 100)) / 12),
    monthlyPassiveIncomeRule4Percent: Math.round((finalNominalCapital * 0.04) / 12),
    yearsToTargetCapital,
    yearsToFire,
    crossoverYear,
  };
}

export function formatCurrency(amount: number, currency: string = '₽'): string {
  if (isNaN(amount)) return `0 ${currency}`;
  const formatted = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function formatCurrencyCompact(amount: number, currency: string = '₽'): string {
  if (isNaN(amount)) return `0 ${currency}`;
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(2)} млрд ${currency}`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)} млн ${currency}`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} тыс. ${currency}`;
  }
  return `${amount} ${currency}`;
}

export const PRESET_SCENARIOS: Record<string, Partial<InvestmentScenario>> = {
  balanced: {
    name: 'Сбалансированный (Индексы + Облигации)',
    annualReturnRate: 15,
    inflationRate: 7,
    savingsRateType: 'percent',
    savingsRateValue: 20,
    salaryGrowthPercent: 7,
    compoundingFrequency: 'monthly',
    investmentYears: 15,
    taxRatePercent: 0,
    color: '#2563eb', // blue
  },
  conservative: {
    name: 'Консервативный (Вклады + ОФЗ)',
    annualReturnRate: 11,
    inflationRate: 7,
    savingsRateType: 'percent',
    savingsRateValue: 15,
    salaryGrowthPercent: 5,
    compoundingFrequency: 'monthly',
    investmentYears: 15,
    taxRatePercent: 0,
    color: '#059669', // emerald
  },
  aggressive: {
    name: 'Агрессивный (Акции роста + Крипта)',
    annualReturnRate: 22,
    inflationRate: 7,
    savingsRateType: 'percent',
    savingsRateValue: 30,
    salaryGrowthPercent: 10,
    compoundingFrequency: 'monthly',
    investmentYears: 15,
    taxRatePercent: 13,
    color: '#d97706', // amber
  },
  fire: {
    name: 'Ранняя пенсия (FIRE за 10-12 лет)',
    annualReturnRate: 16,
    inflationRate: 7,
    savingsRateType: 'percent',
    savingsRateValue: 50,
    salaryGrowthPercent: 12,
    compoundingFrequency: 'monthly',
    investmentYears: 12,
    taxRatePercent: 0,
    color: '#7c3aed', // violet
  },
};

export const DEFAULT_PRIMARY_SCENARIO: InvestmentScenario = {
  id: 'sc-primary',
  name: 'Основной план',
  color: '#2563eb',
  currency: '₽',
  monthlySalary: 150000,
  salaryGrowthPercent: 8,
  savingsRateType: 'percent',
  savingsRateValue: 25,
  annualBonus: 100000,
  initialCapital: 300000,
  annualReturnRate: 16,
  compoundingFrequency: 'monthly',
  investmentYears: 15,
  inflationRate: 7,
  taxRatePercent: 0,
  currentAge: 28,
  targetCapital: 25000000,
};

export const DEFAULT_COMPARISON_SCENARIOS: InvestmentScenario[] = [
  DEFAULT_PRIMARY_SCENARIO,
  {
    id: 'sc-conservative',
    name: 'Консервативный (Вклады / ОФЗ 11%)',
    color: '#059669',
    currency: '₽',
    monthlySalary: 150000,
    salaryGrowthPercent: 8,
    savingsRateType: 'percent',
    savingsRateValue: 25,
    annualBonus: 100000,
    initialCapital: 300000,
    annualReturnRate: 11,
    compoundingFrequency: 'monthly',
    investmentYears: 15,
    inflationRate: 7,
    taxRatePercent: 0,
    currentAge: 28,
    targetCapital: 25000000,
  },
  {
    id: 'sc-aggressive',
    name: 'Агрессивный (Акции роста 22%)',
    color: '#ea580c',
    currency: '₽',
    monthlySalary: 150000,
    salaryGrowthPercent: 10,
    savingsRateType: 'percent',
    savingsRateValue: 35,
    annualBonus: 150000,
    initialCapital: 300000,
    annualReturnRate: 22,
    compoundingFrequency: 'monthly',
    investmentYears: 15,
    inflationRate: 7,
    taxRatePercent: 13,
    currentAge: 28,
    targetCapital: 25000000,
  },
];
