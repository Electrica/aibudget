'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  Target, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { CalculationResult, InvestmentScenario } from '@/lib/finance-types';
import { formatCurrency, formatCurrencyCompact } from '@/lib/finance-calculator';

interface FirePlanViewProps {
  result: CalculationResult;
  scenario: InvestmentScenario;
}

export const FirePlanView: React.FC<FirePlanViewProps> = ({ result, scenario }) => {
  const currency = scenario.currency;
  const [customMonthlyExpense, setCustomMonthlyExpense] = useState<number>(
    Math.round(scenario.monthlySalary * 0.7) // Default desired retirement expenses ~ 70% of current salary
  );

  // Capital needed according to 4% Rule (Capital = Annual Expenses * 25)
  const annualExpense = customMonthlyExpense * 12;
  const fireCapitalTarget = annualExpense * 25;

  // Find when projected nominal capital reaches fireCapitalTarget
  const fireYearReached = result.projections.find(
    (p) => p.endingBalanceNominal >= fireCapitalTarget
  )?.year;

  // Find when real (inflation adjusted) capital reaches fireCapitalTarget
  const realFireYearReached = result.projections.find(
    (p) => p.endingBalanceReal >= fireCapitalTarget
  )?.year;

  // Current progress towards FIRE goal based on final capital
  const progressPercent = Math.min(
    100,
    Math.round((result.finalNominalCapital / (fireCapitalTarget || 1)) * 100)
  );

  return (
    <div className="space-y-6" id="fire-plan-view">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Стратегия FIRE: Финансовая независимость и жизнь на пассивный доход</span>
            </h2>
            <p className="text-xs text-slate-500">
              FIRE (Financial Independence, Retire Early) — расчет капитала для жизни без необходимости работать
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Правило 4% (Trinity Study)</span>
          </div>
        </div>

        {/* Interactive Expense Input for Target FIRE */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Желаемые ежемесячные расходы на жизнь на пенсии / свободе:
            </label>
            <div className="relative">
              <input
                type="number"
                step="5000"
                min="10000"
                value={customMonthlyExpense}
                onChange={(e) => setCustomMonthlyExpense(Math.max(1000, Number(e.target.value)))}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">
                {currency}/мес
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              Годовые расходы: {formatCurrency(annualExpense, currency)}/год
            </span>
          </div>

          <div className="flex flex-col justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Необходимый капитал для вечной жизни на проценты (x25 расходов):
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {formatCurrency(fireCapitalTarget, currency)}
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              Снимая 4% в год, тело капитала никогда не истощается
            </div>
          </div>
        </div>

        {/* FIRE Progress & Timeline Result */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">
              Срок достижения FIRE:
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {fireYearReached ? `${fireYearReached} лет` : `Более ${scenario.investmentYears} лет`}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {fireYearReached 
                ? `В возрасте ${scenario.currentAge + fireYearReached} лет`
                : 'Увеличьте взнос или ставку доходности'}
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">
              С учетом инфляции ({scenario.inflationRate}%):
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {realFireYearReached ? `${realFireYearReached} лет` : `Более ${scenario.investmentYears} лет`}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Реальная покупательская способность
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 block">
              Покрытие цели к {scenario.investmentYears}-му году:
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {progressPercent}%
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              {result.finalNominalCapital >= fireCapitalTarget ? 'Цель перевыполнена! 🎉' : 'В процессе накопления'}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6">
          <div className="flex justify-between text-xs text-slate-600 font-medium mb-1.5">
            <span>Прогресс к финансовой независимости</span>
            <span className="font-bold text-slate-900">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Educational Guide Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-600" />
          <span>Как работает стратегия FIRE и сложный процент?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 font-semibold block">1. Норма сбережений (Savings Rate)</strong>
            <p>
              Чем больший процент от зарплаты вы инвестируете (например, 30-50% вместо 10%), тем быстрее наступает свобода. Удвоение нормы сбережений сокращает срок до пенсии в 2-3 раза.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 font-semibold block">2. Правило 4% (Безопасное изъятие)</strong>
            <p>
              Основано на исследовании Trinity Study: если забирать из диверсифицированного портфеля 4% в год, с вероятностью 95%+ капитал никогда не закончится на горизонте 30+ лет.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <strong className="text-slate-900 font-semibold block">3. Постоянная актуализация данных</strong>
            <p>
              Каждый раз при повышении зарплаты или индексации цен актуализируйте параметры в калькуляторе — это позволит держать финансовый горизонт под контролем.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
