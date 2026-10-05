'use client';

import React from 'react';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';
import { ArrowLeft, Stethoscope, Clock, CheckCircle2, Play } from 'lucide-react';

export default function DoctorQueuePage() {
  const { queue, startConsultation, completeConsultation } = useQueue();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link
          href="/doctor"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Today&apos;s Patient Roster (Dr. Priya Sharma)
          </h1>
          <p className="text-xs text-slate-500">
            Room 102 • General Medicine Outpatient Line
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {queue.map((item, idx) => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center font-mono font-black text-sm">
                {item.tokenNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {item.patient.name}
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    ({item.patient.age}y, {item.patient.gender})
                  </span>
                  {item.status === 'IN_CONSULTATION' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      IN CONSULTATION
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                  <span>BP: {item.vitals?.bp || '120/80'}</span>
                  <span>•</span>
                  <span>SpO2: {item.vitals?.spO2 || 99}%</span>
                  <span>•</span>
                  <span>Pulse: {item.vitals?.pulse || 76} bpm</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {item.status === 'IN_CONSULTATION' ? (
                <button
                  onClick={() => completeConsultation(item.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                >
                  Complete
                </button>
              ) : (
                <button
                  onClick={() => startConsultation(item.id)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                >
                  Admit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
