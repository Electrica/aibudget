'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { InvestmentScenario, CalculationResult } from '@/lib/finance-types';
import { calculateProjections, formatCurrency, formatCurrencyCompact } from '@/lib/finance-calculator';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Sparkles, 
  Check, 
  Scale, 
  Trophy, 
  Edit3,
  Sliders
} from 'lucide-react';

interface ScenarioComparisonViewProps {
  scenarios: InvestmentScenario[];
  onUpdateScenarios: (scenarios: InvestmentScenario[]) => void;
  currency: string;
}

const PALETTE = ['#2563eb', '#059669', '#ea580c', '#7c3aed', '#db2777', '#0891b2'];

export const ScenarioComparisonView: React.FC<ScenarioComparisonViewProps> = ({
  scenarios,
  onUpdateScenarios,
  currency,
}) => {
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);

  // Compute calculation results for all scenarios
  const scenarioResults = scenarios.map((sc) => ({
    scenario: sc,
    result: calculateProjections(sc),
  }));

  // Find max years among all scenarios for aligned chart
  const maxYears = Math.max(...scenarios.map((s) => s.investmentYears), 15);

  // Prepare chart comparison data
  const chartData = Array.from({ length: maxYears }, (_, i) => {
    const year = i + 1;
    const entry: Record<string, any> = {
      year: `Год ${year}`,
      yearNum: year,
    };

    scenarioResults.forEach(({ scenario, result }) => {
      const point = result.projections.find((p) => p.year === year);
      entry[scenario.id] = point ? point.endingBalanceNominal : null;
    });

    return entry;
  });

  // Handle scenario duplication
  const handleDuplicate = (baseScenario: InvestmentScenario) => {
    if (scenarios.length >= 6) return;
    const newColor = PALETTE[scenarios.length % PALETTE.length];
    const newScenario: InvestmentScenario = {
      ...baseScenario,
      id: `sc-${Date.now()}`,
      name: `${baseScenario.name} (Копия)`,
      color: newColor,
    };
    onUpdateScenarios([...scenarios, newScenario]);
  };

  // Handle scenario deletion
  const handleDelete = (id: string) => {
    if (scenarios.length <= 1) return;
    onUpdateScenarios(scenarios.filter((s) => s.id !== id));
  };

  // Handle updating a specific scenario field
  const handleUpdateField = (id: string, updates: Partial<InvestmentScenario>) => {
    onUpdateScenarios(
      scenarios.map((sc) => (sc.id === id ? { ...sc, ...updates } : sc))
    );
  };

  // Find best scenario for KPI badges
  const bestCapitalScenario = [...scenarioResults].sort(
    (a, b) => b.result.finalNominalCapital - a.result.finalNominalCapital
  )[0]?.scenario;

  const editingScenario = scenarios.find((s) => s.id === editingScenarioId);

  return (
    <div className="space-y-6" id="scenario-comparison-view">
      {/* Header & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <span>Параллельное сравнение сценариев инвестирования</span>
            </h2>
            <p className="text-xs text-slate-500">
              Сравните несколько инвестиционных стратегий (консервативная vs агрессивная, разные взносы и сроки)
            </p>
          </div>

          <button
            onClick={() => handleDuplicate(scenarios[0])}
            disabled={scenarios.length >= 5}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить сценарий</span>
          </button>
        </div>

        {/* Multi-line comparison chart */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-700">
              Сравнительный график роста капитала (Номинал):
            </span>
            <span className="text-slate-400">
              Показывает отрыв доходностей во времени
            </span>
          </div>

          <div className="h-[340px] sm:h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickFormatter={(val) => formatCurrencyCompact(val, currency)}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  width={75}
                />
                <Tooltip
                  formatter={(value: any, name?: any) => {
                    const sc = scenarios.find((s) => s.id === name);
                    return [formatCurrency(Number(value), currency), sc?.name || String(name ?? '')];
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '0.75rem',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                />
                {scenarios.map((sc) => (
                  <Line
                    key={sc.id}
                    type="monotone"
                    dataKey={sc.id}
                    name={sc.name}
                    stroke={sc.color}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarioResults.map(({ scenario, result }, idx) => {
          const isWinner = scenario.id === bestCapitalScenario?.id && scenarios.length > 1;

          return (
            <div
              key={scenario.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all relative ${
                isWinner ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200'
              }`}
            >
              {isWinner && (
                <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Trophy className="w-3 h-3" />
                  <span>Максимальный капитал</span>
                </div>
              )}

              {/* Scenario title and color bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <input
                    type="text"
                    value={scenario.name}
                    onChange={(e) => handleUpdateField(scenario.id, { name: e.target.value })}
                    className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingScenarioId(editingScenarioId === scenario.id ? null : scenario.id)}
                    title="Настроить параметры"
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(scenario)}
                    title="Дублировать сценарий"
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {scenarios.length > 1 && (
                    <button
                      onClick={() => handleDelete(scenario.id)}
                      title="Удалить сценарий"
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Key numbers */}
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Итоговый капитал ({scenario.investmentYears} лет)
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {formatCurrency(result.finalNominalCapital, currency)}
                  </div>
                  <span className="text-xs text-slate-500 block">
                    С инфляцией: {formatCurrencyCompact(result.finalRealCapital, currency)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ставка годовых:</span>
                    <strong className="text-slate-800 text-sm">{scenario.annualReturnRate}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Доля сбережений:</span>
                    <strong className="text-slate-800 text-sm">
                      {scenario.savingsRateType === 'percent'
                        ? `${scenario.savingsRateValue}%`
                        : formatCurrencyCompact(scenario.savingsRateValue, currency)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Прибыль от %:</span>
                    <strong className="text-emerald-700 text-sm">
                      {formatCurrencyCompact(result.totalInterestEarned, currency)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Пассивный доход:</span>
                    <strong className="text-amber-700 text-sm">
                      {formatCurrencyCompact(result.monthlyPassiveIncomeRule4Percent, currency)}/мес
                    </strong>
                  </div>
                </div>

                {/* Progress bar of interest share */}
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Доля сложного процента:</span>
                    <span className="font-bold text-slate-800">{result.interestSharePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${result.interestSharePercent}%`,
                        backgroundColor: scenario.color,
                      }}
                    />
                  </div>
                </div>

                {/* Milestones / FIRE year */}
                <div className="pt-2 text-xs text-slate-600 flex flex-col gap-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Срок до FIRE:</span>
                    <strong className="text-indigo-700">
                      {result.yearsToFire ? `${result.yearsToFire} лет` : 'Больше срока'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Рост вложений:</span>
                    <strong className="text-slate-900">В {result.multiplier}x раз</strong>
                  </div>
                </div>
              </div>

              {/* In-place quick sliders if editing */}
              {editingScenarioId === scenario.id && (
                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Доходность:</span>
                      <span>{scenario.annualReturnRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="35"
                      step="0.5"
                      value={scenario.annualReturnRate}
                      onChange={(e) => handleUpdateField(scenario.id, { annualReturnRate: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Сбережения (%):</span>
                      <span>{scenario.savingsRateValue}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="70"
                      step="1"
                      value={scenario.savingsRateValue}
                      onChange={(e) => handleUpdateField(scenario.id, { savingsRateValue: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Горизонт (лет):</span>
                      <span>{scenario.investmentYears} лет</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      step="1"
                      value={scenario.investmentYears}
                      onChange={(e) => handleUpdateField(scenario.id, { investmentYears: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
