'use client';

import React from 'react';
import Link from 'next/link';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { ArrowLeft, Download, Filter, RefreshCcw } from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function AdminAnalyticsPage() {
  const { addToast } = useQueue();

  const handleExport = () => {
    addToast({
      title: 'Report Generated',
      description: 'Hospital Queue Telemetry Report exported as CSV.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Wait-Time Analytics &amp; Reports
            </h1>
            <p className="text-xs text-slate-500">
              Departmental efficiency, patient throughput and service benchmarks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics CSV</span>
          </button>
        </div>
      </div>

      <AdminCharts />
    </div>
  );
}
