'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { MessageSquare, X, CheckCheck, Smartphone, BellRing } from 'lucide-react';

export function SMSAlertBanner() {
  const { activeSmsBanner, dismissSmsBanner } = useQueue();

  return (
    <AnimatePresence>
      {activeSmsBanner && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[94%] max-w-md pointer-events-auto"
        >
          <div className="bg-slate-950/95 text-white rounded-3xl border border-cyan-500/40 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient cyan glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-sm">
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black tracking-tight text-white">MESSAGES</span>
                    <span className="text-[10px] text-slate-400 font-mono">• MediQueue SMS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCheck className="w-3 h-3" />
                  <span>Delivered</span>
                </span>
                <button
                  onClick={dismissSmsBanner}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Dismiss SMS preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Recipient & Body */}
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                <Smartphone className="w-3 h-3 text-cyan-400" />
                <span>To: <strong className="text-slate-200">{activeSmsBanner.recipientPhone}</strong> ({activeSmsBanner.recipientName})</span>
              </div>
              <p className="text-xs text-slate-100 font-medium leading-relaxed bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
                {activeSmsBanner.message}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
