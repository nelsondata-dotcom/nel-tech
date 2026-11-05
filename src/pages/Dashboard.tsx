import React, { useState, useEffect } from 'react';
import { useFinancialData } from '../contexts/FinancialContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Wallet,
  Receipt,
  Scale,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { cn, formatCurrency } from '../lib/utils';
import { SpeechButton } from '../components/common/SpeechButton';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Megaphone, X, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export function Dashboard() {
  const { records, loading } = useFinancialData();
  const { t, language } = useLanguage();
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const q = query(
          collection(db, 'announcements'), 
          where('active', '==', true),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Announcements error:", err);
      }
    }
    fetchAnnouncements();
  }, []);

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
    revenue: r.revenue,
    expenses: r.costOfSales + r.operatingExpenses,
    profit: r.revenue - (r.costOfSales + r.operatingExpenses),
  }));

  const totalRevenue = latestRecord?.revenue || 0;
  const totalExpenses = (latestRecord?.costOfSales || 0) + (latestRecord?.operatingExpenses || 0);
  const netProfit = totalRevenue - totalExpenses;
  const cashFlow = latestRecord?.cashBalance || 0;

  const stats = [
    { label: t('dash.revenue'), value: totalRevenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('dash.expenses'), value: totalExpenses, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: t('dash.profit'), value: netProfit, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('dash.cash'), value: cashFlow, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const getVerbalSummary = () => {
    if (!latestRecord) return "";
    if (language === 'ak') {
      return `Wo dwumadie sika a woanya bosome no mu yɛ ${formatCurrency(totalRevenue)}. Wo dwumadie ho ka nyinaa yɛ ${formatCurrency(totalExpenses)}. Enti wo mfasoɔ pa a aka yɛ ${formatCurrency(netProfit)}. Wo sika a ɛwɔ hɔ mprempren yɛ ${formatCurrency(cashFlow)}.`;
    }
    return `Your business generated ${formatCurrency(totalRevenue)} this period. Total expenses were ${formatCurrency(totalExpenses)}, resulting in a net profit of ${formatCurrency(netProfit)}. Your current cash balance is ${formatCurrency(cashFlow)}.`;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id} className={cn(
              "p-4 rounded-2xl border flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500",
              ann.type === 'critical' ? "bg-red-50 border-red-100 text-red-900" :
              ann.type === 'warning' ? "bg-amber-50 border-amber-100 text-amber-900" :
              "bg-emerald-50 border-emerald-100 text-emerald-900"
            )}>
              <div className={cn(
                "p-2 rounded-xl shrink-0",
                ann.type === 'critical' ? "bg-red-100 text-red-600" :
                ann.type === 'warning' ? "bg-amber-100 text-amber-600" :
                "bg-emerald-100 text-emerald-600"
              )}>
                {ann.type === 'critical' ? <AlertCircle className="w-5 h-5" /> :
                 ann.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                 <Info className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black uppercase tracking-tight leading-none mb-1">{ann.title}</h4>
                <p className="text-sm opacity-80 leading-relaxed">{ann.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('dash.title')}</h2>
          <p className="text-slate-500 text-sm">{t('dash.subtitle')}</p>
        </div>
        
        {latestRecord && (
          <div className="flex items-center gap-3 bg-emerald-50 p-2 pr-4 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">AI Summary</p>
              <SpeechButton text={getVerbalSummary()} size="sm" className="mt-1" />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={stat.bg + " p-2.5 rounded-xl"}>
                <stat.icon className={stat.color + " w-5 h-5"} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" />
                <span>12%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                {formatCurrency(stat.value)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Revenue vs Expenses</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-600">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                <span>Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `₵${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats / Ratios Preview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Key Performance Indicators</h3>
          <div className="space-y-6">
            <KPIItem 
              label="Gross Margin" 
              value={latestRecord ? (latestRecord.revenue - latestRecord.costOfSales) / latestRecord.revenue * 100 : 0} 
              format="percent"
            />
            <KPIItem 
              label="Net Margin" 
              value={latestRecord ? (totalRevenue - totalExpenses) / latestRecord.revenue * 100 : 0} 
              format="percent"
            />
            <KPIItem 
              label="Current Ratio" 
              value={latestRecord ? latestRecord.currentAssets / latestRecord.currentLiabilities : 0} 
              format="number"
            />
            <KPIItem 
              label="Debt to Equity" 
              value={latestRecord ? latestRecord.totalLiabilities / latestRecord.equity : 0} 
              format="number"
            />
          </div>
          
          <button className="w-full mt-8 py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
            View Full Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

function KPIItem({ label, value, format }: { label: string, value: number, format: 'percent' | 'number' }) {
  const isHealthy = format === 'percent' ? value > 20 : value > 1.5;
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={cn(
          "text-sm font-bold tabular-nums",
          isHealthy ? "text-emerald-600" : "text-amber-600"
        )}>
          {format === 'percent' ? `${value.toFixed(1)}%` : value.toFixed(2)}
        </span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isHealthy ? "bg-emerald-500" : "bg-amber-500"
          )}
          style={{ width: `${Math.min(format === 'percent' ? value : value * 20, 100)}%` }}
        />
      </div>
    </div>
  );
}
