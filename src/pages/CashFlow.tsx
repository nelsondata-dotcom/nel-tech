import React from 'react';
import { useFinancialData } from '../contexts/FinancialContext';
import { formatCurrency, cn } from '../lib/utils';
import { 
  ArrowRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle,
  TrendingUp,
  Receipt,
  Wallet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export function CashFlow() {
  const { records, loading } = useFinancialData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const latestRecord = records[0];
  const chartData = [...records].reverse().map(r => ({
    name: r.period,
    inflow: r.revenue,
    outflow: r.costOfSales + r.operatingExpenses + r.loanRepayments,
    net: r.revenue - (r.costOfSales + r.operatingExpenses + r.loanRepayments)
  }));

  const netCashFlow = (latestRecord?.revenue || 0) - ((latestRecord?.costOfSales || 0) + (latestRecord?.operatingExpenses || 0) + (latestRecord?.loanRepayments || 0));

  return (
    <div className="space-y-8">
      {/* Explanation Section */}
      <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-32 h-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Understanding Cash Flow</h2>
          <p className="text-emerald-100 text-sm leading-relaxed mb-6">
            <span className="font-bold text-white italic">Profit is what's left after all bills are paid on paper.</span> Cash flow is the actual money moving in and out of your business bank account. You can be profitable but still run out of cash if customers pay you late or you have high loan repayments.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
              <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Net Cash Flow</p>
              <p className="text-xl font-bold">{formatCurrency(netCashFlow)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20">
              <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">Cash Reserve</p>
              <p className="text-xl font-bold">{formatCurrency(latestRecord?.cashBalance || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Monthly Cash Flow Trends</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => `₵${val/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="net">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.net >= 0 ? '#10b981' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warnings & Suggestions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Cash Flow Health
            </h3>
            <div className="space-y-4">
              {netCashFlow < 0 ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs font-bold text-red-700 uppercase mb-1">Negative Cash Flow</p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    You are spending more cash than you are bringing in this month. Check your operating expenses and loan repayments.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-xs font-bold text-emerald-700 uppercase mb-1">Positive Cash Flow</p>
                  <p className="text-xs text-emerald-600 leading-relaxed">
                    Your business is generating more cash than it consumes. Consider reinvesting or building a safety reserve.
                  </p>
                </div>
              )}

              {latestRecord && latestRecord.loanRepayments > (latestRecord.revenue * 0.3) && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-bold text-amber-700 uppercase mb-1">High Debt Servicing</p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    Loan repayments are consuming over 30% of your revenue. This could impact your ability to pay daily operational bills.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Tips</h3>
            <ul className="space-y-3">
              {[
                "Send invoices immediately after work is done.",
                "Negotiate longer payment terms with suppliers.",
                "Offer small discounts for early payments from customers.",
                "Maintain a cash reserve for at least 3 months of expenses."
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
