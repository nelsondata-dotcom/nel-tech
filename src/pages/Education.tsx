import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, Calculator, PiggyBank, TrendingUp, Landmark, ShieldCheck } from 'lucide-react';
import { SpeechButton } from '../components/common/SpeechButton';

const defaultLessons = [
  {
    id: 'profit',
    icon: Calculator,
    titleEn: 'How to calculate profit',
    titleAk: 'Sɛnea wobu mfasoɔ akonta',
    contentEn: 'Profit is calculated by subtracting all your business expenses from your total sales. For example, if you sell goods for GH₵500 and your costs are GH₵300, your profit is GH₵200.',
    contentAk: 'Sɛ wobu mfasoɔ akonta a, woyi wo dwumadie ho ka nyinaa firi sika a woanya no mu. Sɛ wotɔn nneɛma GH₵500 na wo dwumadie ho ka yɛ GH₵300 a, wo mfasoɔ yɛ GH₵200.'
  },
  {
    id: 'expenses',
    icon: TrendingUp,
    titleEn: 'Managing business expenses',
    titleAk: 'Sɛnea wohwɛ wo dwumadie ho ka so',
    contentEn: 'Always keep track of every cedi you spend on rent, electricity, and stock. Reducing unnecessary costs helps your business grow faster.',
    contentAk: 'Hwɛ na twerɛ sika biara a wode tua dan ka, anyinam dɛm ka, ne nneɛma a wotɔ. Sɛ woyi nneɛma a ɛho nhia firi mu a, ɛboa ma wo dwumadie no kɔ anim ntɛm.'
  },
  {
    id: 'savings',
    icon: PiggyBank,
    titleEn: 'How to save money',
    titleAk: 'Sɛnea wosie sika',
    contentEn: 'Set aside a portion of your profit every month before spending. Aim to have enough savings to cover 3 to 6 months of business operations.',
    contentAk: 'Yi wo mfasoɔ no fa bi sie bosome biara ansa na woasɛe sika. Bɔ mmɔden na sika a woasie no bɛtumi ahwɛ wo dwumadie no so bosome mmiɛnsa kɔsi nsia.'
  },
  {
    id: 'cashflow',
    icon: Landmark,
    titleEn: 'Understanding cash flow',
    titleAk: 'Sika a ɛkɔ na ɛba mu nteaseɛ',
    contentEn: 'Cash flow is the actual money moving in and out of your business. Profit is what stays with you after all accounts are balanced.',
    contentAk: 'Sika a ɛkɔ na ɛba kyerɛ sika pa ara a ɛfiri wo nsam kɔ na ɛba wo nsam. Mfasoɔ ne sika a aka wɔ wo nsam sɛ woakonta nneɛma nyinaa wie a.'
  },
  {
    id: 'loans',
    icon: ShieldCheck,
    titleEn: 'Preparing for a bank loan',
    titleAk: 'Sɛnea wosiesie wo ho ma bɔseɛ',
    contentEn: 'To get a loan, banks in Ghana look for clear financial records. Keep your business money separate from your personal money.',
    contentAk: 'Sɛ wopɛ bɔseɛ firi sikakorabea a, wɔhwehwɛ sika ho nkrataa a ɛmu da hɔ. Hwɛ na mfa wo dwumadie sika ne w’ankasa sika mmfra.'
  }
];

interface DynamicArticle {
  id: string;
  title: string;
  content: string;
  category: string;
}

export function Education() {
  const { language, t } = useLanguage();
  const [articles, setArticles] = useState<DynamicArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      try {
        const q = query(collection(db, 'educationArticles'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DynamicArticle[];
        setArticles(list);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {language === 'ak' ? 'Sika Ho Mpuntuo Adesua' : 'Financial Education'}
        </h2>
        <p className="text-slate-500 text-sm">
          {language === 'ak' ? 'Sua sɛnea wobɛhwɛ wo dwumadie sika so yie.' : 'Learn how to manage your business finances effectively.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Dynamic Articles from CMS */}
        {articles.map((article) => (
          <div key={article.id} className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-6 relative z-10">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {article.title}
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
                    {article.category}
                  </span>
                </div>
                
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {article.content}
                </div>

                <div className="flex items-center gap-4">
                  <SpeechButton text={article.content} />
                  <div className="h-4 w-px bg-slate-200" />
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    AI Curated Lesson
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Default Lessons as Baseline */}
        {defaultLessons.map((lesson) => (
          <div key={lesson.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex flex-col md:flex-row gap-6 relative z-10">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <lesson.icon className="w-7 h-7 text-slate-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {language === 'ak' ? lesson.titleAk : lesson.titleEn}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                    {language === 'ak' ? lesson.titleEn : lesson.titleAk}
                  </p>
                </div>
                
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 italic text-slate-700 leading-relaxed text-sm">
                  {language === 'ak' ? lesson.contentAk : lesson.contentEn}
                </div>

                <div className="flex items-center gap-4">
                  <SpeechButton text={language === 'ak' ? lesson.contentAk : lesson.contentEn} />
                  <div className="h-4 w-px bg-slate-200" />
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Available in English & Twi
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
