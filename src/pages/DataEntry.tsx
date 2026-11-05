import React, { useState } from 'react';
import { useFinancialData } from '../contexts/FinancialContext';
import { Save, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export function DataEntry() {
  const { addRecord, exportToCSV, records } = useFinancialData();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    period: new Date().toISOString().slice(0, 7), // YYYY-MM
    revenue: 0,
    costOfSales: 0,
    operatingExpenses: 0,
    cashBalance: 0,
    currentAssets: 0,
    currentLiabilities: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    equity: 0,
    loanRepayments: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addRecord(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Record Financial Data</h2>
          <p className="text-slate-500 text-sm">Enter your business figures for the reporting period.</p>
        </div>
        {records.length > 0 && (
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export History (CSV)
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Period Selection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <label className="block text-sm font-semibold text-slate-900 mb-2">Financial Reporting Period</label>
          <input 
            type="month" 
            name="period"
            value={formData.period}
            onChange={handleChange}
            className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Income Statement Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
              Income Statement
            </h3>
            
            <InputField label="Total Revenue" name="revenue" value={formData.revenue} onChange={handleChange} helper="All sales before expenses" />
            <InputField label="Cost of Sales" name="costOfSales" value={formData.costOfSales} onChange={handleChange} helper="Direct costs of products/services sold" />
            <InputField label="Operating Expenses" name="operatingExpenses" value={formData.operatingExpenses} onChange={handleChange} helper="Rent, utilities, salaries, etc." />
          </div>

          {/* Balance Sheet Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
              Balance Sheet
            </h3>
            
            <InputField label="Current Assets" name="currentAssets" value={formData.currentAssets} onChange={handleChange} helper="Cash, inventory, receivables (< 1yr)" />
            <InputField label="Current Liabilities" name="currentLiabilities" value={formData.currentLiabilities} onChange={handleChange} helper="Short-term debts, payables (< 1yr)" />
            <InputField label="Total Assets" name="totalAssets" value={formData.totalAssets} onChange={handleChange} helper="All property and equipment" />
            <InputField label="Total Liabilities" name="totalLiabilities" value={formData.totalLiabilities} onChange={handleChange} helper="All loans and debts" />
            <InputField label="Equity" name="equity" value={formData.equity} onChange={handleChange} helper="Owner's investment + retained earnings" />
          </div>

          {/* Cash Flow Data */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              Cash Flow
            </h3>
            
            <InputField label="Cash and Bank Balances" name="cashBalance" value={formData.cashBalance} onChange={handleChange} helper="Actual money in hand/bank" />
            <InputField label="Loan Repayments" name="loanRepayments" value={formData.loanRepayments} onChange={handleChange} helper="Principal and interest paid this month" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4">
            {success && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="w-4 h-4" />
                Data saved successfully
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save Financial Record
          </button>
        </div>
      </form>
    </div>
  );
}

function InputField({ label, name, value, onChange, helper }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
        {helper && <span className="text-[10px] text-slate-400 font-medium italic">{helper}</span>}
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">GH₵</span>
        <input 
          type="number" 
          name={name}
          step="0.01"
          value={value === 0 ? '' : value}
          onChange={onChange}
          placeholder="0.00"
          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-12 pr-4 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all tabular-nums"
          required
        />
      </div>
    </div>
  );
}
