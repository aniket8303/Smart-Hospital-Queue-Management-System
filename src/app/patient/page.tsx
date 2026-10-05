'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { ActiveQueueCard } from '@/components/patient/ActiveQueueCard';
import { QueueTimeline } from '@/components/patient/QueueTimeline';
import { JoinQueueModal } from '@/components/patient/JoinQueueModal';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  PlusCircle, 
  ShieldCheck, 
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  const { queue, currentUserToken } = useQueue();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const myItem = queue.find((q) => q.tokenNumber === currentUserToken);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Patient Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Good morning, Aniket
            </h1>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your healthcare queue at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Join New Queue</span>
          </button>
        </div>
      </div>

      {/* Primary Active Queue Card */}
      <ActiveQueueCard onOpenJoinModal={() => setIsJoinModalOpen(true)} />

      {/* Secondary Grid: Live Timeline & Appointment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Timeline Sequence (2 cols) */}
        <div className="lg:col-span-2">
          <QueueTimeline />
        </div>

        {/* Right Info Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Quick Doctor Info Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-3">
              Consulting Physician
            </span>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                PS
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dr. Priya Sharma</h4>
                <p className="text-xs text-slate-500">Senior Internal Medicine</p>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 font-semibold block mt-0.5">
                  Room 102 • OPD Wing A
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 leading-relaxed">
              Dr. Priya Sharma is currently attending to patient consultations in Room 102. Please ensure you are near OPD Lounge A when your token is called.
            </div>
          </div>

          {/* Today's Appointment preview */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Scheduled Visit
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                Confirmed
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">General Medicine Checkup</h4>
              <p className="text-xs text-slate-500">Dr. Priya Sharma • Room 102</p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 pt-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                <span>Today at 11:30 AM</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Link
                href="/patient/appointment"
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                View Appointment Details →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Join Queue Modal */}
      <JoinQueueModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
