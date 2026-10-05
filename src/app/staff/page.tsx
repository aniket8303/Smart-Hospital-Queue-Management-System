'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { QueueStatsCards } from '@/components/staff/QueueStatsCards';
import { StaffQueueTable } from '@/components/staff/StaffQueueTable';
import { useQueue } from '@/context/QueueContext';
import { 
  ClipboardList, 
  Users, 
  Stethoscope, 
  Building2, 
  BarChart3, 
  Settings, 
  Play, 
  PlusCircle, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { JoinQueueModal } from '@/components/patient/JoinQueueModal';

export default function StaffDashboardPage() {
  const { callNext, resetQueue, addEmergencyPatient } = useQueue();
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'doctors' | 'settings'>('overview');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  const sidebarLinks = [
    { id: 'overview', label: 'Operations Overview', icon: ClipboardList },
    { id: 'queue', label: 'Live Queue Table', icon: Users },
    { id: 'doctors', label: 'Doctor Availability', icon: Stethoscope },
    { id: 'settings', label: 'Triage Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Operations Stats Ribbon */}
      <QueueStatsCards />

      {/* Main Staff Content with Sidebar Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav (1 col) */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1 block">
              Ops Control Hub
            </span>
            <div className="space-y-1 mt-1">
              {sidebarLinks.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                      isActive
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Staff Actions Card */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Quick Dispatch Actions
            </span>

            <button
              onClick={() => callNext()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Call Next Patient</span>
            </button>

            <button
              onClick={() => setIsAddPatientOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-cyan-500" />
              <span>Register Walk-in Patient</span>
            </button>

            <button
              onClick={addEmergencyPatient}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              <span>+ Direct Emergency Triage</span>
            </button>
          </div>
        </div>

        {/* Main Operational Table (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <StaffQueueTable />
        </div>

      </div>

      <JoinQueueModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
      />
    </div>
  );
}
