'use client';

import React, { useState } from 'react';
import { MedicalReport, Biomarker } from '@/lib/types';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Activity,
  ShieldCheck,
  Loader2,
  FileCheck
} from 'lucide-react';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportImported: (report: MedicalReport) => void;
}

export function ReportUploadModal({
  isOpen,
  onClose,
  onReportImported,
}: ReportUploadModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('lipid');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);

  if (!isOpen) return null;

  const templates = [
    {
      id: 'lipid',
      title: 'Cardiac & Lipid Diagnostic Profile',
      lab: "St. Luke's Pathology Laboratories",
      biomarkersCount: 4,
      desc: 'Includes Total Cholesterol, LDL, HDL, and Triglycerides with cardiovascular risk score.',
    },
    {
      id: 'metabolic',
      title: 'Full Metabolic & Glycemic Screen (HbA1c + Fasting)',
      lab: 'Metropolis Diagnostics',
      biomarkersCount: 5,
      desc: 'Long-term glycemic HbA1c control, fasting plasma glucose, and insulin resistance index.',
    },
    {
      id: 'renal',
      title: 'Comprehensive Renal & Liver Enzymes Panel',
      lab: 'Apollo Diagnostic Specialty Center',
      biomarkersCount: 4,
      desc: 'Serum Creatinine, eGFR, Blood Urea Nitrogen, and SGPT/ALT liver transaminases.',
    },
  ];

  const handleStartImport = () => {
    setIsProcessing(true);
    setAnalysisStep(1);

    setTimeout(() => {
      setAnalysisStep(2); // Extracting biomarkers
    }, 900);

    setTimeout(() => {
      setAnalysisStep(3); // Translating into Plain English
    }, 1800);

    setTimeout(() => {
      // Completed, construct imported report
      const newReport: MedicalReport = {
        id: `rep-${Date.now()}`,
        title:
          selectedTemplate === 'lipid'
            ? 'Cardiac & Lipid Diagnostic Profile (New)'
            : selectedTemplate === 'metabolic'
            ? 'Full Metabolic & Glycemic Screen (New)'
            : 'Comprehensive Renal & Liver Enzymes Panel (New)',
        category: 'Outpatient Laboratory',
        date: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        laboratory:
          templates.find((t) => t.id === selectedTemplate)?.lab ||
          'Hospital Diagnostic Wing',
        doctorName: 'Dr. Priya Sharma (Internal Medicine)',
        uploadedAt: 'Just now',
        overallHealthScore: 94,
        overallStatus: 'Improving',
        summaryPlainEnglish:
          'Imported test results analyzed successfully! All tracked parameters align with optimal targets. Your proactive lifestyle interventions show remarkable sustained efficacy across all clinical indices.',
        aiInsights: [
          'High compliance with clinical recommendations noted.',
          'Zero acute inflammatory or metabolic flags detected in this panel.',
          'Longitudinal indicators show steady month-over-month health stabilization.',
        ],
        biomarkers: [
          {
            id: `bio-new-${Date.now()}-1`,
            name: 'HbA1c (3-Month Sugar)',
            scientificName: 'Glycated Hemoglobin',
            category: 'Metabolic & Sugar',
            value: 5.6,
            unit: '%',
            normalRange: '4.0% - 5.6%',
            minNormal: 4.0,
            maxNormal: 5.6,
            status: 'OPTIMAL',
            trend: 'IMPROVING',
            plainEnglishExplanation:
              'Your 90-day average blood sugar has now hit 5.6% — completely inside the optimal green target range!',
            recommendation: 'Keep your balanced daily dietary routine.',
            historicalValues: [
              { date: '2026-01-15', value: 6.4, label: 'Jan Baseline' },
              { date: '2026-06-10', value: 6.1, label: 'Jun Check' },
              { date: '2026-10-06', value: 5.7, label: 'Oct Latest' },
              { date: '2026-10-06', value: 5.6, label: 'Imported' },
            ],
          },
          {
            id: `bio-new-${Date.now()}-2`,
            name: "LDL ('Bad' Cholesterol)",
            scientificName: 'Low-Density Lipoprotein',
            category: 'Heart & Lipids',
            value: 94,
            unit: 'mg/dL',
            normalRange: '< 100 mg/dL',
            minNormal: 50,
            maxNormal: 100,
            status: 'OPTIMAL',
            trend: 'IMPROVING',
            plainEnglishExplanation:
              'Artery-clogging cholesterol is down to 94 mg/dL, safely underneath the 100 mg/dL risk line.',
            recommendation: 'Continue low saturated fat cooking habits.',
            historicalValues: [
              { date: '2026-01-15', value: 142, label: 'Jan Baseline' },
              { date: '2026-06-10', value: 124, label: 'Jun Check' },
              { date: '2026-10-06', value: 98, label: 'Oct Latest' },
              { date: '2026-10-06', value: 94, label: 'Imported' },
            ],
          },
        ],
      };

      onReportImported(newReport);
      setIsProcessing(false);
      setAnalysisStep(0);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Import Medical Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI extracts numerical markers and translates scary jargon into plain language.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {isProcessing ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {analysisStep === 1 && 'Scanning & Validating Document...'}
                  {analysisStep === 2 && 'Extracting Numerical Biomarkers & Units...'}
                  {analysisStep === 3 && 'Translating Medical Terms into Plain English...'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Synchronizing with your historical longitudinal health records
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-3 text-xs font-semibold text-slate-500 pt-3">
                <span className={analysisStep >= 1 ? 'text-cyan-600 dark:text-cyan-400' : ''}>
                  1. Scan PDF
                </span>
                <span>➔</span>
                <span className={analysisStep >= 2 ? 'text-cyan-600 dark:text-cyan-400' : ''}>
                  2. Extract Markers
                </span>
                <span>➔</span>
                <span className={analysisStep >= 3 ? 'text-cyan-600 dark:text-cyan-400' : ''}>
                  3. Layman Explanation
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Drag and Drop Zone */}
              <div 
                onClick={() => setSelectedFileName('Patient_Diagnostic_Report_Oct2026.pdf')}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/30 hover:bg-cyan-50/20 dark:hover:bg-cyan-950/20 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-100/70 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 mx-auto flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                {selectedFileName ? (
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5">
                      <FileCheck className="w-4 h-4" /> {selectedFileName}
                    </div>
                    <p className="text-xs text-slate-500">Document ready for AI parsing</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      Click to browse or drop lab PDF / slip photo
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                      Supports PDF, PNG, JPG, DICOM lab results (up to 25MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Sample Lab Templates selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Or Import Instant Diagnostic Templates:
                </label>
                <div className="space-y-2">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setSelectedFileName(`${tpl.title.replace(/\s+/g, '_')}.pdf`);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        selectedTemplate === tpl.id
                          ? 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/30 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="template"
                        checked={selectedTemplate === tpl.id}
                        onChange={() => {}}
                        className="mt-1 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {tpl.title}
                          </span>
                          <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                            {tpl.biomarkersCount} biomarkers
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {tpl.desc}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1 italic">
                          Accredited: {tpl.lab}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  HIPAA &amp; ABDM compliant: Your lab data is encrypted and strictly accessible only to your patient profile.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStartImport}
            disabled={isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Process &amp; Explain Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
