'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { JoinQueueModal } from '@/components/patient/JoinQueueModal';
import { MobileQrModal } from '@/components/common/MobileQrModal';
import { 
  Activity, 
  ArrowRight, 
  Clock, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Tv, 
  Stethoscope, 
  Sparkles, 
  ChevronRight,
  TrendingDown,
  Volume2,
  Calendar,
  Layers,
  QrCode
} from 'lucide-react';

export default function LandingPage() {
  const { queue, currentUserToken } = useQueue();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMobileQrOpen, setIsMobileQrOpen] = useState(false);

  const inConsultation = queue.find((q) => q.status === 'IN_CONSULTATION') || queue[0];
  const nextInLine = queue.find((q) => q.status === 'NEXT') || queue[1];
  const myQueueItem = queue.find((q) => q.tokenNumber === currentUserToken) || queue[2];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-cyan-400/15 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-3/4 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Hackathon Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Theme 5 — Web &amp; App Development</span>
            <span className="text-slate-400">•</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">Team CodeForge</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1]"
          >
            Healthcare queues,{' '}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              reimagined.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            MediQueue connects patients, doctors and hospital staff through one intelligent, real-time queue.
          </motion.p>

          {/* Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <button
              onClick={() => setIsMobileQrOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4 text-slate-950" />
              <span>📱 Scan QR with Mobile</span>
            </button>

            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-750 text-white font-bold text-sm border border-slate-700/80 shadow-md active:scale-95 transition-all"
            >
              <span>Join via Web</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>

            <Link
              href="/queue-display"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 shadow-md active:scale-95 transition-all"
            >
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>Live TV Display</span>
            </Link>
          </motion.div>

          {/* Trust stats pill */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Zero Physical Crowding
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              Dynamic Wait-Time Logic
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              Multi-Role Shared State
            </span>
          </div>
        </div>

        {/* HERO VISUAL: SOPHISTICATED ANIMATED QUEUE DASHBOARD PREVIEW */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.6 }}
          className="relative mt-12 max-w-4xl mx-auto"
        >
          {/* Floating Micro-Card 1: Doctor is ready */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="absolute -top-6 -left-4 sm:-left-8 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Doctor Alert</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Doctor is ready</span>
            </div>
          </motion.div>

          {/* Floating Micro-Card 2: 2 patients ahead */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 4.6, ease: 'easeInOut', delay: 0.5 }}
            className="absolute -bottom-5 -left-2 sm:-left-6 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-xs">
              02
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Queue Status</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">2 patients ahead</span>
            </div>
          </motion.div>

          {/* Floating Micro-Card 3: Queue updated */}
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
            className="absolute -top-4 -right-2 sm:-right-6 z-20 hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Queue updated</span>
              <span className="text-[10px] text-slate-400 block">Live sync across all terminals</span>
            </div>
          </motion.div>

          {/* Central Interactive Preview Board */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
            {/* Top Preview Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-2">mediqueue.live/preview</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider">
                ● Live Simulator
              </span>
            </div>

            {/* Simulated Live Token Display */}
            <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              
              {/* TOKEN */}
              <div className="p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 shadow-sm">
                <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-800 dark:text-cyan-300 block">
                  Token
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-700 dark:text-cyan-300 mt-1 block">
                  {myQueueItem?.tokenNumber || (queue[0]?.tokenNumber ?? '—')}
                </span>
                <span className="text-[11px] text-cyan-800 dark:text-cyan-400 mt-0.5 block font-bold truncate">
                  {myQueueItem?.patient?.name || queue[0]?.patient?.name || 'Live OPD Stream'}
                </span>
              </div>

              {/* POSITION */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 block">
                  Position
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-950 dark:text-white mt-1 block">
                  {myQueueItem ? String(queue.findIndex(q => q.tokenNumber === myQueueItem.tokenNumber) + 1 || 1).padStart(2, '0') : (queue.length > 0 ? '01' : '—')}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">in General Medicine</span>
              </div>

              {/* EST. WAIT */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 block">
                  Est. Wait
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                  {myQueueItem ? `${myQueueItem.estimatedWaitMinutes} min` : (queue[0] ? `~${queue[0].estimatedWaitMinutes} min` : 'No wait')}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">~5m per consultation</span>
              </div>

              {/* STATUS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 block">
                  Status
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2 block">
                  {myQueueItem?.status || (queue[0]?.status ?? 'OPEN')}
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 block font-medium">Room 102 Assigned</span>
              </div>
            </div>

            {/* Role-Protected Portals */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-cyan-500" />
                <span>Isolated Role Portals (RBAC Enforced):</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/patient"
                  className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800/60 transition-colors"
                >
                  Patient Portal
                </Link>
                <Link
                  href="/staff"
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60 transition-colors"
                >
                  Staff Ops
                </Link>
                <Link
                  href="/doctor"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                >
                  Doctor Console
                </Link>
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-semibold border border-purple-200 dark:border-purple-800/60 transition-colors"
                >
                  Admin Analytics
                </Link>
                <Link
                  href="/kiosk"
                  className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-black border border-amber-200 dark:border-amber-800/60 transition-colors flex items-center gap-1"
                >
                  <span>Kiosk Terminal ➔</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/* CORE PRODUCT INNOVATION: THREE WAYS TO JOIN. ONE QUEUE.     */}
      {/* ============================================================ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-xs font-bold text-cyan-800 dark:text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>MediQueue 2.0 Core Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Three ways to join. <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">One intelligent queue.</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Healthcare should never force every patient into a single rigid workflow. Whether a patient has no smartphone, carries an iPhone, or wants a 45-second touchscreen fast-lane, all three feed into the <strong>exact same central queue engine</strong>.
          </p>

          <div className="pt-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              &ldquo;Smart Queues. Shorter Waits. Better Care.&rdquo;
            </span>
          </div>
        </div>

        {/* The 3 Core Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* MODE 1: ASSISTED PHYSICAL TOKEN */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  NO SMARTPHONE?
                </span>
                <span className="font-mono text-xs text-slate-400">MODE 1</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Assisted Physical Token
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Patient visits the reception desk. Our staff registers them in seconds, provides an instant estimated waiting time, and dispenses an official printed thermal token slip.
              </p>

              <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Example Token:</span>
                  <strong className="text-slate-900 dark:text-white">A-040 (Printed Slip)</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Queue Visibility:</span>
                  <strong className="text-slate-900 dark:text-white">Waiting Room TV</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Est. Waiting Time:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">~20 minutes</strong>
                </div>
              </div>
            </div>

            <Link
              href="/staff"
              className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              <span>Reception Workflow (Staff)</span>
              <ArrowRight className="w-4 h-4 text-amber-500" />
            </Link>
          </div>

          {/* MODE 2: DIGITAL MOBILE TOKEN */}
          <div className="rounded-3xl border-2 border-cyan-500/40 bg-white dark:bg-slate-900 p-7 shadow-2xl flex flex-col justify-between hover:border-cyan-500 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 animate-pulse">
                  HAVE A PHONE?
                </span>
                <span className="font-mono text-xs text-cyan-500 font-bold">MODE 2</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                Digital Mobile Token
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Apple Wallet inspired digital pass on the patient&apos;s phone. Patients are free to leave the hospital waiting lounge, receiving live progressive SMS notifications as their turn nears.
              </p>

              <div className="my-5 p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/80 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Example Token:</span>
                  <strong className="text-cyan-700 dark:text-cyan-300 font-bold">A-042 (Mobile Pass)</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Freedom:</span>
                  <strong className="text-slate-900 dark:text-white">Leave Waiting Room</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SMS Updates:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">15m, 5m, Called</strong>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setIsMobileQrOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan QR for Mobile Token</span>
              </button>

              <button
                onClick={() => setIsJoinModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors active:scale-95"
              >
                <span>Or Enter Details on Web</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* MODE 3: SELF-SERVICE HOSPITAL KIOSK */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-xl flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  IN A HURRY?
                </span>
                <span className="font-mono text-xs text-slate-400">MODE 3</span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Self-Service Hospital Kiosk
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Skip reception completely. Touchscreen kiosk in the lobby: choose specialist, enter basic details, pay ₹300 demo fee, and dispense your token with QR code in under 45 seconds.
              </p>

              <div className="my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Touch Interface:</span>
                  <strong className="text-slate-900 dark:text-white">Full-Screen Touch (60px+)</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Languages:</span>
                  <strong className="text-slate-900 dark:text-white">EN • हिंदी • मराठी</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Completion Time:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">~45 Seconds</strong>
                </div>
              </div>
            </div>

            <Link
              href="/kiosk"
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <span>Launch Touchscreen Kiosk ➔</span>
            </Link>
          </div>
        </div>

        {/* Central Engine Assurance Banner */}
        <div className="mt-12 p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            &ldquo;However you join, MediQueue keeps your place in line on the SAME central queue engine.&rdquo;
          </p>
          <p className="text-xs text-slate-500">
            Assisted Physical, Mobile Digital, and Self-Service Kiosks all synchronize instantly across Reception, Doctors, and Public Displays.
          </p>
        </div>
      </section>

      {/* 3-Minute Hackathon Demo Workflow Guide Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400">
            Judge Presentation Flow
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            End-to-End Live Demonstration
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Follow this 5-step synchronized flow to see real-time updates propagate across all screens instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs flex items-center justify-center font-mono">
              01
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3">Patient Joins</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Patient selects Department &amp; Doctor, receiving Token A-042 at position #3 with ~15 min wait time.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
              02
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3">Staff Calls Next</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Staff clicks &quot;Call Next&quot;. A-040 completes, A-041 enters consultation, and A-042 moves forward to #2!
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
              03
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3">Doctor Consoles</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dr. Priya Sharma sees patient vitals, diagnosis, and completes consultation with one tap.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center font-mono">
              04
            </span>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-3">Waiting Room TV</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Public display updates instantaneously with audio chime notification and high-contrast numbers.
            </p>
          </div>
        </div>
      </section>

      {/* CodeForge Team Details */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400">
                Hackathon Submission
              </span>
              <h3 className="text-2xl font-black mt-1">Team CodeForge</h3>
              <p className="text-xs text-slate-400 mt-1">
                Theme 5 — Web &amp; App Development • Problem Statement: Smart Hospital Queue Management System
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Team Lead</span>
                <strong className="text-white">Aniket Parekar</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Developer</span>
                <strong className="text-white">Gautam Kuwar</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Developer</span>
                <strong className="text-white">Tejas Kulkarni</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px]">Developer</span>
                <strong className="text-white">Shubham Dhobhale</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Queue Modal */}
      <JoinQueueModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />

      {/* Mobile QR Modal */}
      <MobileQrModal
        isOpen={isMobileQrOpen}
        onClose={() => setIsMobileQrOpen(false)}
      />
    </div>
  );
}
