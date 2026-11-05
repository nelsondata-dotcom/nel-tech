import React from 'react';
import { useFinancialData } from '../contexts/FinancialContext';
import { formatCurrency, cn } from '../lib/utils';
import { Info, Calculator, CheckCircle2, AlertTriangle } from 'lucide-react';

export function Analysis() {
  const { records, loading } = useFinancialData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const r = records[0];
  if (!r) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
        <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">No Data Available</h3>
        <p className="text-slate-500 mt-2">Please enter your financial figures in the "Input Data" section to see analysis.</p>
      </div>
    );
  }

  const ratios = [
    {
      title: 'Gross Profit Margin',
      formula: '(Revenue - Cost of Sales) / Revenue',
      calculation: `(${r.revenue} - ${r.costOfSales}) / ${r.revenue}`,
      result: (r.revenue - r.costOfSales) / r.revenue * 100,
      format: 'percent',
      explanation: 'Indicates how efficiently your business is producing or purchasing goods and services.',
      isHealthy: (r.revenue - r.costOfSales) / r.revenue > 0.3
    },
    {
      title: 'Net Profit Margin',
      formula: 'Net Income / Revenue',
      calculation: `(${r.revenue} - ${r.costOfSales + r.operatingExpenses}) / ${r.revenue}`,
      result: (r.revenue - (r.costOfSales + r.operatingExpenses)) / r.revenue * 100,
      format: 'percent',
      explanation: 'Shows what percentage of your revenue is actual profit after all expenses.',
      isHealthy: (r.revenue - (r.costOfSales + r.operatingExpenses)) / r.revenue > 0.1
    },
    {
      title: 'Current Ratio',
      formula: 'Current Assets / Current Liabilities',
      calculation: `${r.currentAssets} / ${r.currentLiabilities}`,
      result: r.currentAssets / r.currentLiabilities,
      format: 'number',
      explanation: 'Measures your business ability to pay short-term obligations due within one year.',
      isHealthy: r.currentAssets / r.currentLiabilities > 1.5
    },
    {
      title: 'Quick Ratio',
      formula: '(Current Assets - Inventory) / Current Liabilities',
      calculation: `(Assuming inventory is 50% of CA) (${r.currentAssets * 0.5}) / ${r.currentLiabilities}`,
      result: (r.currentAssets * 0.5) / r.currentLiabilities,
      format: 'number',
      explanation: 'A more stringent test of liquidity, excluding inventory which may be harder to sell quickly.',
      isHealthy: (r.currentAssets * 0.5) / r.currentLiabilities > 1.0
    },
    {
      title: 'Debt-to-Equity Ratio',
      formula: 'Total Liabilities / Equity',
      calculation: `${r.totalLiabilities} / ${r.equity}`,
      result: r.totalLiabilities / r.equity,
      format: 'number',
      explanation: 'Indicates the proportion of equity and debt the business is using to finance its assets.',
      isHealthy: r.totalLiabilities / r.equity < 2.0
    },
    {
      title: 'Return on Assets (ROA)',
      formula: 'Net Income / Total Assets',
      calculation: `(${r.revenue - (r.costOfSales + r.operatingExpenses)}) / ${r.totalAssets}`,
      result: (r.revenue - (r.costOfSales + r.operatingExpenses)) / r.totalAssets * 100,
      format: 'percent',
      explanation: 'Measures how efficiently your business uses its assets to generate profit.',
      isHealthy: (r.revenue - (r.costOfSales + r.operatingExpenses)) / r.totalAssets > 0.05
    },
    {
      title: 'Return on Equity (ROE)',
      formula: 'Net Income / Equity',
      calculation: `(${r.revenue - (r.costOfSales + r.operatingExpenses)}) / ${r.equity}`,
      result: (r.revenue - (r.costOfSales + r.operatingExpenses)) / r.equity * 100,
      format: 'percent',
      explanation: 'Measures how effectively management is using investors money to generate profit.',
      isHealthy: (r.revenue - (r.costOfSales + r.operatingExpenses)) / r.equity > 0.15
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratios.map((ratio, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">{ratio.title}</h3>
                {ratio.isHealthy ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                )}
              </div>
              
              <div className="mb-4">
                <p className="text-3xl font-black text-slate-900 tabular-nums">
                  {ratio.format === 'percent' ? `${ratio.result.toFixed(1)}%` : ratio.result.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    ratio.isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {ratio.isHealthy ? 'Healthy' : 'Needs Attention'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <span className="font-bold">Formula:</span> {ratio.formula}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Calculator className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-600 leading-relaxed italic">
                    {ratio.calculation}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                {ratio.explanation}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
