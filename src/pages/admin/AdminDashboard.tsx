import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface GlobalStats {
  totalUsers: number;
  totalRevenue: number;
  avgCashBalance: number;
  healthScore: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<GlobalStats>({
    totalUsers: 0,
    totalRevenue: 0,
    avgCashBalance: 0,
    healthScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGlobalStats() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const totalUsers = usersSnap.size;
        
        // This is a simplified aggregation. In a real app, you might use a cloud function
        // or a dedicated aggregation document to avoid fetching everything.
        let totalRev = 0;
        let totalCash = 0;
        let recordsCount = 0;

        // Note: Fetching all records for all users might be heavy.
        // For AI Studio demo, we'll keep it simple.
        
        setStats({
          totalUsers,
          totalRevenue: 1250000, // Mock for demo until real data exists
          avgCashBalance: 45000,
          healthScore: 78
        });
      } catch (error) {
        console.error("Error fetching global stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGlobalStats();
  }, []);

  const chartData = [
    { month: 'Jan', revenue: 4000, health: 65 },
    { month: 'Feb', revenue: 3000, health: 68 },
    { month: 'Mar', revenue: 2000, health: 72 },
    { month: 'Apr', revenue: 2780, health: 70 },
    { month: 'May', revenue: 1890, health: 75 },
    { month: 'Jun', revenue: 2390, health: 82 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
        <p className="text-slate-500 mt-1">Global performance metrics for all Ghanaian SMEs on the platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Users} 
          label="Total SMEs" 
          value={stats.totalUsers.toString()} 
          color="bg-blue-500"
          trend="+12% from last month"
        />
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`GH₵ ${stats.totalRevenue.toLocaleString()}`} 
          color="bg-emerald-500"
          trend="+5.4% growth"
        />
        <StatCard 
          icon={Activity} 
          label="Avg. Health Score" 
          value={`${stats.healthScore}%`} 
          color="bg-amber-500"
          trend="Improving steadily"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Platform Activity" 
          value="High" 
          color="bg-purple-500"
          trend="85% daily active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            Aggregate Revenue Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            SME Health Index
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="health" stroke="#f59e0b" strokeWidth={3} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: { icon: any, label: string, value: string, color: string, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h4 className="text-2xl font-black text-slate-900">{value}</h4>
      </div>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">{trend}</p>
    </div>
  );
}
