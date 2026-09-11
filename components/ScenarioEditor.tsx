'use client';

import React from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  Sliders, 
  Calendar, 
  Percent, 
  Target, 
  HelpCircle,
  Clock,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { InvestmentScenario, SavingsRateType, CompoundingFrequency } from '@/lib/finance-types';
import { formatCurrency } from '@/lib/finance-calculator';

interface ScenarioEditorProps {
  scenario: InvestmentScenario;
  onChange: (updated: Partial<InvestmentScenario>) => void;
}

export const ScenarioEditor: React.FC<ScenarioEditorProps> = ({ scenario, onChange }) => {
  const currency = scenario.currency;

  const handleSavingsRateTypeChange = (type: SavingsRateType) => {
    if (type === scenario.savingsRateType) return;
    if (type === 'fixed') {
      // Convert current percent to roughly equivalent monthly amount
      const monthlyAmount = Math.round(scenario.monthlySalary * (scenario.savingsRateValue / 100));
      onChange({ savingsRateType: 'fixed', savingsRateValue: monthlyAmount || 30000 });
    } else {
      // Convert current fixed amount to percentage
      const percent = scenario.monthlySalary > 0 
        ? Math.min(100, Math.max(1, Math.round((scenario.savingsRateValue / scenario.monthlySalary) * 100))) 
        : 20;
      onChange({ savingsRateType: 'percent', savingsRateValue: percent });
    }
  };

  // Quick helper to compute current calculated monthly investment
  const currentMonthlyInvestment = scenario.savingsRateType === 'percent'
    ? Math.round(scenario.monthlySalary * (scenario.savingsRateValue / 100))
    : scenario.savingsRateValue;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs" id="scenario-editor-panel">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Параметры расчета и инвестиций</h2>
            <p className="text-xs text-slate-500">
              Меняйте параметры — прогноз пересчитывается мгновенно в реальном времени
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Горизонт: <strong className="text-slate-800">{scenario.investmentYears} лет</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* SECTION 1: Salary & Savings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Заработная плата и сбережения</span>
          </div>

          {/* Current Monthly Salary */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-monthly-salary">
                Зарплата в месяц (на руки)
              </label>
              <span className="text-xs font-bold text-blue-700">
                {formatCurrency(scenario.monthlySalary, currency)}
              </span>
            </div>
            <div className="relative">
              <input
                id="input-monthly-salary"
                type="number"
                min="0"
                step="5000"
                value={scenario.monthlySalary}
                onChange={(e) => onChange({ monthlySalary: Math.max(0, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                {currency}/мес
              </span>
            </div>
            <input
              type="range"
              min="20000"
              max="1000000"
              step="5000"
              value={scenario.monthlySalary}
              onChange={(e) => onChange({ monthlySalary: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2 accent-blue-600"
            />
          </div>

          {/* Annual Salary Growth % */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-salary-growth">
                Ежегодный рост / индексация зарплаты
              </label>
              <span className="text-xs font-bold text-blue-700">
                {scenario.salaryGrowthPercent}% в год
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="input-salary-growth"
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={scenario.salaryGrowthPercent}
                onChange={(e) => onChange({ salaryGrowthPercent: Number(e.target.value) })}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="w-18 text-right">
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={scenario.salaryGrowthPercent}
                  onChange={(e) => onChange({ salaryGrowthPercent: Math.max(0, Number(e.target.value)) })}
                  className="w-16 px-2 py-1 text-xs text-center bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Учитывает повышение квалификации, премии и карьерный рост
            </span>
          </div>

          {/* Savings Rate Mode & Value */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Доля для инвестирования
              </label>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSavingsRateTypeChange('percent')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    scenario.savingsRateType === 'percent'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  % от з/п
                </button>
                <button
                  type="button"
                  onClick={() => handleSavingsRateTypeChange('fixed')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    scenario.savingsRateType === 'fixed'
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  Фикс. сумма
                </button>
              </div>
            </div>

            {scenario.savingsRateType === 'percent' ? (
              <>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="80"
                    step="1"
                    value={scenario.savingsRateValue}
                    onChange={(e) => onChange({ savingsRateValue: Number(e.target.value) })}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="w-16 text-right">
                    <span className="text-sm font-bold text-slate-900">{scenario.savingsRateValue}%</span>
                  </div>
                </div>

                {/* Quick percent chips */}
                <div className="flex gap-1.5 mt-2">
                  {[10, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => onChange({ savingsRateValue: pct })}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded-md border transition-colors ${
                        scenario.savingsRateValue === pct
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={scenario.savingsRateValue}
                  onChange={(e) => onChange({ savingsRateValue: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                  {currency}/мес
                </span>
              </div>
            )}

            <div className="mt-2 text-xs text-slate-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100 flex items-center justify-between">
              <span>Сумма взноса сейчас:</span>
              <strong className="text-blue-800 font-bold">
                {formatCurrency(currentMonthlyInvestment, currency)}/мес
              </strong>
            </div>
          </div>

          {/* Annual Bonus to investments */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-annual-bonus">
                Ежегодный бонус / премия в инвестиции
              </label>
              <span className="text-xs font-medium text-slate-600">
                {formatCurrency(scenario.annualBonus, currency)}/год
              </span>
            </div>
            <input
              id="input-annual-bonus"
              type="number"
              min="0"
              step="10000"
              value={scenario.annualBonus}
              onChange={(e) => onChange({ annualBonus: Math.max(0, Number(e.target.value)) })}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        {/* SECTION 2: Investment Portfolio & Returns */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Инвестиционный портфель и доходность</span>
          </div>

          {/* Initial Capital */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-initial-capital">
                Стартовый капитал (накопления сейчас)
              </label>
              <span className="text-xs font-bold text-emerald-700">
                {formatCurrency(scenario.initialCapital, currency)}
              </span>
            </div>
            <div className="relative">
              <input
                id="input-initial-capital"
                type="number"
                min="0"
                step="10000"
                value={scenario.initialCapital}
                onChange={(e) => onChange({ initialCapital: Math.max(0, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {currency}
              </span>
            </div>
          </div>

          {/* Annual Return Rate % */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-return-rate">
                Ожидаемая доходность (% годовых)
              </label>
              <span className="text-sm font-bold text-emerald-700">
                {scenario.annualReturnRate}%
              </span>
            </div>
            <input
              id="input-return-rate"
              type="range"
              min="1"
              max="40"
              step="0.5"
              value={scenario.annualReturnRate}
              onChange={(e) => onChange({ annualReturnRate: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            {/* Quick return benchmark presets */}
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => onChange({ annualReturnRate: 11 })}
                className={`px-2 py-1 text-[11px] rounded-lg border text-center transition-colors ${
                  scenario.annualReturnRate === 11
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ОФЗ (11%)
              </button>
              <button
                type="button"
                onClick={() => onChange({ annualReturnRate: 16 })}
                className={`px-2 py-1 text-[11px] rounded-lg border text-center transition-colors ${
                  scenario.annualReturnRate === 16
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Индекс (16%)
              </button>
              <button
                type="button"
                onClick={() => onChange({ annualReturnRate: 22 })}
                className={`px-2 py-1 text-[11px] rounded-lg border text-center transition-colors ${
                  scenario.annualReturnRate === 22
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Акции (22%)
              </button>
            </div>
          </div>

          {/* Investment Years Horizon */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-investment-years">
                Срок инвестирования (горизонт)
              </label>
              <span className="text-sm font-bold text-slate-900">
                {scenario.investmentYears} лет (до {scenario.currentAge + scenario.investmentYears} лет)
              </span>
            </div>
            <input
              id="input-investment-years"
              type="range"
              min="1"
              max="40"
              step="1"
              value={scenario.investmentYears}
              onChange={(e) => onChange({ investmentYears: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>1 год</span>
              <span>10 лет</span>
              <span>20 лет</span>
              <span>30 лет</span>
              <span>40 лет</span>
            </div>
          </div>

          {/* Compounding Frequency */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Частота капитализации процентов
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['monthly', 'quarterly', 'annually'] as CompoundingFrequency[]).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => onChange({ compoundingFrequency: freq })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    scenario.compoundingFrequency === freq
                      ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {freq === 'monthly' ? 'Ежемесячно' : freq === 'quarterly' ? 'Ежеквартально' : 'Ежегодно'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3: Real Economy & Targets */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Инфляция, налоги и цели</span>
          </div>

          {/* Expected Inflation % */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-inflation-rate">
                Ожидаемая инфляция (% годовых)
              </label>
              <span className="text-xs font-bold text-amber-700">
                {scenario.inflationRate}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="input-inflation-rate"
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={scenario.inflationRate}
                onChange={(e) => onChange({ inflationRate: Number(e.target.value) })}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <span className="text-xs font-bold text-slate-800 w-12 text-right">
                {scenario.inflationRate}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Позволяет рассчитать реальную покупательскую способность капитала
            </span>
          </div>

          {/* Capital Gains Tax Rate */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Налог на доход (НДФЛ)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ taxRatePercent: 0 })}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium border ${
                    scenario.taxRatePercent === 0
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                  title="ИИС тип Б, долгосрочное владение акциями от 3 лет"
                >
                  0% (ИИС / ЛДВ)
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ taxRatePercent: 13 })}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium border ${
                    scenario.taxRatePercent === 13
                      ? 'bg-slate-100 border-slate-300 text-slate-800 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  13% (НДФЛ)
                </button>
              </div>
            </div>
          </div>

          {/* Current Age */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-current-age">
                Текущий возраст инвестора
              </label>
              <span className="text-xs font-bold text-slate-900">
                {scenario.currentAge} лет
              </span>
            </div>
            <input
              id="input-current-age"
              type="number"
              min="16"
              max="90"
              value={scenario.currentAge}
              onChange={(e) => onChange({ currentAge: Math.max(16, Number(e.target.value)) })}
              className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Target Capital Goal */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="input-target-capital">
                Целевой капитал (FIRE / Мечта)
              </label>
              <span className="text-xs font-bold text-indigo-700">
                {formatCurrency(scenario.targetCapital, currency)}
              </span>
            </div>
            <div className="relative">
              <input
                id="input-target-capital"
                type="number"
                min="0"
                step="500000"
                value={scenario.targetCapital}
                onChange={(e) => onChange({ targetCapital: Math.max(0, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
