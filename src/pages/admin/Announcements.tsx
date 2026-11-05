import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { MessageSquare, Plus, Save, Trash2, Megaphone, Info, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  active: boolean;
  createdAt: any;
  expiresAt?: string;
}

export function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Announcement> | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Announcement[];
      setAnnouncements(list);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editing?.title || !editing?.message) return;

    try {
      if (editing.id) {
        const docRef = doc(db, 'announcements', editing.id);
        await updateDoc(docRef, {
          ...editing,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'announcements'), {
          ...editing,
          type: editing.type || 'info',
          active: editing.active ?? true,
          createdAt: serverTimestamp()
        });
      }
      setEditing(null);
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Announcements</h1>
          <p className="text-slate-500 mt-1">Broadcast important updates and alerts to all platform users.</p>
        </div>
        
        <button 
          onClick={() => setEditing({ title: '', message: '', type: 'info', active: true })}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          Create Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-4">
          {announcements.map(item => (
            <div 
              key={item.id}
              className={cn(
                "p-6 bg-white rounded-3xl border transition-all hover:shadow-md group",
                item.active ? "border-slate-200" : "border-slate-100 opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    item.type === 'critical' ? "bg-red-50 text-red-500" :
                    item.type === 'warning' ? "bg-amber-50 text-amber-500" :
                    "bg-blue-50 text-blue-500"
                  )}>
                    {item.type === 'critical' ? <AlertCircle className="w-6 h-6" /> :
                     item.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> :
                     <Info className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none mb-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString() : 'Just now'}
                      <span className="text-slate-200">|</span>
                      <span className={item.active ? "text-emerald-500" : "text-slate-400"}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing(item)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{item.message}</p>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
              <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No announcements broadcasted yet.</p>
            </div>
          )}
        </div>

        {/* Form Sidebar */}
        <div className="xl:col-span-1">
          {editing ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-8">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-emerald-500" />
                  {editing.id ? 'Edit Broadcast' : 'New Broadcast'}
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Title</label>
                  <input 
                    type="text" 
                    value={editing.title}
                    onChange={(e) => setEditing({...editing, title: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    placeholder="E.g., Tax Deadline Reminder"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['info', 'warning', 'critical'].map(t => (
                      <button
                        key={t}
                        onClick={() => setEditing({...editing, type: t as any})}
                        className={cn(
                          "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                          editing.type === t 
                            ? (t === 'critical' ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20" :
                               t === 'warning' ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20" :
                               "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20")
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Message</label>
                  <textarea 
                    value={editing.message}
                    onChange={(e) => setEditing({...editing, message: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium min-h-[120px]"
                    placeholder="Enter broadcast message..."
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <button 
                    onClick={() => setEditing({...editing, active: !editing.active})}
                    className={cn(
                      "w-10 h-6 rounded-full transition-colors relative",
                      editing.active ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform",
                      editing.active && "translate-x-4"
                    )} />
                  </button>
                  <span className="text-xs font-bold text-slate-600">Visible to all users</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setEditing(null)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                  >
                    Broadcast
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400">
              <Megaphone className="w-10 h-10 mx-auto mb-4 opacity-10" />
              <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
                Click "Create Broadcast" <br />to start a new alert.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Edit2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
      <path d="m15 5 4 4"></path>
    </svg>
  );
}
