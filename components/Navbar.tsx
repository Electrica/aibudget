'use client';

import React from 'react';
import { 
  TrendingUp, 
  FileDown, 
  RefreshCw, 
  Download, 
  Upload, 
  Sparkles,
  Check
} from 'lucide-react';
import { InvestmentScenario } from '@/lib/finance-types';
import { PRESET_SCENARIOS } from '@/lib/finance-calculator';

interface NavbarProps {
  scenario: InvestmentScenario;
  onUpdateScenario: (updated: Partial<InvestmentScenario>) => void;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onResetToDefault: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveStatus: string;
}

const CURRENCIES = [
  { symbol: '₽', name: 'Рубли (RUB)' },
  { symbol: '$', name: 'Доллары (USD)' },
  { symbol: '€', name: 'Евро (EUR)' },
  { symbol: '₸', name: 'Тенге (KZT)' },
];

export const Navbar: React.FC<NavbarProps> = ({
  scenario,
  onUpdateScenario,
  onExportPdf,
  isExportingPdf,
  onResetToDefault,
  onExportJson,
  onImportJson,
  saveStatus,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const applyPreset = (presetKey: string) => {
    const preset = PRESET_SCENARIOS[presetKey];
    if (preset) {
      onUpdateScenario(preset);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-sm">
              <TrendingUp className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Капитал & Инвестиции
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                  Прогноз и FIRE
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Расчет роста накоплений от зарплаты и сложного процента
              </p>
            </div>
          </div>

          {/* Controls: Currency, Presets, Actions */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Auto-save status indicator */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>{saveStatus || 'Автосохранение активно'}</span>
            </div>

            {/* Currency selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              {CURRENCIES.map((curr) => (
                <button
                  key={curr.symbol}
                  id={`currency-btn-${curr.symbol}`}
                  onClick={() => onUpdateScenario({ currency: curr.symbol })}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    scenario.currency === curr.symbol
                      ? 'bg-white text-blue-700 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={curr.name}
                >
                  {curr.symbol}
                </button>
              ))}
            </div>

            {/* Presets dropdown */}
            <div className="relative group">
              <button
                id="presets-menu-button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Пресеты</span>
              </button>
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[11px] font-semibold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  Готовые стратегии
                </div>
                <button
                  onClick={() => applyPreset('conservative')}
                  className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-50 flex flex-col transition-colors"
                >
                  <span className="font-semibold text-slate-800">Консервативный (11%)</span>
                  <span className="text-[11px] text-slate-500">Вклады и ОФЗ, 15% сбережений</span>
                </button>
                <button
                  onClick={() => applyPreset('balanced')}
                  className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-50 flex flex-col transition-colors"
                >
                  <span className="font-semibold text-slate-800">Сбалансированный (15%)</span>
                  <span className="text-[11px] text-slate-500">Индексы акций + облигации, 20% сбережений</span>
                </button>
                <button
                  onClick={() => applyPreset('aggressive')}
                  className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-50 flex flex-col transition-colors"
                >
                  <span className="font-semibold text-slate-800">Агрессивный рост (22%)</span>
                  <span className="text-[11px] text-slate-500">Акции технологических лидеров, 30% сбережений</span>
                </button>
                <button
                  onClick={() => applyPreset('fire')}
                  className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-50 flex flex-col transition-colors"
                >
                  <span className="font-semibold text-slate-800">План FIRE (16%)</span>
                  <span className="text-[11px] text-slate-500">50% откладывания для свободы за 10-12 лет</span>
                </button>
              </div>
            </div>

            {/* Export JSON / Backup */}
            <button
              id="export-json-button"
              onClick={onExportJson}
              title="Сохранить копию данных в файл"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Import JSON */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportJson}
              accept=".json"
              className="hidden"
            />
            <button
              id="import-json-button"
              onClick={() => fileInputRef.current?.click()}
              title="Загрузить сохраненные данные"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Reset */}
            <button
              id="reset-scenario-button"
              onClick={onResetToDefault}
              title="Сбросить к исходным настройкам"
              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* PDF Export Action Button */}
            <button
              id="export-pdf-main-button"
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingPdf ? 'Создание PDF...' : 'Экспорт в PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
