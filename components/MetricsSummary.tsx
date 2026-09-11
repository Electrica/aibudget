'use client';

import React from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PiggyBank, 
  Coffee, 
  ArrowUpRight, 
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';
import { CalculationResult, InvestmentScenario } from '@/lib/finance-types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/finance-calculator';

interface MetricsSummaryProps {
  result: CalculationResult;
  scenario: InvestmentScenario;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ result, scenario }) => {
  const currency = scenario.currency;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-summary-cards">
      {/* 1. Final Capital */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Итоговый капитал</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {formatCurrency(result.finalNominalCapital, currency)}
        </div>

        <div className="mt-2 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>С учетом инфляции ({scenario.inflationRate}%):</span>
            <span className="font-semibold text-slate-900">
              {formatCurrencyCompact(result.finalRealCapital, currency)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium pt-1 border-t border-slate-100">
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>В {result.multiplier}x раз больше внесенного</span>
          </div>
        </div>
      </div>

      {/* 2. Compound Interest Gains */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Прибыль от процентов</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-bold text-emerald-600 tracking-tight">
          +{formatCurrency(result.totalInterestEarned, currency)}
        </div>

        <div className="mt-2 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Доля сложного процента:</span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {result.interestSharePercent}% капитала
            </span>
          </div>
          <div className="text-slate-500 pt-1 border-t border-slate-100">
            {result.crossoverYear ? (
              <span className="text-amber-700 font-medium">
                ⚡ С {result.crossoverYear}-го года проценты &gt; годовых взносов
              </span>
            ) : (
              <span>Магия капитализации</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Total Contributed from Salary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Всего вложено из зарплаты</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          {formatCurrency(result.totalContributed, currency)}
        </div>

        <div className="mt-2 flex flex-col gap-1 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span>Стартовый капитал:</span>
            <span className="font-semibold text-slate-900">
              {formatCurrencyCompact(scenario.initialCapital, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500">
            <span>Срок инвестирования:</span>
            <span className="font-semibold text-slate-900">{scenario.investmentYears} лет</span>
          </div>
        </div>
      </div>

      {/* 4. Monthly Passive Income & FIRE */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Пассивный доход / мес</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Coffee className="w-4 h-4" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-bold text-amber-700 tracking-tight">
          {formatCurrency(result.monthlyPassiveIncomeRule4Percent, currency)}
        </div>

        <div className="mt-2 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>По правилу 4% в год:</span>
            </span>
            <span className="font-bold text-slate-900">
              {formatCurrencyCompact(result.monthlyPassiveIncomeRule4Percent, currency)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
            <span>При ставке {scenario.annualReturnRate}%:</span>
            <span className="font-semibold text-slate-700">
              {formatCurrencyCompact(result.monthlyPassiveIncomeAtRate, currency)}/мес
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
