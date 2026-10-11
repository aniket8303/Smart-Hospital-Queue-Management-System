'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { User, Clock, CheckCircle2, Stethoscope, AlertTriangle, ArrowRight } from 'lucide-react';
import { QueueItem } from '@/lib/types';

export function QueueTimeline() {
  const { queue, completedQueue, currentUserToken } = useQueue();

  const recentCompleted = completedQueue.slice(0, 2);
  const activeItems = queue;

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
        <div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white">Live Queue Sequence</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Real-time consultation progression for Dr. Priya Sharma</p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Feed
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Completed recent items */}
        {recentCompleted.map((item) => {
          const isMeCompleted = item.tokenNumber === currentUserToken;
          const displayCompletedName = isMeCompleted ? item.patient.name : `Patient (${item.tokenNumber})`;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-750 flex items-center justify-center font-mono font-black text-slate-700 dark:text-slate-300">
                  {item.tokenNumber}
                </span>
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 line-through">
                    {displayCompletedName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Consultation Completed</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase">
                Completed
              </span>
            </div>
          );
        })}

        {/* Active queue list with Framer Motion layout animation */}
        <AnimatePresence initial={false}>
          {activeItems.map((item) => {
            const isMe = item.tokenNumber === currentUserToken;
            const isConsulting = item.status === 'IN_CONSULTATION';
            const isNext = item.status === 'NEXT';
            const isEmergency = item.priority === 'URGENT';
            const displayName = isMe ? item.patient.name : `Patient ${item.tokenNumber}`;
            const displayReason = isMe ? item.reason : 'Outpatient consultation in progress';

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
                  isMe
                    ? 'bg-cyan-50/90 dark:bg-cyan-950/50 border-cyan-400 ring-2 ring-cyan-500/25 shadow-md shadow-cyan-500/10'
                    : isConsulting
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400/70'
                    : isNext
                    ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-400/70'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-sm shadow-sm ${
                      isMe
                        ? 'bg-cyan-500 text-slate-950'
                        : isConsulting
                        ? 'bg-emerald-500 text-slate-950'
                        : isNext
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>{item.tokenNumber}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900 dark:text-white">
                        {displayName}
                      </span>
                      {isMe && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                          YOU
                        </span>
                      )}
                      {isEmergency && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium line-clamp-1">
                      {displayReason}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {isConsulting && (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                      In Consultation
                    </span>
                  )}
                  {isNext && (
                    <span className="px-3.5 py-1.5 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider animate-pulse">
                      Next in Line
                    </span>
                  )}
                  {!isConsulting && !isNext && (
                    <div>
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                        Waiting
                      </span>
                      <span className="text-xs text-cyan-700 dark:text-cyan-300 font-mono font-bold block mt-1">
                        ~{new Date(Date.now() + (item.estimatedWaitMinutes || 0) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({item.estimatedWaitMinutes}m)
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
