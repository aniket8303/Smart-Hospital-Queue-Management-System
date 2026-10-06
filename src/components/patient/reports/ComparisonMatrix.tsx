'use client';

import React, { useState } from 'react';
import { Biomarker } from '@/lib/types';
import { 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Filter,
  Layers
} from 'lucide-react';

interface ComparisonMatrixProps {
  biomarkers: Biomarker[];
}

export function ComparisonMatrix({ biomarkers }: ComparisonMatrixProps) {
  const [filter, setFilter] = useState<'ALL' | 'IMPROVING' | 'STABLE'>('ALL');

  const filtered = biomarkers.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'IMPROVING') return b.trend === 'IMPROVING';
    if (filter === 'STABLE') return b.trend === 'STABLE';
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-4 h-4" />
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Longitudinal Comparison Matrix
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Side-by-side progression across your baseline, mid-year checkup, and latest diagnostics.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Metrics ({biomarkers.length})
          </button>
          <button
            onClick={() => setFilter('IMPROVING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'IMPROVING'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Improving Only
          </button>
          <button
            onClick={() => setFilter('STABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'STABLE'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            Stable Normal
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
              <th className="py-3.5 px-4 font-bold">Biomarker / Test</th>
              <th className="py-3.5 px-3 font-bold">Standard Target</th>
              <th className="py-3.5 px-3 font-bold text-center">Jan 2026 (Baseline)</th>
              <th className="py-3.5 px-3 font-bold text-center">Jun 2026 (Mid-Year)</th>
              <th className="py-3.5 px-3 font-bold text-center bg-cyan-50/50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-300">
                Oct 2026 (Latest)
              </th>
              <th className="py-3.5 px-3 font-bold text-right">Net Change</th>
              <th className="py-3.5 px-4 font-bold text-right">Condition Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((item) => {
              const janVal = item.historicalValues[0]?.value ?? item.value;
              const junVal = item.historicalValues[1]?.value ?? item.value;
              const octVal = item.value;
              const netChange = octVal - janVal;

              const isLowerBetter = [
                'bio-hba1c',
                'bio-glucose',
                'bio-ldl',
                'bio-triglycerides',
                'bio-creatinine',
                'bio-sgpt',
              ].includes(item.id);

              const isNetImproved = isLowerBetter ? netChange < 0 : netChange > 0;
              const isNetZero = netChange === 0;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Name and Layman summary */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.scientificName}
                    </div>
                  </td>

                  {/* Normal Standard */}
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {item.normalRange}
                  </td>

                  {/* Jan 2026 */}
                  <td className="py-3.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                    {janVal} {item.unit}
                  </td>

                  {/* Jun 2026 */}
                  <td className="py-3.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                    {junVal} {item.unit}
                  </td>

                  {/* Oct 2026 */}
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-50/30 dark:bg-cyan-950/10">
                    {octVal} {item.unit}
                  </td>

                  {/* Net Change */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold">
                    {isNetZero ? (
                      <span className="text-slate-400 text-xs">No change</span>
                    ) : isNetImproved ? (
                      <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                        {isLowerBetter ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                        {netChange > 0 ? `+${netChange.toFixed(1)}` : netChange.toFixed(1)} {item.unit}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 inline-flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{netChange.toFixed(1)} {item.unit}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'OPTIMAL'
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.status === 'OPTIMAL' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
