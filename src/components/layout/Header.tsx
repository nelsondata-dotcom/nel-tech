import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Bell, Search, User, Globe } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Header() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t('nav.dashboard');
      case '/input': return t('nav.input');
      case '/analysis': return t('nav.analysis');
      case '/cash-flow': return t('nav.cashFlow');
      case '/assistant': return t('nav.assistant');
      case '/reports': return t('nav.reports');
      case '/settings': return t('nav.settings');
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Ghana SME Financial Health</span>
        <h1 className="text-lg font-black text-slate-900 leading-none mt-1">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setLanguage('en')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              language === 'en' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            EN
          </button>
          <button 
            onClick={() => setLanguage('ak')}
            className={cn(
              "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              language === 'ak' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            )}
          >
            TWI
          </button>
        </div>

        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search financial data..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 transition-all"
          />
        </div>

        <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.displayName || 'User'}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user?.email}</p>
          </div>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
