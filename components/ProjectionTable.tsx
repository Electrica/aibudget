'use client';

import React, { useState } from 'react';
import { 
  Table, 
  Download, 
  Filter, 
  Search, 
  Award, 
  Calendar,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { YearlyProjection, InvestmentScenario } from '@/lib/finance-types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/finance-calculator';

interface ProjectionTableProps {
  projections: YearlyProjection[];
  scenario: InvestmentScenario;
}

export const ProjectionTable: React.FC<ProjectionTableProps> = ({
  projections,
  scenario,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'milestones' | '5years'>('all');
  const currency = scenario.currency;

  // Filtered rows
  const displayedRows = projections.filter((p) => {
    if (filterMode === 'milestones') {
      return Boolean(p.milestone) || p.year === 1 || p.year === scenario.investmentYears;
    }
    if (filterMode === '5years') {
      return p.year % 5 === 0 || p.year === 1 || p.year === scenario.investmentYears;
    }
    return true;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Год',
      'Возраст',
      'Зарплата в мес',
      'Взнос в месяц',
      'Внесено за год',
      'Всего вложено',
      'Проценты за год',
      'Всего процентов',
      'Капитал (Номинал)',
      'Капитал (Реальный с инфляцией)',
      'Пассивный доход в мес (4%)',
      'Событие / Веха',
    ];

    const rows = projections.map((p) => [
      p.year,
      p.age,
      p.monthlySalary,
      p.monthlyContribution,
      p.yearlyContribution,
      p.totalContributed,
      p.interestEarnedYear,
      p.totalInterestEarned,
      p.endingBalanceNominal,
      p.endingBalanceReal,
      p.monthlyPassiveIncomeRule4Percent,
      `"${(p.milestone || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `investment-projection-${scenario.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="projection-table-card">
      {/* Header & Filter Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Детальный прогноз капитала по годам</span>
          </h2>
          <p className="text-xs text-slate-500">
            Пошаговая таблица капитализации, регулярных пополнений и покупательской способности
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Filter Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Все года ({projections.length})
            </button>
            <button
              onClick={() => setFilterMode('5years')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === '5years'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Каждые 5 лет
            </button>
            <button
              onClick={() => setFilterMode('milestones')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterMode === 'milestones'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ключевые вехи
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-colors"
            title="Скачать таблицу в формате Excel (CSV)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт в Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold sticky top-0 z-10 border-b border-slate-200">
            <tr>
              <th className="py-3 px-3.5">Год / Возраст</th>
              <th className="py-3 px-3">Зарплата</th>
              <th className="py-3 px-3">Взнос / мес</th>
              <th className="py-3 px-3">Внесено за год</th>
              <th className="py-3 px-3">Всего вложено</th>
              <th className="py-3 px-3 text-emerald-700 font-bold">Проценты за год</th>
              <th className="py-3 px-3 text-blue-800 font-bold">Капитал (Номинал)</th>
              <th className="py-3 px-3 text-amber-800">Реальный (-Инфл.)</th>
              <th className="py-3 px-3 text-slate-700">Пассивный доход</th>
              <th className="py-3 px-3.5">Событие / Веха</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedRows.map((row) => {
              const isHighlight = Boolean(row.milestone);
              const isCrossover = row.interestEarnedYear >= row.yearlyContribution;

              return (
                <tr
                  key={row.year}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isHighlight ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                    Год {row.year}{' '}
                    <span className="text-[11px] text-slate-400 font-normal">
                      ({row.age} лет)
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {formatCurrency(row.monthlySalary, currency)}
                  </td>

                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {formatCurrency(row.monthlyContribution, currency)}
                  </td>

                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap font-medium">
                    {formatCurrency(row.yearlyContribution, currency)}
                  </td>

                  <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                    {formatCurrency(row.totalContributed, currency)}
                  </td>

                  <td className={`py-3 px-3 font-semibold whitespace-nowrap ${
                    isCrossover ? 'text-emerald-600 font-bold' : 'text-slate-700'
                  }`}>
                    +{formatCurrency(row.interestEarnedYear, currency)}
                    {isCrossover && (
                      <span className="ml-1 text-[10px] text-emerald-700 bg-emerald-100/70 px-1 py-0.2 rounded font-normal">
                        &gt; взносов
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 font-bold text-blue-900 whitespace-nowrap text-sm">
                    {formatCurrency(row.endingBalanceNominal, currency)}
                  </td>

                  <td className="py-3 px-3 text-amber-800 whitespace-nowrap">
                    {formatCurrency(row.endingBalanceReal, currency)}
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                    {formatCurrency(row.monthlyPassiveIncomeRule4Percent, currency)}/мес
                  </td>

                  <td className="py-3 px-3.5 whitespace-nowrap">
                    {row.milestone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                        {row.milestone}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
