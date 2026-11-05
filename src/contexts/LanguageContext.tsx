import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export type Language = 'en' | 'ak'; // ak is Akan/Twi

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.input': 'Input Data',
    'nav.analysis': 'Ratio Analysis',
    'nav.cashFlow': 'Cash Flow',
    'nav.assistant': 'AI Assistant',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'dash.title': 'Financial Overview',
    'dash.subtitle': 'Real-time performance metrics for your SME.',
    'dash.revenue': 'Total Revenue',
    'dash.expenses': 'Total Expenses',
    'dash.profit': 'Net Profit',
    'dash.cash': 'Cash Balance',
    'input.title': 'Record Financial Data',
    'input.subtitle': 'Enter your business figures for the reporting period.',
    'input.save': 'Save Financial Record',
    'input.income': 'Income Statement',
    'input.balance': 'Balance Sheet',
    'input.cashFlow': 'Cash Flow',
    'analysis.title': 'Financial Ratio Analysis',
    'assistant.title': 'AI Financial Assistant',
    'assistant.placeholder': 'Ask about your financial ratios or risks...',
    'reports.title': 'Financial Report Generator',
    'reports.download': 'Download PDF',
    'reports.save': 'Save to History',
    'settings.title': 'Business Settings',
    'settings.save': 'Save All Changes',
  },
  ak: {
    'nav.dashboard': 'Adwumayɛ Mpuntuo',
    'nav.input': 'Sika Dwumadie',
    'nav.analysis': 'Sika Akontaabu',
    'nav.cashFlow': 'Sika a Ɛkɔ na Ɛba',
    'nav.assistant': 'AI Boafoɔ',
    'nav.reports': 'Amaneɛbɔ',
    'nav.settings': 'Mpanyinfoɔ Nhyehyɛeɛ',
    'nav.logout': 'Pue firi mu',
    'dash.title': 'Sika Ho Mpuntuo',
    'dash.subtitle': 'Wo dwumadie sika ho nsɛm nyinaa wɔ ha.',
    'dash.revenue': 'Sika a Wɔanya',
    'dash.expenses': 'Sika a Ɛkɔeɛ',
    'dash.profit': 'Mfasoɔ Pa',
    'dash.cash': 'Sika a Ɛwɔ Hɔ',
    'input.title': 'Twerɛ Sika Ho Nsɛm',
    'input.subtitle': 'Fa wo dwumadie sika ho nsɛm hyɛ ha.',
    'input.save': 'Sie Sika Nsɛm No',
    'input.income': 'Sika a Ɛba ne Nfasoɔ',
    'input.balance': 'Sika a Ɛwɔ Hɔ na Ɛkɔeɛ',
    'input.cashFlow': 'Sika a Ɛfiri Mu ne nea Ɛba Mu',
    'analysis.title': 'Sika Ho Akontaabu mu Nhwehwɛmu',
    'assistant.title': 'AI Sika Ho Boafoɔ',
    'assistant.placeholder': 'Bisa sika ho asɛm biara...',
    'reports.title': 'Sika Ho Amaneɛbɔ',
    'reports.download': 'Twerɛ PDF No',
    'reports.save': 'Sie Amaneɛbɔ No',
    'settings.title': 'Dwumadie Nhyehyɛeɛ',
    'settings.save': 'Sie Nsakraeɛ Nyinaa',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [language, setLangState] = useState<Language>('en');

  useEffect(() => {
    async function loadLang() {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.preferences?.language) {
            setLangState(data.preferences.language);
          }
        }
      }
    }
    loadLang();
  }, [user]);

  const setLanguage = async (lang: Language) => {
    setLangState(lang);
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'preferences.language': lang
      });
    }
  };

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
