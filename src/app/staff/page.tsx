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
  Sparkles,
  Bell,
  Ticket
} from 'lucide-react';
import { ReceptionTokenModal } from '@/components/staff/ReceptionTokenModal';

export default function StaffDashboardPage() {
  const { callNext, resetQueue, addEmergencyPatient, notifications } = useQueue();
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold text-xs transition-colors shadow-sm"
            >
              <Ticket className="w-4 h-4 text-cyan-500" />
              <span>Create Patient Token (Receptionist)</span>
            </button>

            <button
              onClick={addEmergencyPatient}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-900/50 transition-colors"
            >
              <span>+ Direct Emergency Triage</span>
            </button>
          </div>

          {/* Operational Alerts & Triage Activity */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300">
                  Staff Ops Alerts
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              {notifications
                .filter((n) => n.target === 'staff' || n.target === 'all')
                .slice(0, 4)
                .map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-white text-[11px] font-bold truncate">
                        {notif.title}
                      </strong>
                      <span className="text-[9px] text-slate-400 shrink-0">{notif.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-tight">
                      {notif.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Main Operational Table (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <StaffQueueTable />
        </div>

      </div>

      <ReceptionTokenModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
      />
    </div>
  );
}
