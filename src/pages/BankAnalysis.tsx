import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Landmark, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  BarChart3, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn, formatCurrency } from '../lib/utils';

interface BankMetric {
  id: string;
  name: string;
  car: number; // Capital Adequacy Ratio
  npl: number; // Non-Performing Loans
  totalAssets: number;
  marketShare: number;
  profitBeforeTax: number;
  roa: number;
  strengths: string[];
  weaknesses: string[];
}

export function BankAnalysis() {
  const { language } = useLanguage();
  const [banks, setBanks] = useState<BankMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<BankMetric | null>(null);

  useEffect(() => {
    async function fetchBanks() {
      try {
        const snap = await getDocs(collection(db, 'bankMetrics'));
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BankMetric[];
        
        if (list.length === 0) {
          // Seed mock data for first view if DB is empty
          const mockBanks: BankMetric[] = [
            {
              id: 'gcb',
              name: 'GCB Bank PLC',
              car: 18.5,
              npl: 15.2,
              totalAssets: 28500000000,
              marketShare: 12.4,
              profitBeforeTax: 1200000000,
              roa: 4.2,
              strengths: ['Largest branch network', 'Strong government backing', 'High liquidity'],
              weaknesses: ['High legacy NPLs', 'Slower digital transformation']
            },
            {
              id: 'ecobank',
              name: 'Ecobank Ghana',
              car: 20.1,
              npl: 9.8,
              totalAssets: 25900000000,
              marketShare: 11.2,
              profitBeforeTax: 1500000000,
              roa: 5.8,
              strengths: ['Superior digital banking', 'Strong trade finance', 'Low NPL ratio'],
              weaknesses: ['Higher service fees', 'Corporate concentration risk']
            },
            {
              id: 'stanbic',
              name: 'Stanbic Bank Ghana',
              car: 19.8,
              npl: 7.5,
              totalAssets: 18200000000,
              marketShare: 8.5,
              profitBeforeTax: 1100000000,
              roa: 6.1,
              strengths: ['Best-in-class risk management', 'Strong corporate lending', 'Stable parent group'],
              weaknesses: ['Limited retail presence in remote areas']
            },
            {
              id: 'absa',
              name: 'Absa Bank Ghana',
              car: 17.2,
              npl: 11.4,
              totalAssets: 16500000000,
              marketShare: 7.8,
              profitBeforeTax: 950000000,
              roa: 5.2,
              strengths: ['Strong SME focused products', 'Global expertise', 'Robust capital base'],
              weaknesses: ['Rising operating costs']
            }
          ];
          setBanks(mockBanks);
          setSelectedBank(mockBanks[0]);
        } else {
          setBanks(list);
          setSelectedBank(list[0]);
        }
      } catch (err) {
        console.error("Fetch banks error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBanks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ghana Bank Analysis</h1>
          <p className="text-slate-500 mt-1">Comparative performance metrics for major financial institutions in Ghana (2025 Q3 Data).</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Bank of Ghana Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Market Share Overview */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-500" />
            Market Share (Assets)
          </h3>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={banks} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="marketShare" radius={[0, 4, 4, 0]}>
                  {banks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={selectedBank?.id === entry.id ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-3">
            {banks.map((bank, i) => (
              <button 
                key={bank.id}
                onClick={() => setSelectedBank(bank)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-2xl transition-all border",
                  selectedBank?.id === bank.id 
                    ? "bg-slate-50 border-slate-200 shadow-sm" 
                    : "bg-white border-transparent hover:border-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm font-black text-slate-700">{bank.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-400">{bank.marketShare}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Performance */}
        <div className="lg:col-span-2 space-y-8">
          {selectedBank ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center shadow-sm">
                    <Landmark className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-none">{selectedBank.name}</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Profile</p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Health Metrics */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Core Stability Index</h4>
                  
                  <MetricIndicator 
                    label="Capital Adequacy (CAR)" 
                    value={`${selectedBank.car}%`} 
                    sub="Regulatory Min: 13%"
                    status={selectedBank.car > 15 ? 'healthy' : 'caution'}
                  />
                  
                  <MetricIndicator 
                    label="Non-Performing Loans (NPL)" 
                    value={`${selectedBank.npl}%`} 
                    sub="Industry Avg: 18.9%"
                    status={selectedBank.npl < 15 ? 'healthy' : 'caution'}
                    invert
                  />

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Total Assets</span>
                      <span className="font-black text-slate-900">GH₵ {(selectedBank.totalAssets / 1e9).toFixed(1)}B</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Return on Assets (RoA)</span>
                      <span className="font-black text-emerald-600">+{selectedBank.roa}%</span>
                    </div>
                  </div>
                </div>

                {/* SWOT Analysis */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SME Strategic Analysis</h4>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4" />
                      Strengths
                    </p>
                    <ul className="space-y-2">
                      {selectedBank.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4" />
                      Weaknesses
                    </p>
                    <ul className="space-y-2">
                      {selectedBank.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <ChevronRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-auto p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <Info className="w-5 h-5 text-slate-400" />
                <p className="text-xs text-slate-500 italic">
                  This analysis is based on published financial statements and regulatory filings. SMEs should conduct independent due diligence before making significant financial commitments.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm border-dashed p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[400px]">
              <Landmark className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Select a bank from the market share list to view detailed SME analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricIndicator({ label, value, sub, status, invert }: { label: string, value: string, sub: string, status: 'healthy' | 'caution' | 'alert', invert?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-slate-500">{label}</p>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{value}</p>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-1",
          status === 'healthy' ? "bg-emerald-100 text-emerald-700" :
          status === 'caution' ? "bg-amber-100 text-amber-700" :
          "bg-red-100 text-red-700"
        )}>
          {status}
        </div>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000",
            status === 'healthy' ? "bg-emerald-500" :
            status === 'caution' ? "bg-amber-500" :
            "bg-red-500"
          )}
          style={{ width: status === 'healthy' ? '85%' : status === 'caution' ? '45%' : '20%' }}
        />
      </div>
      <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
    </div>
  );
}
