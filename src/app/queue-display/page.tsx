'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  Clock, 
  Calendar, 
  Maximize, 
  ArrowLeft,
  Stethoscope,
  Building2,
  Sparkles
} from 'lucide-react';

export default function QueueDisplayPage() {
  const { queue, currentRole, soundEnabled, setSoundEnabled } = useQueue();
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const returnUrl = currentRole ? `/${currentRole}` : '/';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const nowServing = queue.find((q) => q.status === 'IN_CONSULTATION') || queue[0];
  const waitingList = queue.filter((q) => q.id !== nowServing?.id && q.status !== 'COMPLETED' && q.status !== 'CANCELLED');
  const nextInLine = waitingList.find((q) => q.status === 'NEXT') || waitingList[0];
  const upcomingStandby = waitingList.filter((q) => q.id !== nextInLine?.id);
  const standbyItem1 = upcomingStandby[0];
  const standbyItem2 = upcomingStandby[1];
  const estimatedOverallWait = standbyItem1?.estimatedWaitMinutes || 15;

  const handleFullScreen = () => {
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060911] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Top TV Header Bar */}
      <header className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href={returnUrl}
            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title={currentRole ? `Exit to ${currentRole} Dashboard` : "Exit to Home"}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-slate-950 flex items-center justify-center font-bold shadow-lg">
              <Activity className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                MediQueue
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </h1>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
                St. Luke&apos;s Academic Medical Center • OPD Wing A
              </p>
            </div>
          </div>
        </div>

        {/* Live Clock & Department & Daily Tokens */}
        <div className="flex items-center gap-6">
          {/* Tokens generated today: 142 */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Daily Intake
              </span>
              <span className="text-base font-black font-mono text-cyan-300">
                Tokens generated today: <span className="text-white">142</span>
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-2xl font-black font-mono tracking-tight text-cyan-400">
              {currentTime}
            </div>
            <div className="text-xs text-slate-400 uppercase font-semibold">
              {currentDate}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-cyan-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </button>
            <button
              onClick={handleFullScreen}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Toggle Fullscreen TV"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Waiting Room Display Area */}
      <main className="relative z-10 my-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto">
          
          {/* HUGE "NOW SERVING" CARD (7 cols) */}
          <div className="lg:col-span-7">
            <motion.div
              layout
              className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-slate-900/90 via-slate-950 to-black p-8 sm:p-12 shadow-2xl shadow-cyan-500/10 text-center"
            >
              {/* Subtle pulsing background glow */}
              <div className="absolute inset-0 bg-cyan-400/5 animate-pulse pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-black tracking-widest uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  NOW SERVING
                </div>

                {/* Massive Token Number */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={nowServing?.tokenNumber || 'NONE'}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="py-4"
                  >
                    <span className="text-7xl sm:text-9xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_35px_rgba(34,211,238,0.35)]">
                      {nowServing?.tokenNumber || '—'}
                    </span>
                    <div className="text-xl sm:text-2xl font-bold text-slate-300 mt-2">
                      {nowServing?.patient.name || 'Next Patient Being Dispatched'}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="h-px bg-slate-800 my-4" />

                {/* Department & Doctor Info */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white uppercase tracking-wider">
                      {nowServing?.departmentName || 'General Medicine'}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-slate-200">
                      {nowServing?.doctorName || 'Dr. Priya Sharma'}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-700">•</span>
                  <div className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs">
                    {nowServing?.roomNumber || 'Room 102'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* NEXT & UPCOMING CARDS (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* NEXT CARD */}
            <motion.div
              layout
              className="p-6 sm:p-7 rounded-3xl border border-cyan-500/40 bg-slate-900/90 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">
                <span className="text-cyan-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping-subtle" />
                  NEXT
                </span>
                <span className="font-mono text-cyan-300">Room 102</span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-5xl sm:text-6xl font-black font-mono text-cyan-300">
                  {nextInLine?.tokenNumber || '—'}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  {nextInLine?.patient.name || 'Waiting'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-mono">
                Please prepare to enter Door 102
              </p>
            </motion.div>

            {/* UPCOMING SEQUENCE (A-042, A-043, etc.) */}
            <motion.div
              layout
              className="p-5 sm:p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between text-xs uppercase font-bold tracking-widest text-slate-400">
                <span>STANDBY IN LOUNGE</span>
                <span className="text-slate-500 font-mono">Sequence</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="text-2xl font-black font-mono text-slate-200">
                    {standbyItem1?.tokenNumber || 'A-042'}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">
                    {standbyItem1?.patient.name || 'Aniket Parekar'}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-1">
                    ~{standbyItem1?.estimatedWaitMinutes || 15} min
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="text-2xl font-black font-mono text-slate-400">
                    {standbyItem2?.tokenNumber || 'A-043'}
                  </div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">
                    {standbyItem2?.patient.name || 'Aarav Shah'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    ~{standbyItem2?.estimatedWaitMinutes || 20} min
                  </div>
                </div>
              </div>

              {/* ESTIMATED WAIT TIME BANNER */}
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs uppercase font-bold text-slate-300">
                    Estimated waiting
                  </span>
                </div>
                <span className="text-base font-black font-mono text-cyan-300">
                  ~{estimatedOverallWait} minutes
                </span>
              </div>
            </motion.div>
          </div>

        </div>
      </main>

      {/* TV Footer Ticker */}
      <footer className="relative z-10 border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono text-[10px] uppercase">
            ANNOUNCEMENT
          </span>
          <span>Please watch the display. When your token is called, proceed to the consulting door indicated.</span>
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
          <span>MediQueue Live Telemetry</span>
          <span>•</span>
          <span>Audio Alerts: {soundEnabled ? 'Active' : 'Muted'}</span>
        </div>
      </footer>
    </div>
  );
}
