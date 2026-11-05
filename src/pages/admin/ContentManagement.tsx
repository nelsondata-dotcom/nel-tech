import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FileText, Plus, Save, Trash2, Edit2, BookOpen, Layout, HelpCircle, Landmark } from 'lucide-react';
import { cn } from '../../lib/utils';

type ContentType = 'homepage' | 'faq' | 'education' | 'banks';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt?: any;
}

interface BankMetric {
  id: string;
  name: string;
  car: number;
  npl: number;
  totalAssets: number;
  marketShare: number;
  roa: number;
  strengths: string[];
  weaknesses: string[];
}

export function ContentManagement() {
  const [activeTab, setActiveTab] = useState<ContentType>('education');
  const [articles, setArticles] = useState<Article[]>([]);
  const [banks, setBanks] = useState<BankMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [editingBank, setEditingBank] = useState<Partial<BankMetric> | null>(null);

  useEffect(() => {
    if (activeTab === 'education') {
      fetchArticles();
    } else if (activeTab === 'banks') {
      fetchBanks();
    }
  }, [activeTab]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'educationArticles'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Article[];
      setArticles(list);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'bankMetrics'));
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BankMetric[];
      setBanks(list);
    } catch (error) {
      console.error("Error fetching banks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async () => {
    if (!editingBank?.name) return;
    try {
      if (editingBank.id) {
        await updateDoc(doc(db, 'bankMetrics', editingBank.id), {
          ...editingBank,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'bankMetrics'), {
          ...editingBank,
          updatedAt: serverTimestamp()
        });
      }
      setEditingBank(null);
      fetchBanks();
    } catch (error) {
      console.error("Error saving bank:", error);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!window.confirm("Delete this bank report?")) return;
    try {
      await deleteDoc(doc(db, 'bankMetrics', id));
      fetchBanks();
    } catch (error) {
      console.error("Error deleting bank:", error);
    }
  };

  const handleSaveArticle = async () => {
    if (!editingArticle?.title || !editingArticle?.content) return;

    try {
      if (editingArticle.id) {
        const docRef = doc(db, 'educationArticles', editingArticle.id);
        await updateDoc(docRef, {
          ...editingArticle,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'educationArticles'), {
          ...editingArticle,
          category: editingArticle.category || 'General',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setEditingArticle(null);
      fetchArticles();
    } catch (error) {
      console.error("Error saving article:", error);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteDoc(doc(db, 'educationArticles', id));
      fetchArticles();
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Content CMS</h1>
        <p className="text-slate-500 mt-1">Manage the text, articles, and frequently asked questions across the platform.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        <TabButton 
          active={activeTab === 'homepage'} 
          onClick={() => setActiveTab('homepage')} 
          icon={Layout} 
          label="Home Page" 
        />
        <TabButton 
          active={activeTab === 'faq'} 
          onClick={() => setActiveTab('faq')} 
          icon={HelpCircle} 
          label="FAQ & Support" 
        />
        <TabButton 
          active={activeTab === 'education'} 
          onClick={() => setActiveTab('education')} 
          icon={BookOpen} 
          label="Education" 
        />
        <TabButton 
          active={activeTab === 'banks'} 
          onClick={() => setActiveTab('banks')} 
          icon={Landmark} 
          label="Bank Analysis" 
        />
      </div>

      {activeTab === 'banks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <button 
              onClick={() => setEditingBank({ 
                name: '', car: 13, npl: 18.9, totalAssets: 0, 
                marketShare: 0, roa: 0, strengths: [], weaknesses: [] 
              })}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all font-black text-xs uppercase tracking-widest"
            >
              <Plus className="w-5 h-5" />
              Add Bank Report
            </button>

            <div className="space-y-3">
              {banks.map(bank => (
                <div 
                  key={bank.id}
                  onClick={() => setEditingBank(bank)}
                  className={cn(
                    "p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer transition-all hover:shadow-md",
                    editingBank?.id === bank.id && "border-emerald-500 ring-2 ring-emerald-500/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">
                      CAR: {bank.car}%
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteBank(bank.id); }}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{bank.name}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {editingBank ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-emerald-500" />
                    {editingBank.id ? 'Edit Bank Metric' : 'New Bank Metric'}
                  </h3>
                  <button 
                    onClick={handleSaveBank}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Bank Data
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Bank Name</label>
                      <input 
                        type="text" 
                        value={editingBank.name}
                        onChange={(e) => setEditingBank({...editingBank, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">CAR (%)</label>
                        <input 
                          type="number" 
                          value={editingBank.car}
                          onChange={(e) => setEditingBank({...editingBank, car: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">NPL (%)</label>
                        <input 
                          type="number" 
                          value={editingBank.npl}
                          onChange={(e) => setEditingBank({...editingBank, npl: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Assets (GH₵)</label>
                        <input 
                          type="number" 
                          value={editingBank.totalAssets}
                          onChange={(e) => setEditingBank({...editingBank, totalAssets: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Market Share (%)</label>
                        <input 
                          type="number" 
                          value={editingBank.marketShare}
                          onChange={(e) => setEditingBank({...editingBank, marketShare: parseFloat(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Strengths (Comma separated)</label>
                      <textarea 
                        value={editingBank.strengths?.join(', ')}
                        onChange={(e) => setEditingBank({...editingBank, strengths: e.target.value.split(',').map(s => s.trim())})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Weaknesses (Comma separated)</label>
                      <textarea 
                        value={editingBank.weaknesses?.join(', ')}
                        onChange={(e) => setEditingBank({...editingBank, weaknesses: e.target.value.split(',').map(s => s.trim())})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[500px] bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <Landmark className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">Select a bank to update its financial data.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'education' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-1 space-y-4">
            <button 
              onClick={() => setEditingArticle({ title: '', content: '', category: 'Finance' })}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all font-black text-xs uppercase tracking-widest"
            >
              <Plus className="w-5 h-5" />
              Add New Article
            </button>

            <div className="space-y-3">
              {articles.map(article => (
                <div 
                  key={article.id}
                  onClick={() => setEditingArticle(article)}
                  className={cn(
                    "p-4 bg-white rounded-2xl border border-slate-200 cursor-pointer transition-all hover:shadow-md",
                    editingArticle?.id === article.id && "border-emerald-500 ring-2 ring-emerald-500/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">
                      {article.category}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article.id); }}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">{article.title}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {editingArticle ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-emerald-500" />
                    {editingArticle.id ? 'Edit Article' : 'New Article'}
                  </h3>
                  <button 
                    onClick={handleSaveArticle}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Title</label>
                    <input 
                      type="text" 
                      value={editingArticle.title}
                      onChange={(e) => setEditingArticle({...editingArticle, title: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                      placeholder="Article Title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Category</label>
                      <select 
                        value={editingArticle.category}
                        onChange={(e) => setEditingArticle({...editingArticle, category: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                      >
                        <option value="Finance">Finance</option>
                        <option value="Tax">Tax</option>
                        <option value="Legal">Legal</option>
                        <option value="Growth">Growth</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Content (HTML/Rich Text)</label>
                    <textarea 
                      value={editingArticle.content}
                      onChange={(e) => setEditingArticle({...editingArticle, content: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[400px]"
                      placeholder="Write your article content here..."
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[600px] bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-medium">Select an article to edit or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {(activeTab === 'homepage' || activeTab === 'faq') && (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
          <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">CMS for {activeTab} is coming soon in the next update.</p>
          <button className="mt-6 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
            Unlock Feature
          </button>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function Activity({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}
