import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';

export interface FinancialRecord {
  id: string;
  userId: string;
  period: string;
  revenue: number;
  costOfSales: number;
  operatingExpenses: number;
  cashBalance: number;
  currentAssets: number;
  currentLiabilities: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  loanRepayments: number;
  createdAt: any;
  updatedAt: any;
}

interface FinancialContextType {
  records: FinancialRecord[];
  loading: boolean;
  addRecord: (data: Omit<FinancialRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (id: string, data: Partial<FinancialRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  exportToCSV: () => void;
  reports: any[];
  saveReport: (data: any) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setReports([]);
      setLoading(false);
      return;
    }

    const recordsQ = query(
      collection(db, 'users', user.uid, 'financialRecords'),
      orderBy('period', 'desc')
    );

    const reportsQ = query(
      collection(db, 'users', user.uid, 'reports'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeRecords = onSnapshot(recordsQ, (snapshot) => {
      const newRecords = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FinancialRecord[];
      setRecords(newRecords);
    }, (error) => {
      console.error("Firestore Records Error:", error);
    });

    const unsubscribeReports = onSnapshot(reportsQ, (snapshot) => {
      const newReports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(newReports);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Reports Error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeRecords();
      unsubscribeReports();
    };
  }, [user]);

  const addRecord = async (data: any) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'financialRecords'), {
      ...data,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const saveReport = async (data: any) => {
    if (!user) return;
    await addDoc(collection(db, 'users', user.uid, 'reports'), {
      ...data,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  const updateRecord = async (id: string, data: any) => {
    if (!user) return;
    const recordRef = doc(db, 'users', user.uid, 'financialRecords', id);
    await updateDoc(recordRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteRecord = async (id: string) => {
    if (!user) return;
    const recordRef = doc(db, 'users', user.uid, 'financialRecords', id);
    await deleteDoc(recordRef);
  };

  const exportToCSV = () => {
    if (records.length === 0) return;

    const headers = [
      'Period', 'Revenue', 'Cost of Sales', 'Operating Expenses', 
      'Cash Balance', 'Current Assets', 'Current Liabilities', 
      'Total Assets', 'Total Liabilities', 'Equity', 'Loan Repayments'
    ];

    const csvRows = [
      headers.join(','),
      ...records.map(r => [
        r.period,
        r.revenue,
        r.costOfSales,
        r.operatingExpenses,
        r.cashBalance,
        r.currentAssets,
        r.currentLiabilities,
        r.totalAssets,
        r.totalLiabilities,
        r.equity,
        r.loanRepayments
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SME_Financial_Data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FinancialContext.Provider value={{ 
      records, 
      loading, 
      addRecord, 
      updateRecord, 
      deleteRecord, 
      exportToCSV,
      reports,
      saveReport
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancialData = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialProvider');
  }
  return context;
};
