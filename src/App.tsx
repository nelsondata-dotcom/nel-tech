import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { FinancialProvider } from './contexts/FinancialContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

// Pages
import { Dashboard } from './pages/Dashboard';
import { DataEntry } from './pages/DataEntry';
import { Analysis } from './pages/Analysis';
import { CashFlow } from './pages/CashFlow';
import { Assistant } from './pages/Assistant';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Education } from './pages/Education';
import { Auth } from './pages/Auth';
import { BankAnalysis } from './pages/BankAnalysis';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { ContentManagement } from './pages/admin/ContentManagement';
import { Announcements } from './pages/admin/Announcements';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <FinancialProvider>
          <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/input" element={
              <ProtectedRoute>
                <AppLayout><DataEntry /></AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/analysis" element={
              <ProtectedRoute>
                <AppLayout><Analysis /></AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/cash-flow" element={
              <ProtectedRoute>
                <AppLayout><CashFlow /></AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/assistant" element={
              <ProtectedRoute>
                <AppLayout><Assistant /></AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <AppLayout><Reports /></AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/education" element={
              <ProtectedRoute>
                <AppLayout><Education /></AppLayout>
              </ProtectedRoute>
            } />

            <Route path="/bank-analysis" element={
              <ProtectedRoute>
                <AppLayout><BankAnalysis /></AppLayout>
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AppLayout><AdminDashboard /></AppLayout>
              </AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute>
                <AppLayout><UserManagement /></AppLayout>
              </AdminRoute>
            } />
            <Route path="/admin/content" element={
              <AdminRoute>
                <AppLayout><ContentManagement /></AppLayout>
              </AdminRoute>
            } />
            <Route path="/admin/announcements" element={
              <AdminRoute>
                <AppLayout><Announcements /></AppLayout>
              </AdminRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        </FinancialProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
