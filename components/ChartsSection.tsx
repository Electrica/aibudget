'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { CalculationResult, InvestmentScenario } from '@/lib/finance-types';
import { formatCurrencyCompact, formatCurrency } from '@/lib/finance-calculator';
import { Layers, BarChart3, TrendingUp, Info } from 'lucide-react';

interface ChartsSectionProps {
  result: CalculationResult;
  scenario: InvestmentScenario;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  chartMode: 'cumulative' | 'annualFlow';
  currency: string;
  showRealInflation: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  chartMode,
  currency,
  showRealInflation,
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-xl text-xs space-y-2 min-w-[220px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold text-slate-800">
        <span>{label} (Возраст: {data.age} лет)</span>
        {data.milestone && (
          <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
            Метка
          </span>
        )}
      </div>

      {chartMode === 'cumulative' ? (
        <>
          <div className="flex justify-between items-center text-slate-900 font-bold text-sm">
            <span>Итоговый капитал:</span>
            <span className="text-blue-700">{formatCurrency(data.nominalTotal, currency)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Прибыль от %:
            </span>
            <span className="font-semibold text-emerald-600">
              {formatCurrency(data.interest, currency)}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Внесено вами:
            </span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(data.contributed, currency)}
            </span>
          </div>
          {showRealInflation && (
            <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-100">
              <span>С учетом инфляции:</span>
              <span className="font-semibold text-slate-700">
                {formatCurrency(data.realTotal, currency)}
              </span>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center text-emerald-700 font-bold text-sm">
            <span>Доход от % за год:</span>
            <span>{formatCurrency(data.yearlyInterest, currency)}</span>
          </div>
          <div className="flex justify-between items-center text-blue-700">
            <span>Внесено за год:</span>
            <span className="font-semibold">{formatCurrency(data.yearlyContribution, currency)}</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            {data.yearlyInterest >= data.yearlyContribution ? (
              <span className="text-emerald-700 font-semibold">
                ⚡ Инвестиции принесли больше, чем годовой вклад из зарплаты!
              </span>
            ) : (
              <span>Взносы пока превышают процентный доход</span>
            )}
          </div>
        </>
      )}

      {data.milestone && (
        <div className="text-[11px] font-medium text-indigo-700 bg-indigo-50 p-1.5 rounded-lg">
          {data.milestone}
        </div>
      )}
    </div>
  );
};

export const ChartsSection: React.FC<ChartsSectionProps> = ({ result, scenario }) => {
  const [chartMode, setChartMode] = useState<'cumulative' | 'annualFlow'>('cumulative');
  const [showRealInflation, setShowRealInflation] = useState<boolean>(true);

  const currency = scenario.currency;

  const chartData = result.projections.map((p) => ({
    year: `Год ${p.year}`,
    yearNum: p.year,
    age: p.age,
    contributed: p.totalContributed,
    interest: p.totalInterestEarned,
    nominalTotal: p.endingBalanceNominal,
    realTotal: p.endingBalanceReal,
    yearlyContribution: p.yearlyContribution,
    yearlyInterest: p.interestEarnedYear,
    milestone: p.milestone,
  }));

  const formatYAxis = (value: number) => {
    return formatCurrencyCompact(value, currency);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs" id="charts-section-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Наглядная динамика роста капитала</span>
          </h2>
          <p className="text-xs text-slate-500">
            {chartMode === 'cumulative' 
              ? 'Накопительный итог: сумма взносов против процентов сложного процента'
              : 'Годовой денежный поток: сколько внесли вы vs сколько заработал капитал'}
          </p>
        </div>

        {/* Chart View Switches */}
        <div className="flex flex-wrap items-center gap-2">
          {chartMode === 'cumulative' && (
            <label className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={showRealInflation}
                onChange={(e) => setShowRealInflation(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Поправка на инфляцию</span>
            </label>
          )}

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartMode('cumulative')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartMode === 'cumulative'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Накопительный капитал</span>
            </button>
            <button
              onClick={() => setChartMode('annualFlow')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartMode === 'annualFlow'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Доход за год vs Взносы</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-[360px] sm:h-[400px] w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'cumulative' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorContributed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={75}
              />
              <Tooltip
                content={(props: any) => (
                  <CustomTooltip
                    {...props}
                    chartMode={chartMode}
                    currency={currency}
                    showRealInflation={showRealInflation}
                  />
                )}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              />
              {scenario.targetCapital > 0 && (
                <ReferenceLine
                  y={scenario.targetCapital}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Цель: ${formatCurrencyCompact(scenario.targetCapital, currency)}`,
                    position: 'insideTopLeft',
                    fill: '#b91c1c',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="contributed"
                name="Собственные взносы"
                stackId="1"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorContributed)"
              />
              <Area
                type="monotone"
                dataKey="interest"
                name="Доход от сложных %"
                stackId="1"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#colorInterest)"
              />
              {showRealInflation && (
                <Area
                  type="monotone"
                  dataKey="realTotal"
                  name="Реальный капитал (с инфляцией)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  fill="none"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={75}
              />
              <Tooltip
                content={(props: any) => (
                  <CustomTooltip
                    {...props}
                    chartMode={chartMode}
                    currency={currency}
                    showRealInflation={showRealInflation}
                  />
                )}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="rect"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
              />
              <Bar
                dataKey="yearlyContribution"
                name="Внесено за год (з/п + бонус)"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="yearlyInterest"
                name="Процентный доход за год"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Insight banner below charts */}
      <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Суть сложного процента:</strong> В первые годы капитал прирастает в основном за счет ваших ежемесячных взносов из зарплаты. Однако после {result.crossoverYear ? `${result.crossoverYear}-го года` : 'нескольких лет'} накопленный процентный доход обгоняет новые вложения, запуская эффект финансового снежного кома.
        </div>
      </div>
    </div>
  );
};
