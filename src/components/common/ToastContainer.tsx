'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { CheckCircle2, AlertCircle, Info, Flame, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useQueue();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isUrgent = toast.type === 'urgent';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.95 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border backdrop-blur-md flex items-start gap-3 text-sm ${
                isUrgent
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-900/30'
                  : isSuccess
                  ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/20'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/20'
                  : 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-black/30'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isUrgent && <Flame className="w-4 h-4 text-rose-400 animate-pulse" />}
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isWarning && <AlertCircle className="w-4 h-4 text-amber-400" />}
                {!isUrgent && !isSuccess && !isWarning && <Info className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs tracking-wide uppercase opacity-90">{toast.title}</div>
                {toast.description && (
                  <p className="mt-0.5 text-xs text-slate-300 leading-relaxed">{toast.description}</p>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
