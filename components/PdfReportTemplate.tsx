'use client';

import React from 'react';
import { InvestmentScenario, CalculationResult } from '@/lib/finance-types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/finance-calculator';

interface PdfReportTemplateProps {
  scenario: InvestmentScenario;
  result: CalculationResult;
  comparisonScenarios?: InvestmentScenario[];
}

export const PdfReportTemplate: React.FC<PdfReportTemplateProps> = ({
  scenario,
  result,
  comparisonScenarios = [],
}) => {
  const currency = scenario.currency;
  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Pick key milestone years for printable table
  const keyProjections = result.projections.filter((p) => {
    if (result.projections.length <= 15) return true;
    return (
      p.year === 1 ||
      p.year === 2 ||
      p.year === 3 ||
      p.year === 5 ||
      p.year === 7 ||
      p.year === 10 ||
      p.year === 15 ||
      p.year === 20 ||
      p.year === 25 ||
      p.year === 30 ||
      p.year === scenario.investmentYears ||
      Boolean(p.milestone)
    );
  });

  return (
    <div
      id="pdf-export-container"
      className="bg-white text-slate-900 p-8 max-w-[850px] mx-auto border border-slate-200"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Отчет: Прогноз роста капитала и инвестиций
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Сгенерировано: {today} • Сценарий: <strong className="text-slate-800">{scenario.name}</strong>
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded text-xs border border-blue-200">
            Горизонт: {scenario.investmentYears} лет
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Итоговый капитал</div>
          <div className="text-base font-bold text-blue-800 mt-1">
            {formatCurrency(result.finalNominalCapital, currency)}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            С инфляцией: {formatCurrencyCompact(result.finalRealCapital, currency)}
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Прибыль от %</div>
          <div className="text-base font-bold text-emerald-700 mt-1">
            +{formatCurrency(result.totalInterestEarned, currency)}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">
            {result.interestSharePercent}% от капитала
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Внесено из зарплаты</div>
          <div className="text-base font-bold text-slate-800 mt-1">
            {formatCurrency(result.totalContributed, currency)}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            Рост вложений: в {result.multiplier}x
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Пассивный доход / мес</div>
          <div className="text-base font-bold text-amber-700 mt-1">
            {formatCurrency(result.monthlyPassiveIncomeRule4Percent, currency)}
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            по правилу 4% в год
          </div>
        </div>
      </div>

      {/* Input Parameters Summary */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
          Исходные параметры расчета
        </h2>
        <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-slate-500">Зарплата в месяц: </span>
            <strong className="text-slate-900">{formatCurrency(scenario.monthlySalary, currency)}</strong>
          </div>
          <div>
            <span className="text-slate-500">Рост зарплаты в год: </span>
            <strong className="text-slate-900">{scenario.salaryGrowthPercent}%</strong>
          </div>
          <div>
            <span className="text-slate-500">Норма сбережений: </span>
            <strong className="text-slate-900">
              {scenario.savingsRateType === 'percent' ? `${scenario.savingsRateValue}%` : formatCurrency(scenario.savingsRateValue, currency)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Стартовый капитал: </span>
            <strong className="text-slate-900">{formatCurrency(scenario.initialCapital, currency)}</strong>
          </div>
          <div>
            <span className="text-slate-500">Ожидаемая доходность: </span>
            <strong className="text-slate-900">{scenario.annualReturnRate}% годовых</strong>
          </div>
          <div>
            <span className="text-slate-500">Инфляция: </span>
            <strong className="text-slate-900">{scenario.inflationRate}%</strong>
          </div>
          <div>
            <span className="text-slate-500">Капитализация: </span>
            <strong className="text-slate-900">
              {scenario.compoundingFrequency === 'monthly' ? 'Ежемесячно' : 'Ежегодно'}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Ежегодный бонус: </span>
            <strong className="text-slate-900">{formatCurrency(scenario.annualBonus, currency)}</strong>
          </div>
          <div>
            <span className="text-slate-500">Возраст инвестора: </span>
            <strong className="text-slate-900">{scenario.currentAge} лет</strong>
          </div>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
          Прогнозная динамика капитала по годам
        </h2>
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
              <th className="py-1.5 px-2">Год (возраст)</th>
              <th className="py-1.5 px-2">Зарплата/мес</th>
              <th className="py-1.5 px-2">Внесено за год</th>
              <th className="py-1.5 px-2">Всего вложено</th>
              <th className="py-1.5 px-2 text-emerald-700">Проценты за год</th>
              <th className="py-1.5 px-2 text-blue-900 font-bold">Капитал (Номинал)</th>
              <th className="py-1.5 px-2">С инфляцией</th>
              <th className="py-1.5 px-2">Пассивный доход</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {keyProjections.map((row) => (
              <tr key={row.year} className="hover:bg-slate-50">
                <td className="py-1.5 px-2 font-bold text-slate-900">
                  Год {row.year} ({row.age} л.)
                </td>
                <td className="py-1.5 px-2">{formatCurrency(row.monthlySalary, currency)}</td>
                <td className="py-1.5 px-2">{formatCurrency(row.yearlyContribution, currency)}</td>
                <td className="py-1.5 px-2">{formatCurrency(row.totalContributed, currency)}</td>
                <td className="py-1.5 px-2 font-semibold text-emerald-700">
                  +{formatCurrency(row.interestEarnedYear, currency)}
                </td>
                <td className="py-1.5 px-2 font-bold text-blue-900">
                  {formatCurrency(row.endingBalanceNominal, currency)}
                </td>
                <td className="py-1.5 px-2 text-slate-700">
                  {formatCurrency(row.endingBalanceReal, currency)}
                </td>
                <td className="py-1.5 px-2 font-medium text-amber-800">
                  {formatCurrency(row.monthlyPassiveIncomeRule4Percent, currency)}/мес
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Notes */}
      <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 flex justify-between items-center">
        <span>
          Расчет носит моделирующий характер и основан на математической формуле сложного процента с регулярными довнесениями.
        </span>
        <span className="font-semibold text-slate-700">Капитал & Инвестиции</span>
      </div>
    </div>
  );
};
