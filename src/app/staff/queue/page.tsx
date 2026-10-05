'use client';

import React from 'react';
import { QueueStatsCards } from '@/components/staff/QueueStatsCards';
import { StaffQueueTable } from '@/components/staff/StaffQueueTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function StaffQueueDedicatedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/staff"
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Live Patient Queue Roster
          </h1>
          <p className="text-xs text-slate-500">
            Real-time outpatient floor monitor and triage queue sequencing
          </p>
        </div>
      </div>

      <StaffQueueTable />
    </div>
  );
}
