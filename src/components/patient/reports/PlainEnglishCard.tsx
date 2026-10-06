'use client';

import React, { useState } from 'react';
import { Biomarker } from '@/lib/types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Stethoscope,
  Info
} from 'lucide-react';

interface PlainEnglishCardProps {
  biomarker: Biomarker;
}

export function PlainEnglishCard({ biomarker }: PlainEnglishCardProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  const baseline = biomarker.historicalValues[0]?.value ?? biomarker.value;
  const current = biomarker.value;
  const delta = current - baseline;

  const isLowerBetter = [
    'bio-hba1c',
    'bio-glucose',
    'bio-ldl',
    'bio-triglycerides',
    'bio-creatinine',
    'bio-sgpt',
  ].includes(biomarker.id);

  const isImproved = isLowerBetter ? delta < 0 : delta > 0;
  const isUnchanged = delta === 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
      {/* Top Bar: Name, Category, Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md">
            {biomarker.category}
          </span>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {biomarker.name}
          </h4>
          <span className="text-xs text-slate-400 italic">
            Lab term: {biomarker.scientificName}
          </span>
        </div>

        {/* Status Badge */}
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            biomarker.status === 'OPTIMAL'
              ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}
        >
          {biomarker.status === 'OPTIMAL' ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5" />
          )}
          {biomarker.status}
        </span>
      </div>

      {/* Primary Value & Trend Row */}
      <div className="flex items-baseline justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 mb-3">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Current Reading</span>
          <div className="text-2xl font-mono font-black text-slate-900 dark:text-white">
            {biomarker.value} <span className="text-sm font-sans font-normal text-slate-500">{biomarker.unit}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 dark:text-slate-400">Standard Target</span>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {biomarker.normalRange}
          </div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[11px] font-bold">
            {isUnchanged ? (
              <span className="text-slate-500 inline-flex items-center gap-0.5">
                <Minus className="w-3 h-3" /> Stable
              </span>
            ) : isImproved ? (
              <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                {isLowerBetter ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                {Math.abs(delta).toFixed(1)} {biomarker.unit} Better
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                {Math.abs(delta).toFixed(1)} {biomarker.unit} Higher
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Plain English Translation Box */}
      <div className="p-3.5 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
        <div className="flex items-center gap-1.5 font-bold text-cyan-900 dark:text-cyan-200 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
          <span>In Simple Everyday Words:</span>
        </div>
        <p>{biomarker.plainEnglishExplanation}</p>
      </div>

      {/* Action / Recommendation Callout */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-900 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/30 mb-3">
        <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Next Steps: </span>
          <span>{biomarker.recommendation}</span>
        </div>
      </div>

      {/* Historical progression mini timeline */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span>Timeline:</span>
        <div className="flex items-center gap-2">
          {biomarker.historicalValues.map((h, i) => (
            <span key={i} className="inline-flex items-center gap-1 font-mono">
              <span className="text-slate-500">{h.label.split(' ')[0]}:</span>
              <strong className="text-slate-700 dark:text-slate-300">{h.value}</strong>
              {i < biomarker.historicalValues.length - 1 && <span className="text-slate-400">➔</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
