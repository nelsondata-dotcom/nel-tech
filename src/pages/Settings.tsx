import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, Save, CheckCircle2, AlertCircle, User, Shield, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessProfile, setBusinessProfile] = useState({
    name: '',
    industry: '',
    location: '',
    foundedYear: '',
    employeeCount: '',
    description: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyReports: true,
    currencyDisplay: 'GH₵'
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.businessProfile) setBusinessProfile(data.businessProfile);
          if (data.preferences) setPreferences(data.preferences);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        businessProfile,
        preferences,
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business Settings</h2>
        <p className="text-slate-500 text-sm">Manage your business profile and application preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business Profile Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-900">Business Identity</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Name</label>
              <input 
                type="text" 
                value={businessProfile.name}
                onChange={(e) => setBusinessProfile({ ...businessProfile, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="Acme Ghana Ltd"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Industry</label>
              <select 
                value={businessProfile.industry}
                onChange={(e) => setBusinessProfile({ ...businessProfile, industry: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              >
                <option value="">Select Industry</option>
                <option value="Retail">Retail</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Technology">Technology</option>
                <option value="Services">Services</option>
                <option value="Construction">Construction</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
              <input 
                type="text" 
                value={businessProfile.location}
                onChange={(e) => setBusinessProfile({ ...businessProfile, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="Accra, Ghana"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Employee Count</label>
              <input 
                type="number" 
                value={businessProfile.employeeCount}
                onChange={(e) => setBusinessProfile({ ...businessProfile, employeeCount: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="10"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Business Description</label>
            <textarea 
              value={businessProfile.description}
              onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-32"
              placeholder="Tell us about your business goals and services..."
            />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900">App Preferences</h3>
          </div>

          <div className="space-y-4">
            <PreferenceToggle 
              label="Email Notifications" 
              description="Receive alerts about financial risks and trends."
              checked={preferences.emailNotifications}
              onChange={(val: boolean) => setPreferences({ ...preferences, emailNotifications: val })}
            />
            <PreferenceToggle 
              label="Weekly Reports" 
              description="Get a summary of your business performance every Monday."
              checked={preferences.weeklyReports}
              onChange={(val: boolean) => setPreferences({ ...preferences, weeklyReports: val })}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {success && (
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-left-2 border border-emerald-100">
                <CheckCircle2 className="w-4 h-4" />
                Settings updated
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl text-sm font-bold border border-red-100">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function PreferenceToggle({ label, description, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <button 
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "w-12 h-6 rounded-full transition-all relative",
          checked ? "bg-emerald-500" : "bg-slate-200"
        )}
      >
        <div className={cn(
          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
          checked ? "left-7" : "left-1"
        )} />
      </button>
    </div>
  );
}
