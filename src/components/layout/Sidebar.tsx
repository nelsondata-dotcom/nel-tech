import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  PieChart, 
  TrendingUp, 
  FileText, 
  MessageSquare,
  LogOut,
  Building2,
  BookOpen,
  Landmark
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { logout, userRole } = useAuth();
  const { language, t } = useLanguage();

  const navItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard'), path: '/' },
    { icon: PlusCircle, label: t('nav.input'), path: '/input' },
    { icon: PieChart, label: t('nav.analysis'), path: '/analysis' },
    { icon: TrendingUp, label: t('nav.cashFlow'), path: '/cash-flow' },
    { icon: Landmark, label: language === 'ak' ? 'Sikakorabea Nhwehwɛmu' : 'Bank Analysis', path: '/bank-analysis' },
    { icon: MessageSquare, label: t('nav.assistant'), path: '/assistant' },
    { icon: BookOpen, label: language === 'ak' ? 'Sika Adesua' : 'Education', path: '/education' },
    { icon: FileText, label: t('nav.reports'), path: '/reports' },
    { icon: Building2, label: t('nav.settings'), path: '/settings' },
  ];

  const adminItems = [
    { icon: LayoutDashboard, label: 'Admin Overview', path: '/admin' },
    { icon: Building2, label: 'User Management', path: '/admin/users' },
    { icon: FileText, label: 'Content CMS', path: '/admin/content' },
    { icon: MessageSquare, label: 'Announcements', path: '/admin/announcements' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Building2 className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-white tracking-tight">SME Financial AI</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Main Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-slate-900 text-emerald-400" 
                  : "hover:bg-slate-900 hover:text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {userRole === 'admin' && (
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Administration</p>
            {adminItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "hover:bg-slate-900 hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}
