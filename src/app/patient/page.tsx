'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { ActiveQueueCard } from '@/components/patient/ActiveQueueCard';
import { QueueTimeline } from '@/components/patient/QueueTimeline';
import { JoinQueueModal } from '@/components/patient/JoinQueueModal';
import { MobileQrModal } from '@/components/common/MobileQrModal';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  PlusCircle, 
  ShieldCheck, 
  AlertCircle,
  Stethoscope,
  Activity,
  QrCode,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

function PatientDashboardContent() {
  const searchParams = useSearchParams();
  const { 
    queue, 
    currentUserToken, 
    setCurrentUserToken, 
    setCurrentRole, 
    joinQueue, 
    importOrSyncToken,
    addToast,
    refreshQueue 
  } = useQueue();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const lastScanProcessedRef = useRef<number>(0);

  // Handle QR scanning redirects e.g. /patient?token=A-001 or /patient?action=get-token
  // Designed for patients repeatedly scanning paper slip QR while outside the hospital
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const actionParam = searchParams.get('action');

    if (!tokenParam && !actionParam) {
      return;
    }

    const now = Date.now();
    // Allow repeated scans, debounced by 1 second to avoid double-triggers
    if (now - lastScanProcessedRef.current < 1000) {
      return;
    }
    lastScanProcessedRef.current = now;

    if (tokenParam) {
      setCurrentRole('patient');
      const nameParam = searchParams.get('name') || 'Patient';
      const docParam = searchParams.get('doc') || 'Dr. Priya Sharma';
      const deptParam = searchParams.get('dept') || 'General Medicine';
      const roomParam = searchParams.get('room') || 'Room 102';
      const posParam = Number(searchParams.get('pos')) || 1;
      const waitParam = Number(searchParams.get('wait')) || 5;

      const syncedItem: any = {
        id: `q-sync-${tokenParam}`,
        tokenNumber: tokenParam,
        patient: {
          id: `p-sync-${tokenParam}`,
          name: nameParam,
          age: 28,
          gender: 'Male',
          phone: '',
          uhid: `UHID-2026-${tokenParam.replace(/\D/g, '') || '001'}`,
        },
        doctorId: 'doc-priya-sharma',
        doctorName: docParam,
        departmentId: 'dept-gen-med',
        departmentName: deptParam,
        roomNumber: roomParam,
        joinedAt: new Date().toISOString(),
        status: posParam === 1 ? 'NEXT' : 'WAITING',
        priority: 'NORMAL',
        source: 'KIOSK',
        tokenType: 'DIGITAL',
        queueDay: new Date().toISOString().split('T')[0],
        consultationFee: 300,
        estimatedWaitMinutes: waitParam,
      };

      importOrSyncToken(syncedItem);
      setCurrentUserToken(tokenParam);
      refreshQueue();

      addToast({
        title: `Slip QR Scanned • Token #${tokenParam}`,
        description: 'Live OPD consultation time updated from Diksha Hospital.',
        type: 'success',
      });
    } else if (actionParam === 'get-token' || actionParam === 'scan-join') {
      setCurrentRole('patient');
      // If user doesn't already have an active token, create one for them immediately
      if (!currentUserToken) {
        const newItem = joinQueue({
          patientName: 'Mobile Patient',
          age: 30,
          gender: 'Other',
          departmentId: 'dept-gen-med',
          doctorId: 'doc-priya-sharma',
          reason: 'Mobile QR Instant Check-in',
          phone: '',
          source: 'MOBILE',
          tokenType: 'DIGITAL',
          consultationFee: 300,
        });

        setCurrentUserToken(newItem.tokenNumber);
        addToast({
          title: `Digital Token #${newItem.tokenNumber} Issued!`,
          description: 'Welcome to MediQueue. Your live digital pass is ready.',
          type: 'success',
        });
      } else {
        addToast({
          title: 'Mobile Token Active',
          description: `You are already registered with token #${currentUserToken}.`,
          type: 'info',
        });
      }
    }
  }, [searchParams, currentUserToken, setCurrentRole, setCurrentUserToken, joinQueue, importOrSyncToken, addToast, refreshQueue]);

  const myItem = queue.find((q) => q.tokenNumber === currentUserToken);
  const patientDisplayName = myItem?.patient?.name || 'Patient';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Patient Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Good morning, {patientDisplayName}
            </h1>
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your healthcare queue at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick QR Code Sharing / Mobile Pass Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm"
            title="Scan QR on mobile or share pass"
          >
            <QrCode className="w-4 h-4 text-cyan-500" />
            <span className="hidden sm:inline">Mobile QR Pass</span>
          </button>

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

      {/* Dedicated Section: Medical Reports & Longitudinal Health Insights Preview */}
      <div className="bg-gradient-to-r from-cyan-900/20 via-slate-900/40 to-slate-900/60 dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 rounded-3xl border border-cyan-500/30 p-6 md:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950 px-2 py-0.5 rounded-md">
                  New Dedicated Health Section
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Health Score: 92/100 (Improving)
                </span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                Medical Reports &amp; Longitudinal Health Tracker
              </h3>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Import past and future lab reports to compare improvements. We translate confusing medical jargon into simple, everyday language and plot multi-month growth and trend graphs.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/patient/reports"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all hover:scale-[1.02]"
            >
              <Activity className="w-4 h-4" />
              <span>Explore Reports &amp; Charts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Secondary Grid: Live Timeline & Appointment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Timeline Sequence (2 cols) */}
        <div className="lg:col-span-2">
          <QueueTimeline />
        </div>

        {/* Right Info Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Live SMS & Notification Status Widget */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Live Patient Alerts
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" /> SMS Active
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                Real-time SMS updates are sent to <strong className="font-mono text-slate-800 dark:text-slate-200">+91 98765 43210</strong> when you join the queue, when you are 3 patients away, and when the doctor is ready.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800/70 text-[11px] font-mono text-slate-500">
                Latest SMS: &ldquo;[MediQueue] Token {myItem?.tokenNumber || 'A-01'}: You are NEXT. Please proceed to Room 102.&rdquo;
              </div>
            </div>
          </div>

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

      {/* Mobile QR Modal */}
      <MobileQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        tokenNumber={currentUserToken || undefined}
        meta={myItem ? {
          name: myItem.patient.name,
          doc: myItem.doctorName,
          dept: myItem.departmentName,
          room: myItem.roomNumber,
          pos: queue.findIndex((q) => q.tokenNumber === myItem.tokenNumber) + 1 || 1,
          wait: myItem.estimatedWaitMinutes,
        } : undefined}
      />
    </div>
  );
}

export default function PatientDashboard() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-slate-400">Connecting to MediQueue Patient Portal...</p>
      </div>
    }>
      <PatientDashboardContent />
    </Suspense>
  );
}
