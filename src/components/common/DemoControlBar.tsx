'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueue } from '@/context/QueueContext';
import { 
  Play, 
  RotateCcw, 
  Clock, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Sliders, 
  ChevronUp, 
  ChevronDown,
  User,
  Stethoscope,
  ClipboardList,
  BarChart3,
  Tv
} from 'lucide-react';

export function DemoControlBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    callNext, 
    resetQueue, 
    addEmergencyPatient, 
    simulateDelay, 
    soundEnabled, 
    setSoundEnabled,
    queue,
    currentUserToken
  } = useQueue();

  const [isExpanded, setIsExpanded] = useState(true);

  // If on the full-screen waiting room TV display, keep bar minimized or non-intrusive
  const isDisplayRoute = pathname === '/queue-display';

  const inConsultation = queue.find((q) => q.status === 'IN_CONSULTATION');
  const nextPatient = queue.find((q) => q.status === 'NEXT');

  const roles = [
    { label: 'Patient', path: '/patient', icon: User },
    { label: 'Staff Ops', path: '/staff', icon: ClipboardList },
    { label: 'Doctor', path: '/doctor', icon: Stethoscope },
    { label: 'Admin', path: '/admin', icon: BarChart3 },
    { label: 'Live TV', path: '/queue-display', icon: Tv },
  ];

  return (
    <div className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96%] max-w-4xl transition-all duration-300 ${isDisplayRoute ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
      <div className="bg-slate-950/90 text-white rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-xl px-3 py-2">
        {/* Top header row */}
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold tracking-wider text-[10px] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping-subtle" />
              Demo Mode
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              Serving: <strong className="text-white font-mono">{inConsultation?.tokenNumber || 'None'}</strong>
              {' • '}
              Next: <strong className="text-cyan-300 font-mono">{nextPatient?.tokenNumber || 'None'}</strong>
              {' • '}
              Your Token: <strong className="text-emerald-300 font-mono">{currentUserToken}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chimes' : 'Unmute Chimes'}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Action Controls */}
        {isExpanded && (
          <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-2.5">
            {/* Role Navigation Pills */}
            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto scrollbar-none py-0.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mr-1 shrink-0 hidden lg:inline">
                View:
              </span>
              {roles.map((r) => {
                const Icon = r.icon;
                const active = pathname.startsWith(r.path);
                return (
                  <Link
                    key={r.path}
                    href={r.path}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                      active
                        ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm shadow-cyan-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{r.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Live Queue Operations */}
            <div className="flex items-center gap-1.5 w-full md:w-auto justify-end overflow-x-auto py-0.5">
              <button
                onClick={() => callNext()}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-sm shadow-emerald-500/20 active:scale-95 transition-all shrink-0"
                title="Call next patient in queue (completes current, promotes next)"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Call Next</span>
              </button>

              <button
                onClick={addEmergencyPatient}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-medium active:scale-95 transition-all shrink-0"
                title="Simulate priority trauma arrival"
              >
                <AlertTriangle className="w-3 h-3 text-rose-400" />
                <span>+ Emergency</span>
              </button>

              <button
                onClick={simulateDelay}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium active:scale-95 transition-all shrink-0"
                title="Simulate a 5-minute wait time delay"
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>+5m Delay</span>
              </button>

              <button
                onClick={resetQueue}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-300 text-xs font-medium active:scale-95 transition-all shrink-0"
                title="Reset queue to initial demo state"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
