'use client';

import React from 'react';
import Link from 'next/link';
import { useQueue } from '@/context/QueueContext';
import { ArrowLeft, CheckCircle2, FileText, Calendar, Clock, Download } from 'lucide-react';

export default function PatientHistoryPage() {
  const { completedQueue, addToast } = useQueue();

  const handleDownload = (tokenNumber: string) => {
    addToast({
      title: 'Prescription Downloaded',
      description: `Summary prescription for Token ${tokenNumber} saved as PDF.`,
      type: 'success',
    });
  };

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
              Consultation History
            </h1>
            <p className="text-xs text-slate-500">
              Completed OPD visits, previous queue tokens, and digital prescriptions
            </p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {completedQueue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            No previous consultation records found.
          </div>
        ) : (
          completedQueue.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-black text-sm text-slate-800 dark:text-slate-200 shrink-0">
                  {item.tokenNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.doctorName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{item.departmentName} • {item.roomNumber}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <strong className="text-slate-500 block text-[10px] uppercase">Notes / Rx:</strong>
                    {item.notes || item.reason}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(item.joinedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <button
                  onClick={() => handleDownload(item.tokenNumber)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Prescription PDF</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
