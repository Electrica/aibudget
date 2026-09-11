'use client';

import React, { useState, useEffect } from 'react';
import { 
  InvestmentScenario, 
  CalculationResult 
} from '@/lib/finance-types';
import { 
  calculateProjections, 
  DEFAULT_PRIMARY_SCENARIO, 
  DEFAULT_COMPARISON_SCENARIOS 
} from '@/lib/finance-calculator';
import { exportElementToPdf } from '@/lib/pdf-export';
import { Navbar } from '@/components/Navbar';
import { MetricsSummary } from '@/components/MetricsSummary';
import { ScenarioEditor } from '@/components/ScenarioEditor';
import { ChartsSection } from '@/components/ChartsSection';
import { ScenarioComparisonView } from '@/components/ScenarioComparisonView';
import { ProjectionTable } from '@/components/ProjectionTable';
import { FirePlanView } from '@/components/FirePlanView';
import { PdfReportTemplate } from '@/components/PdfReportTemplate';
import { 
  BarChart2, 
  Scale, 
  Table as TableIcon, 
  Flame, 
  Check, 
  Download,
  AlertCircle
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'investment_forecaster_state_v2';

function subscribeMounted() {
  return () => {};
}

export default function InvestmentApp() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'comparison' | 'table' | 'fire'>('calculator');
  
  const mounted = React.useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false
  );
  
  // Scenarios state: initialize lazily from localStorage if available
  const [scenarios, setScenarios] = useState<InvestmentScenario[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.scenarios && Array.isArray(parsed.scenarios) && parsed.scenarios.length > 0) {
            return parsed.scenarios;
          }
        }
      } catch (e) {
        console.warn('Failed to load scenarios from localStorage:', e);
      }
    }
    return [DEFAULT_PRIMARY_SCENARIO];
  });

  const [comparisonScenarios, setComparisonScenarios] = useState<InvestmentScenario[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.comparisonScenarios && Array.isArray(parsed.comparisonScenarios)) {
            return parsed.comparisonScenarios;
          }
        }
      } catch (e) {
        console.warn('Failed to load comparisonScenarios from localStorage:', e);
      }
    }
    return DEFAULT_COMPARISON_SCENARIOS;
  });
  
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string>('Автосохранение активно');

  // Save to LocalStorage whenever scenarios change
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          scenarios,
          comparisonScenarios,
        })
      );
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [scenarios, comparisonScenarios, mounted]);

  const currentScenario = scenarios[0] || DEFAULT_PRIMARY_SCENARIO;

  // Compute calculation for active scenario
  const calculationResult: CalculationResult = React.useMemo(() => {
    return calculateProjections(currentScenario);
  }, [currentScenario]);

  // Update primary scenario
  const handleUpdatePrimaryScenario = (updated: Partial<InvestmentScenario>) => {
    const updatedPrimary = { ...currentScenario, ...updated };
    setScenarios([updatedPrimary, ...scenarios.slice(1)]);
    // Keep comparison scenario #0 in sync
    setComparisonScenarios((prev) => [
      { ...prev[0], ...updated },
      ...prev.slice(1),
    ]);
  };

  // Reset to default presets
  const handleResetToDefault = () => {
    if (confirm('Сбросить все параметры к начальным настройкам?')) {
      setScenarios([DEFAULT_PRIMARY_SCENARIO]);
      setComparisonScenarios(DEFAULT_COMPARISON_SCENARIOS);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    const data = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      scenarios,
      comparisonScenarios,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investment-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.scenarios && Array.isArray(parsed.scenarios)) {
          setScenarios(parsed.scenarios);
        }
        if (parsed.comparisonScenarios && Array.isArray(parsed.comparisonScenarios)) {
          setComparisonScenarios(parsed.comparisonScenarios);
        }
        alert('Данные успешно загружены!');
      } catch (err) {
        alert('Ошибка при чтении файла JSON. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export PDF trigger
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const success = await exportElementToPdf(
        'pdf-export-container',
        `invest-forecast-${currentScenario.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      );
      if (!success) {
        // Fallback: standard window print
        window.print();
      }
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Загрузка калькулятора инвестиций...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <Navbar
        scenario={currentScenario}
        onUpdateScenario={handleUpdatePrimaryScenario}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onResetToDefault={handleResetToDefault}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        saveStatus={saveNotification}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-200/70 p-1 rounded-2xl">
            <button
              id="tab-calculator"
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'calculator'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Калькулятор & График</span>
            </button>

            <button
              id="tab-comparison"
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'comparison'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-4 h-4 text-emerald-600" />
              <span>Сравнение сценариев</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {comparisonScenarios.length}
              </span>
            </button>

            <button
              id="tab-table"
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-4 h-4 text-indigo-600" />
              <span>Таблица по годам</span>
            </button>

            <button
              id="tab-fire"
              onClick={() => setActiveTab('fire')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'fire'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Свобода (FIRE)</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span>Валюта: <strong className="text-slate-900">{currentScenario.currency}</strong></span>
            <span>•</span>
            <span>Горизонт: <strong className="text-slate-900">{currentScenario.investmentYears} лет</strong></span>
          </div>
        </div>

        {/* Tab 1: Calculator & Growth Charts */}
        {activeTab === 'calculator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top KPI Cards */}
            <MetricsSummary
              result={calculationResult}
              scenario={currentScenario}
            />

            {/* Input Controls Panel */}
            <ScenarioEditor
              scenario={currentScenario}
              onChange={handleUpdatePrimaryScenario}
            />

            {/* Recharts Visualizations */}
            <ChartsSection
              result={calculationResult}
              scenario={currentScenario}
            />
          </div>
        )}

        {/* Tab 2: Scenario Comparison */}
        {activeTab === 'comparison' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ScenarioComparisonView
              scenarios={comparisonScenarios}
              onUpdateScenarios={setComparisonScenarios}
              currency={currentScenario.currency}
            />
          </div>
        )}

        {/* Tab 3: Detailed Yearly Projections Table */}
        {activeTab === 'table' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MetricsSummary
              result={calculationResult}
              scenario={currentScenario}
            />
            <ProjectionTable
              projections={calculationResult.projections}
              scenario={currentScenario}
            />
          </div>
        )}

        {/* Tab 4: Financial Freedom & FIRE */}
        {activeTab === 'fire' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <MetricsSummary
              result={calculationResult}
              scenario={currentScenario}
            />
            <FirePlanView
              result={calculationResult}
              scenario={currentScenario}
            />
          </div>
        )}
      </main>

      {/* Hidden PDF template container for rendering high-res print export */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <PdfReportTemplate
          scenario={currentScenario}
          result={calculationResult}
          comparisonScenarios={comparisonScenarios}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Калькулятор инвестиций и роста капитала • Магия сложного процента
          </div>
          <div>
            Данные сохраняются автоматически в вашем браузере
          </div>
        </div>
      </footer>
    </div>
  );
}
