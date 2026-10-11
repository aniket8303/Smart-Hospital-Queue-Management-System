'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { 
  Clock, 
  UserCheck, 
  Stethoscope, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  MapPin,
  Bell,
  Navigation,
  Smartphone,
  Share2,
  Volume2,
  Info,
  RefreshCw,
  XCircle,
  Coffee
} from 'lucide-react';

interface ActiveQueueCardProps {
  onOpenJoinModal?: () => void;
}

export function ActiveQueueCard({ onOpenJoinModal }: ActiveQueueCardProps) {
  const { queue, currentUserToken, getMyQueueItem, getMyPosition, addToast, cancelQueueRegistration, refreshQueue } = useQueue();
  const [hasLeftWaitingArea, setHasLeftWaitingArea] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeSimulatedNotif, setActiveSimulatedNotif] = useState<{
    title: string;
    body: string;
    time: string;
    stage: '15min' | '5min' | 'next' | 'called';
  } | null>(null);
  const [currentClock, setCurrentClock] = useState<Date | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    setCurrentClock(new Date());
    const timer = setInterval(() => {
      setCurrentClock(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshQueue();
    const now = new Date();
    setLastUpdatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleConfirmCancel = () => {
    if (myItem) {
      cancelQueueRegistration(myItem.tokenNumber);
      setShowCancelModal(false);
    }
  };

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
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">You&apos;re not in a queue yet.</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Choose a department and doctor to get started with your consultation at Diksha Hospital.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenJoinModal}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <span>JOIN A QUEUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/patient/find-doctor"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
            >
              <span>Find a Doctor</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate patients ahead
  const isConsulting = myItem.status === 'IN_CONSULTATION';
  const isNext = myItem.status === 'NEXT';
  const patientsAhead = isConsulting ? 0 : isNext ? 1 : Math.max(0, position - 1);

  // Dynamic Consultation Clock & Arrival Time calculations
  const waitMinutes = myItem.estimatedWaitMinutes || 0;
  const now = currentClock || new Date();
  const expectedTurnDate = new Date(now.getTime() + waitMinutes * 60000);
  const expectedTurnTimeStr = expectedTurnDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const reportBufferMinutes = Math.max(0, waitMinutes - 5);
  const reportByDate = new Date(now.getTime() + reportBufferMinutes * 60000);
  const reportByTimeStr = reportByDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Status badge colors
  const statusBadge = isConsulting
    ? { label: 'IN CONSULTATION', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' }
    : isNext
    ? { label: 'NEXT IN LINE', bg: 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-500/40 animate-pulse' }
    : { label: 'WAITING IN QUEUE', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40' };

  // Calculate progress circle % (0 to 100)
  const progressPercent = isConsulting 
    ? 100 
    : isNext 
    ? 85 
    : Math.max(15, Math.min(80, 100 - patientsAhead * 15));

  const strokeDashoffset = 283 - (283 * progressPercent) / 100;

  // Trigger simulated Apple notifications
  const handleSimulateNotification = (stage: '15min' | '5min' | 'next' | 'called') => {
    let title = '';
    let body = '';
    if (stage === '15min') {
      title = 'Turn Approaching';
      body = 'Your turn is approaching in ~15 minutes. Please begin heading towards General Medicine.';
    } else if (stage === '5min') {
      title = "You're Almost Up";
      body = `You're almost up. Only ${patientsAhead || 1} patient ahead of you. Proceed to Room 102.`;
    } else if (stage === 'next') {
      title = 'Please Return to General Medicine';
      body = `You are NEXT IN LINE for Dr. Priya Sharma. Please stand by outside Room 102.`;
    } else {
      title = `Token ${myItem.tokenNumber} Called!`;
      body = `Token ${myItem.tokenNumber} is now being called! Please enter Room 102 immediately.`;
    }

    setActiveSimulatedNotif({
      title,
      body,
      time: 'Just now',
      stage,
    });

    addToast({
      title,
      description: body,
      type: stage === 'called' ? 'success' : 'info',
    });
  };

  return (
    <div className="space-y-4">
      {/* Apple-Style Simulated Notification Floating Card */}
      <AnimatePresence>
        {activeSimulatedNotif && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="p-4 rounded-3xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-xl flex items-start gap-3.5 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold uppercase tracking-wider">
                <span>MediQueue Notification • {activeSimulatedNotif.time}</span>
                <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded-full font-mono text-cyan-300">
                  Apple Lockscreen Simulation
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeSimulatedNotif.title}</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{activeSimulatedNotif.body}</p>
            </div>
            <button
              onClick={() => setActiveSimulatedNotif(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Apple Wallet / Apple Health Inspired Patient Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-400/10 dark:bg-cyan-400/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />

        {/* Top Apple Health Style Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-black tracking-widest uppercase">
              <span>MEDIQUEUE</span>
              <span>•</span>
              <span className="font-semibold text-slate-500">DIGITAL PATIENT PASS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              You&apos;re in the queue.
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Last updated {lastUpdatedTime}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Live Real-Time Sync</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border ${statusBadge.bg}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>

        {/* Hero Token & Activity Ring Section */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Large Token & Details (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                Your Assigned Token
              </span>
              <div className="text-6xl sm:text-7xl lg:text-8xl font-black font-mono tracking-tight text-slate-950 dark:text-white mt-1">
                {myItem.tokenNumber}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>
                  {isConsulting
                    ? 'Currently in consultation'
                    : isNext
                    ? '1 patient ahead of you (Next in line)'
                    : `${patientsAhead} patients ahead of you`}
                </span>
              </div>
              <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                Estimated wait: <strong className="font-mono text-base">~{myItem.estimatedWaitMinutes} min</strong>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-start gap-1.5 mt-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Estimated wait time is approximate and may vary based on clinical needs and emergencies.</span>
              </p>
            </div>

            {/* Department & Doctor Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {myItem.departmentName}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                {myItem.doctorName}
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 font-mono font-bold">
                {myItem.roomNumber}
              </span>
              {myItem.source && (
                <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[11px] font-bold">
                  Via {myItem.source}
                </span>
              )}
            </div>
          </div>

          {/* Apple Health / Activity Style Progress Ring (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Gradient Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="text-cyan-400 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Position</span>
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                  {isConsulting ? '00' : isNext ? '01' : String(position).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-cyan-500 font-mono">
                  {progressPercent}% Done
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-3">
              Interactive Queue Flow
            </span>
          </div>
        </div>

        {/* DOCTOR CONSULTATION TIME & OUTSIDE WAITING LIVE HUB */}
        <div className="pt-2 pb-6 border-t border-slate-200 dark:border-slate-800">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 via-slate-900/5 to-blue-500/10 dark:from-cyan-950/40 dark:via-slate-900/50 dark:to-blue-950/30 border-2 border-cyan-500/30 dark:border-cyan-500/30 p-5 sm:p-7 shadow-xl shadow-cyan-500/5">
            {/* Header with Live Hospital Sync indicator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-500/20 dark:border-cyan-500/20">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Hospital OPD Live Sync Active
                </span>
                <span className="text-[11px] text-slate-400">• Real-time Central OPD feed</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-500" />
                <span>OPD Clock: {(currentClock || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>

            {/* Main Consultation Time Hero Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 items-center">
              <div className="md:col-span-7 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-700 dark:text-cyan-300">
                    When to Meet Doctor
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                    {isConsulting
                      ? 'In Consultation Now'
                      : isNext
                      ? 'Next Turn (~1-2m)'
                      : expectedTurnTimeStr}
                  </div>
                  {!isConsulting && (
                    <span className="text-xs sm:text-sm font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 font-mono">
                      {isNext ? 'Next up' : `~${waitMinutes} min wait`}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {isConsulting ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      You are currently in consultation with Dr. {myItem.doctorName}.
                    </span>
                  ) : isNext ? (
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">
                      You are NEXT in line! Dr. {myItem.doctorName} is wrapping up with the current patient. Stand by at {myItem.roomNumber}.
                    </span>
                  ) : (
                    <span>
                      Doctor consultation with <strong className="text-slate-900 dark:text-white">{myItem.doctorName}</strong> in{' '}
                      <strong className="text-slate-900 dark:text-white font-mono">{myItem.roomNumber}</strong> is expected at{' '}
                      <strong className="text-cyan-700 dark:text-cyan-300 font-mono text-sm">{expectedTurnTimeStr}</strong>.
                    </span>
                  )}
                </p>
              </div>

              {/* Arrival advisory box for patients outside */}
              <div className="md:col-span-5 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-cyan-200 dark:border-cyan-800/60 shadow-md space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <MapPin className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>Outside Waiting Arrival Advisory</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-cyan-50 dark:bg-cyan-950/60 p-2 rounded-xl border border-cyan-100 dark:border-cyan-900/50">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Report to Room:</span>
                    <strong className="font-mono font-bold text-cyan-700 dark:text-cyan-300">
                      {myItem.roomNumber}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-100 dark:border-amber-900/50">
                    <span className="text-amber-800 dark:text-amber-300 font-semibold">Report by:</span>
                    <strong className="font-mono font-bold text-amber-800 dark:text-amber-300 text-sm">
                      {reportByTimeStr}
                    </strong>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight pt-0.5">
                    Please reach {myItem.roomNumber} 5 minutes before your turn ({reportByTimeStr}) to account for walking back from outside.
                  </p>
                </div>
              </div>
            </div>

            {/* Waiting Outside Guidance Banner */}
            <div className="mt-2 pt-3 border-t border-cyan-500/20 dark:border-cyan-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <span>
                  <strong>Waiting outside hospital?</strong> Re-scan your paper slip QR code anytime from your phone to check updated live doctor meeting time.
                </span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all active:scale-95 shrink-0 shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Re-check Turn Time</span>
              </button>
            </div>
          </div>
        </div>

        {/* Leave Waiting Area Apple Mode */}
        <div className="pt-4 pb-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Leave Waiting Area Mode
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {hasLeftWaitingArea
                    ? 'You have left the waiting area. Queue continues in the background. Return near your ETA.'
                    : 'Feel free to visit the cafe or walk around. We will notify you via SMS before your turn.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setHasLeftWaitingArea(!hasLeftWaitingArea);
                addToast({
                  title: hasLeftWaitingArea ? 'Back in Waiting Area' : 'Out-of-Lounge Mode Active',
                  description: hasLeftWaitingArea 
                    ? 'Welcome back to the waiting lounge.' 
                    : 'Queue tracked in background. SMS alerts armed.',
                  type: 'info',
                });
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shrink-0 ${
                hasLeftWaitingArea
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
              }`}
            >
              {hasLeftWaitingArea ? 'Return to Waiting Area' : 'Leave Waiting Area'}
            </button>
          </div>
        </div>

        {/* Progressive Notifications Simulation Bar (Apple-level demo) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cyan-500" />
              Test Live Apple Notifications (Simulation)
            </span>
            <span className="text-[10px] text-slate-400">Click to preview patient alerts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => handleSimulateNotification('15min')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-all text-center"
            >
              15 min before
            </button>
            <button
              onClick={() => handleSimulateNotification('5min')}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-all text-center"
            >
              5 min before
            </button>
            <button
              onClick={() => handleSimulateNotification('next')}
              className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-bold transition-all text-center"
            >
              When Next
            </button>
            <button
              onClick={() => handleSimulateNotification('called')}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all text-center"
            >
              When Called
            </button>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4 text-cyan-500 shrink-0" />
            <span>Central hospital queue synchronized. Audio and SMS enabled.</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-60"
              title="Refresh queue status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-500' : ''}`} />
              <span>Refresh Queue</span>
            </button>

            <button
              onClick={() => setShowCancelModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors"
              title="Cancel queue registration"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Registration</span>
            </button>

            <Link
              href="/patient/queue"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <span>View Queue Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Cancel Queue Registration?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to cancel your token <strong className="text-slate-900 dark:text-white font-mono">{myItem.tokenNumber}</strong> for {myItem.doctorName}? You will lose your current spot in line.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Keep Token
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all active:scale-95"
              >
                Yes, Cancel Token
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
