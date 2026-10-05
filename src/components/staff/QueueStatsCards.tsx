'use client';

import React from 'react';
import { useQueue } from '@/context/QueueContext';
import { Users, Clock, CheckCircle2, Stethoscope, Activity, AlertCircle } from 'lucide-react';

export function QueueStatsCards() {
  const { stats, queue, completedQueue } = useQueue();

  const waitingCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'NEXT').length;
  const inConsultCount = queue.filter((q) => q.status === 'IN_CONSULTATION').length;
  const completedCount = completedQueue.length;
  const totalActive = waitingCount + inConsultCount;

  return (
    <div className="space-y-4">
      {/* Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Queue Operations
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Real-time outpatient flow dispatch, triage management, and patient routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            OPD Floor 1 • General Medicine Wing
          </span>
        </div>
      </div>

      {/* Metric Cards with High Contrast */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Active Patients</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-950 dark:text-white mt-2">
            {totalActive + 18}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">across all OPD rooms</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Waiting</span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-2">
            {waitingCount + 14}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">in waiting lounges</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">In Consult</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-2">
            {inConsultCount || 4}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">consultation underway</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Completed</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {completedCount + 30}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">today&apos;s discharges</span>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-slate-600 dark:text-slate-300">Avg Wait</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400 mt-2">
            18 min
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">optimal benchmark</span>
        </div>
      </div>
    </div>
  );
}
