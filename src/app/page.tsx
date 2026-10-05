'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { JoinQueueModal } from '@/components/patient/JoinQueueModal';
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
  Layers
} from 'lucide-react';

export default function LandingPage() {
  const { queue, currentUserToken } = useQueue();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

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
              onClick={() => setIsJoinModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <span>Join a Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/queue-display"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-white font-bold text-sm border border-slate-700/60 shadow-lg active:scale-95 transition-all"
            >
              <Tv className="w-4 h-4 text-cyan-400" />
              <span>View Live Queue (TV)</span>
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
                  {myQueueItem?.tokenNumber || 'A-042'}
                </span>
                <span className="text-[11px] text-cyan-800 dark:text-cyan-400 mt-0.5 block font-bold">Aniket Parekar</span>
              </div>

              {/* POSITION */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 block">
                  Position
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-slate-950 dark:text-white mt-1 block">
                  03
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">in General Medicine</span>
              </div>

              {/* EST. WAIT */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 block">
                  Est. Wait
                </span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1 block">
                  15 min
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 block font-medium">~5m per consultation</span>
              </div>

              {/* STATUS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-700 dark:text-slate-300 block">
                  Status
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2 block">
                  WAITING
                </span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 block font-medium">Room 102 Assigned</span>
              </div>
            </div>

            {/* Quick Demo Navigation Jump */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-bold">Explore the 4 specialized dashboards:</span>
              <div className="flex items-center gap-2">
                <Link
                  href="/patient"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Patient View
                </Link>
                <Link
                  href="/staff"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Staff Ops
                </Link>
                <Link
                  href="/doctor"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Doctor Console
                </Link>
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  Admin Analytics
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
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
    </div>
  );
}
