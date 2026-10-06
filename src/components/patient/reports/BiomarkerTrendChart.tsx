'use client';

import React, { useState } from 'react';
import { Biomarker } from '@/lib/types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface BiomarkerTrendChartProps {
  biomarkers: Biomarker[];
}

export function BiomarkerTrendChart({ biomarkers }: BiomarkerTrendChartProps) {
  const [selectedBiomarkerId, setSelectedBiomarkerId] = useState<string>(
    biomarkers[0]?.id || 'bio-hba1c'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const selectedBiomarker =
    biomarkers.find((b) => b.id === selectedBiomarkerId) || biomarkers[0];

  const categories = [
    'All',
    'Metabolic & Sugar',
    'Heart & Lipids',
    'Kidney Function',
    'Blood Cells (CBC)',
    'Liver Function',
  ];

  const filteredBiomarkers =
    categoryFilter === 'All'
      ? biomarkers
      : biomarkers.filter((b) => b.category === categoryFilter);

  // Transform historical points for Recharts
  const chartData = selectedBiomarker
    ? selectedBiomarker.historicalValues.map((item, idx) => ({
        date: item.date,
        label: item.label,
        value: item.value,
        targetMin: selectedBiomarker.minNormal,
        targetMax: selectedBiomarker.maxNormal,
        pointIndex: idx,
      }))
    : [];

  const baselineValue = selectedBiomarker?.historicalValues[0]?.value || 0;
  const currentValue = selectedBiomarker?.value || 0;
  const changeValue = currentValue - baselineValue;
  const changePercent = baselineValue !== 0 ? ((changeValue / baselineValue) * 100).toFixed(1) : '0';

  // Determine if decreasing is good (for HbA1c, LDL, Triglycerides, ALT) or increasing is good (HDL, Hemoglobin)
  const isLowerBetter = ['bio-hba1c', 'bio-glucose', 'bio-ldl', 'bio-triglycerides', 'bio-creatinine', 'bio-sgpt'].includes(
    selectedBiomarker?.id || ''
  );
  const isImproving = isLowerBetter ? changeValue <= 0 : changeValue >= 0;

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/60 backdrop-blur-md text-xs space-y-1 z-50">
          <div className="font-bold text-cyan-300">{data.label}</div>
          <div className="text-slate-400">{data.date}</div>
          <div className="text-sm font-semibold text-white">
            Reading: <span className="font-mono text-emerald-400 font-bold">{data.value} {selectedBiomarker?.unit}</span>
          </div>
          <div className="text-[11px] text-slate-300 border-t border-slate-800 pt-1 mt-1">
            Normal Standard: {selectedBiomarker?.normalRange}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 md:p-8 shadow-sm">
      {/* Header & Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
              Longitudinal Health Trends &amp; Growth Charts
            </h3>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            Compare past lab values against current checkups with safe reference thresholds.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Biomarker Pill Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
        {filteredBiomarkers.map((bio) => {
          const isSelected = bio.id === selectedBiomarker?.id;
          return (
            <button
              key={bio.id}
              onClick={() => setSelectedBiomarkerId(bio.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-medium shrink-0 border transition-all text-left flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                bio.status === 'OPTIMAL' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <div>
                <div className="font-semibold">{bio.name.split('(')[0].trim()}</div>
                <div className={`text-[10px] ${isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'}`}>
                  {bio.value} {bio.unit}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedBiomarker && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-50/70 dark:bg-slate-950/40 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5">
            {/* Metric Meta Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h4 className="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedBiomarker.name}
                </h4>
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Scientific Name: {selectedBiomarker.scientificName}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedBiomarker.status}
                </span>

                {/* Trend Delta Pill */}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isImproving 
                    ? 'bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                }`}>
                  {isImproving ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  {changePercent}% Since Jan Baseline
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 md:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Reference line for normal boundary if applicable */}
                  {selectedBiomarker.maxNormal && (
                    <ReferenceLine 
                      y={selectedBiomarker.maxNormal} 
                      stroke="#10b981" 
                      strokeDasharray="4 4" 
                      label={{ 
                        value: `Target Normal (≤ ${selectedBiomarker.maxNormal})`, 
                        fill: '#10b981', 
                        fontSize: 10,
                        position: 'insideTopRight'
                      }} 
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0891b2"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#valueGrad)"
                    dot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7, fill: '#0891b2', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Range Legend & Info */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-emerald-500 rounded-full" />
                <span>Healthy Clinical Range: <strong className="text-slate-800 dark:text-slate-200">{selectedBiomarker.normalRange}</strong></span>
              </div>
              <div className="text-[11px] text-slate-400">
                Recorded via Automated Laboratory LIS Integration
              </div>
            </div>
          </div>

          {/* Plain English Layman Explanation & Actionable Guidance (1 Col) */}
          <div className="flex flex-col justify-between bg-gradient-to-br from-cyan-50/70 to-blue-50/40 dark:from-slate-900 dark:to-cyan-950/20 rounded-2xl border border-cyan-100 dark:border-slate-800 p-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Plain English Meaning
                </h5>
              </div>

              <div className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 mb-4">
                <p>{selectedBiomarker.plainEnglishExplanation}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Physician Recommendation:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic">
                  &ldquo;{selectedBiomarker.recommendation}&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Timeline Progression summary */}
            <div className="mt-4 pt-4 border-t border-cyan-200/60 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                TIMELINE RECORD HISTORY
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                {selectedBiomarker.historicalValues.map((pt, idx) => (
                  <div key={idx} className="bg-white/70 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">{pt.label.split(' ')[0]}</div>
                    <div className="font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                      {pt.value} {selectedBiomarker.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
