'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { Clock, UserCheck, Stethoscope, ArrowRight, AlertCircle, Sparkles, CheckCircle2, MapPin } from 'lucide-react';

interface ActiveQueueCardProps {
  onOpenJoinModal?: () => void;
}

export function ActiveQueueCard({ onOpenJoinModal }: ActiveQueueCardProps) {
  const { queue, currentUserToken, getMyQueueItem, getMyPosition } = useQueue();

  const myItem = getMyQueueItem();
  const position = getMyPosition();

  // If user has no active token or was already completed
  if (!myItem) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-xl backdrop-blur-md">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">No Active Queue Token</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              You are currently not queued for any medical consultation. Join an outpatient queue in 3 simple steps.
            </p>
          </div>
          <button
            onClick={onOpenJoinModal}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <span>Join a Queue Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Calculate patients ahead
  const isConsulting = myItem.status === 'IN_CONSULTATION';
  const isNext = myItem.status === 'NEXT';
  const patientsAhead = isConsulting ? 0 : isNext ? 1 : Math.max(0, position - 1);

  // Status badge colors
  const statusBadge = isConsulting
    ? { label: 'IN CONSULTATION', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' }
    : isNext
    ? { label: 'NEXT IN LINE', bg: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/40 animate-pulse' }
    : { label: 'WAITING IN QUEUE', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl backdrop-blur-xl transition-all"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-400/10 dark:bg-cyan-400/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {myItem.departmentName}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800">
              {myItem.roomNumber}
            </span>
          </div>

          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Your Token Number
          </h2>
          <div className="flex flex-wrap items-baseline gap-4 mt-1">
            <span className="text-5xl sm:text-6xl lg:text-7xl font-black font-mono tracking-tight text-slate-950 dark:text-white">
              {myItem.tokenNumber}
            </span>
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Patient: <strong className="text-slate-900 dark:text-white font-bold">{myItem.patient.name}</strong>
              <span className="block text-[11px] text-slate-500 font-mono mt-0.5">{myItem.patient.uhid}</span>
            </div>
          </div>
        </div>

        {/* High-Contrast KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left shadow-sm">
            <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase font-bold block">Position</span>
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {isConsulting ? '00' : isNext ? '01' : String(position).padStart(2, '0')}
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">in active line</span>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/70 text-left shadow-sm">
            <span className="text-[11px] text-cyan-800 dark:text-cyan-300 uppercase font-bold block">Est. Wait</span>
            <div className="text-3xl font-black font-mono text-cyan-700 dark:text-cyan-300 mt-1">
              {isConsulting ? '0 min' : `~${myItem.estimatedWaitMinutes} min`}
            </div>
            <span className="text-[11px] text-cyan-800 dark:text-cyan-400 font-medium">5m per patient</span>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left shadow-sm">
            <span className="text-[11px] text-slate-600 dark:text-slate-300 uppercase font-bold block">Consultant</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
              {myItem.doctorName}
            </div>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">{myItem.roomNumber}</span>
          </div>
        </div>
      </div>

      {/* Circular Progress & Visual Track */}
      <div className="py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-4">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Interactive Queue Progress
          </span>
          <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-200 dark:border-cyan-800">
            {isConsulting
              ? '● You are currently in Room 102'
              : isNext
              ? '● You are next! Please be standing by Room 102'
              : `● ${patientsAhead} patient${patientsAhead === 1 ? '' : 's'} ahead of you`}
          </span>
        </div>

        {/* Progress track */}
        <div className="relative flex items-center justify-between w-full px-4 py-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          {/* Connector line */}
          <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 dark:bg-slate-700 -z-0" />
          <div
            className="absolute left-10 top-1/2 -translate-y-1/2 h-1.5 bg-cyan-500 -z-0 transition-all duration-500"
            style={{
              width: isConsulting ? 'calc(100% - 80px)' : isNext ? '75%' : `${Math.max(20, 100 - position * 22)}%`,
            }}
          />

          {/* Node 1: Token Generation */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md font-bold text-xs ring-4 ring-white dark:ring-slate-900">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2">Registered</span>
          </div>

          {/* Node 2: Waiting in Lounge */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-md ring-4 ring-white dark:ring-slate-900 transition-all ${
              position > 1 ? 'bg-cyan-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}>
              ●
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2">Waiting (You)</span>
          </div>

          {/* Node 3: Called Next */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-md ring-4 ring-white dark:ring-slate-900 transition-all ${
              isNext ? 'bg-cyan-500 text-slate-950 animate-bounce' : isConsulting ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              {isNext || isConsulting ? '●' : '○'}
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2">Called Next</span>
          </div>

          {/* Node 4: Doctor Consultation */}
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ring-4 ring-white dark:ring-slate-900 transition-all ${
              isConsulting ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/40' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}>
              <Stethoscope className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mt-2">Consultation</span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          <span>Real-time hospital synchronization active. Chimes notify on turn.</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href="/patient/queue"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md transition-all active:scale-95"
          >
            <span>View Live Queue Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
