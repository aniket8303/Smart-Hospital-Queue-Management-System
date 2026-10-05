'use client';

import React from 'react';
import { useQueue } from '@/context/QueueContext';
import { QueueTimeline } from '@/components/patient/QueueTimeline';
import { ActiveQueueCard } from '@/components/patient/ActiveQueueCard';
import { ArrowLeft, Clock, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

export default function PatientQueuePage() {
  const { queue, currentUserToken, getMyPosition, getMyQueueItem } = useQueue();

  const myItem = getMyQueueItem();
  const position = getMyPosition();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Live Queue Timeline
            </h1>
            <p className="text-xs text-slate-500">
              Dr. Priya Sharma • OPD Lounge A • Room 102
            </p>
          </div>
        </div>

        {myItem && (
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
            Token: {myItem.tokenNumber}
          </span>
        )}
      </div>

      {/* Patient Active Status Banner */}
      <ActiveQueueCard />

      {/* Guidance Alert */}
      <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/60 flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
        <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <strong className="font-semibold text-slate-900 dark:text-white">Hospital Queue Guidelines</strong>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            When your position reaches #1 (&quot;NEXT&quot;), an audio chime will sound and your phone will receive an automated notification. Please proceed immediately to Door 102.
          </p>
        </div>
      </div>

      {/* Full Live Queue Timeline */}
      <QueueTimeline />
    </div>
  );
}
