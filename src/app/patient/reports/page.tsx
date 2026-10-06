'use client';

import React, { useState } from 'react';
import { 
  INITIAL_MEDICAL_REPORTS, 
  INITIAL_BIOMARKERS 
} from '@/lib/reports-data';
import { MedicalReport, Biomarker } from '@/lib/types';
import { BiomarkerTrendChart } from '@/components/patient/reports/BiomarkerTrendChart';
import { PlainEnglishCard } from '@/components/patient/reports/PlainEnglishCard';
import { ComparisonMatrix } from '@/components/patient/reports/ComparisonMatrix';
import { ReportUploadModal } from '@/components/patient/reports/ReportUploadModal';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Download, 
  Calendar, 
  Building2, 
  User, 
  Activity, 
  ShieldCheck,
  Heart,
  Droplet,
  Layers,
  BarChart3,
  BookOpen
} from 'lucide-react';

export default function PatientReportsPage() {
  const [reports, setReports] = useState<MedicalReport[]>(INITIAL_MEDICAL_REPORTS);
  const [biomarkers, setBiomarkers] = useState<Biomarker[]>(INITIAL_BIOMARKERS);
  const [activeTab, setActiveTab] = useState<'trends' | 'comparison' | 'glossary' | 'archive'>('trends');
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0].id);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [showExportSuccess, setShowExportSuccess] = useState<boolean>(false);

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  const handleReportImported = (newReport: MedicalReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReportId(newReport.id);
    
    // Merge or update biomarkers if new ones arrived
    if (newReport.biomarkers && newReport.biomarkers.length > 0) {
      setBiomarkers((prev) => {
        const updated = [...prev];
        newReport.biomarkers.forEach((nb) => {
          const index = updated.findIndex((b) => b.name === nb.name);
          if (index >= 0) {
            updated[index] = nb;
          } else {
            updated.push(nb);
          }
        });
        return updated;
      });
    }
  };

  const handleExportSummary = () => {
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Page Title & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 mb-2">
            <Heart className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
            <span>Longitudinal Health Records &amp; Medical Insights</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Medical Reports &amp; Health Growth Tracking
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Import and store clinical lab results. We break down medical jargon into plain, everyday language and plot multi-month trends so you can see your body&apos;s true healing progress.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportSummary}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Health Summary</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import / Add Lab Report</span>
          </button>
        </div>
      </div>

      {showExportSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              Comprehensive Longitudinal Health Summary exported to PDF (Includes all 8 tracked biomarkers &amp; doctor notes).
            </span>
          </div>
          <span className="font-mono text-[11px] text-emerald-600">Generated</span>
        </div>
      )}

      {/* Top Health Progress & Plain-English Overview Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-cyan-900/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left Column: Health Score Gauge */}
          <div className="flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-6 lg:pb-0 lg:pr-6">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-2xl bg-slate-800/80 border border-cyan-500/30 shadow-inner">
              <div className="text-center">
                <span className="text-3xl font-black font-mono text-cyan-400">
                  {activeReport.overallHealthScore}
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1">/ 100</span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-0.5 rounded-full mb-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+28 pts Since Jan 2026</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Overall Health Status: {activeReport.overallStatus}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Active Patient: <strong className="text-slate-200">Rahul Sharma</strong> • ABDM ID: <strong className="text-slate-200">ABDM-9942-8812</strong>
              </p>
            </div>
          </div>

          {/* Right Column (2 cols): Layman AI Summary of Whole Journey */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-300">
                Doctor &amp; AI Plain-English Health Assessment
              </h4>
            </div>

            <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
              {activeReport.summaryPlainEnglish}
            </p>

            {/* Quick bullet points of key improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              {activeReport.aiInsights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Switcher & View Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'trends'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Health Growth &amp; Trend Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'comparison'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Longitudinal Matrix (Past vs Present)</span>
          </button>

          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'glossary'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Plain-English Medical Glossary ({biomarkers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'archive'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Uploaded Reports Archive ({reports.length})</span>
          </button>
        </div>

        {/* Active Report Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0">Viewing Diagnostic Report:</span>
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.date} — {r.title.split('Diagnostic')[0].trim()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab 1: Growth Charts & Longitudinal Trends */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <BiomarkerTrendChart biomarkers={biomarkers} />
        </div>
      )}

      {/* Tab 2: Comparative Matrix */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <ComparisonMatrix biomarkers={biomarkers} />
        </div>
      )}

      {/* Tab 3: Plain English Glossary & Individual Cards */}
      {activeTab === 'glossary' && (
        <div className="space-y-6">
          <div className="bg-cyan-50/70 dark:bg-cyan-950/20 rounded-2xl border border-cyan-100 dark:border-cyan-900/30 p-4 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 dark:text-white block font-bold">
                Why Plain English Matters in Healthcare
              </strong>
              <span>
                Standard pathology printouts are full of intimidating scientific acronyms (like HbA1c, SGPT, eGFR) with zero explanations. Below is your personalized translation guide: what each metric actually does in your body and how your daily habits directly impact it.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {biomarkers.map((bio) => (
              <PlainEnglishCard key={bio.id} biomarker={bio} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Uploaded Documents Archive */}
      {activeTab === 'archive' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-md">
                      {rep.category}
                    </span>
                    <span className="text-xs text-slate-400">{rep.date}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {rep.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {rep.laboratory}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Consultant: {rep.doctorName}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Lab
                  </span>
                  <button
                    onClick={() => {
                      setSelectedReportId(rep.id);
                      setActiveTab('trends');
                    }}
                    className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    View Analysis ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload / Import Modal */}
      <ReportUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onReportImported={handleReportImported}
      />
    </div>
  );
}
