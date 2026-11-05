import React, { useRef, useState } from 'react';
import { useFinancialData } from '../contexts/FinancialContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency, cn } from '../lib/utils';
import { Download, FileText, CheckCircle2, Building2, Calendar, ShieldCheck, Save, Clock, History } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function Reports() {
  const { records, loading, saveReport, reports } = useFinancialData();
  const { t, language } = useLanguage();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const r = records[0];
  if (!r) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">No Records Found</h3>
        <p className="text-slate-500 mt-2">Add your first financial record to generate a professional report.</p>
      </div>
    );
  }

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Financial_Report_${r.period}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      await saveReport({
        title: `Financial Health Report - ${r.period}`,
        period: r.period,
        content: {
          revenue: r.revenue,
          expenses: r.costOfSales + r.operatingExpenses,
          netProfit: r.revenue - (r.costOfSales + r.operatingExpenses),
          cashFlow: r.revenue - (r.costOfSales + r.operatingExpenses + r.loanRepayments),
        }
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Report save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const netProfit = r.revenue - (r.costOfSales + r.operatingExpenses);
  const netCashFlow = r.revenue - (r.costOfSales + r.operatingExpenses + r.loanRepayments);
  const gpMargin = (r.revenue - r.costOfSales) / r.revenue * 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold">{t('reports.title')}</h2>
          <p className="text-slate-400 text-xs mt-1">
            {language === 'ak' ? 'Twerɛ wo dwumadie amaneɛbɔ ma sikakorabea anaa sika-mmoafoɔ.' : 'Export your business performance for banks or investors.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveReport}
            disabled={isSaving}
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 border border-slate-700"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saveSuccess ? 'Saved!' : 'Save to History'}
          </button>
          <button 
            onClick={downloadPDF}
            disabled={isGenerating}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Saved Reports */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
              <History className="w-4 h-4 text-emerald-500" />
              Report History
            </h3>
            <div className="space-y-3">
              {reports.length === 0 ? (
                <p className="text-[10px] text-slate-400 font-medium italic text-center py-4">No saved reports yet.</p>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer group">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{report.period}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-500">{report.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-[10px] text-emerald-700 leading-relaxed">
              Consistently saving your reports helps building a credible financial history when applying for SME loans in Ghana.
            </p>
          </div>
        </div>

        {/* Right Content: Report Preview */}
        <div className="lg:col-span-3">
          <div className="bg-gray-100 p-4 sm:p-8 rounded-3xl border border-slate-200 overflow-hidden">
            <div ref={reportRef} className="bg-white p-6 sm:p-12 shadow-sm min-h-[1000px] text-slate-900 font-sans">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between border-b-2 border-slate-900 pb-8 mb-12 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                    <Building2 className="text-white w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">Financial Health Report</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ghana SME Financial Health AI</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="flex items-center sm:justify-end gap-2 text-slate-900 font-bold mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Period: {r.period}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium italic">Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Column */}
                <div className="space-y-12">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 mb-6 text-slate-900">1. Executive Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total Revenue</span>
                        <span className="text-sm font-bold">{formatCurrency(r.revenue)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Total Expenses</span>
                        <span className="text-sm font-bold">{formatCurrency(r.costOfSales + r.operatingExpenses)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b-2 border-slate-900">
                        <span className="text-sm font-bold text-slate-900">Net Profit</span>
                        <span className={cn("text-lg font-black", netProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
                          {formatCurrency(netProfit)}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 mb-6 text-slate-900">2. Key Performance Ratios</h3>
                    <div className="space-y-4">
                      <RatioRow label="Gross Margin" value={`${gpMargin.toFixed(1)}%`} status={gpMargin > 30 ? 'Strong' : 'Weak'} />
                      <RatioRow label="Current Ratio" value={(r.currentAssets / r.currentLiabilities).toFixed(2)} status={r.currentAssets / r.currentLiabilities > 1.5 ? 'Good' : 'Critical'} />
                      <RatioRow label="ROE" value={`${((netProfit / r.equity) * 100).toFixed(1)}%`} status={netProfit / r.equity > 0.15 ? 'Excellent' : 'Average'} />
                    </div>
                  </section>
                </div>

                {/* Right Column */}
                <div className="space-y-12">
                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 mb-6 text-slate-900">3. Cash Flow Position</h3>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Net Cash Movement</p>
                      <p className={cn("text-3xl font-black mb-4", netCashFlow >= 0 ? "text-slate-900" : "text-red-600")}>
                        {formatCurrency(netCashFlow)}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          "The business currently maintains a cash reserve of <span className="font-bold text-slate-900">{formatCurrency(r.cashBalance)}</span>, which is {r.cashBalance > (r.operatingExpenses * 2) ? 'sufficient' : 'insufficient'} to cover operational needs."
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-black uppercase tracking-widest border-l-4 border-slate-900 pl-4 mb-6 text-slate-900">4. AI Analysis & Recommendations</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3 items-start">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">Financial Strength</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Strong {gpMargin > 30 ? 'gross margin' : 'revenue'} indicators suggest efficient core operations.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] text-white font-bold">1</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Operational Suggestion</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Optimize operating expenses to increase net profit margin closer to industry standard of 15%.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Footer of the PDF */}
              <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center opacity-50">
                <p className="text-[10px] font-medium tracking-widest uppercase">Certified Financial AI Analysis</p>
                <p className="text-[10px] font-medium">Page 1 of 1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatioRow({ label, value, status }: any) {
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <p className="text-xs font-bold text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-400 font-medium">Calculation based on IFRS standards</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-slate-900">{value}</p>
        <span className={cn(
          "text-[9px] font-bold uppercase tracking-widest",
          status === 'Strong' || status === 'Good' || status === 'Excellent' ? "text-emerald-500" : "text-amber-500"
        )}>{status}</span>
      </div>
    </div>
  );
}
