'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { 
  Play, 
  CheckCircle2, 
  FastForward, 
  AlertCircle, 
  Stethoscope, 
  User, 
  Phone,
  Flame,
  ArrowRight
} from 'lucide-react';
import { QueueItem } from '@/lib/types';

export function StaffQueueTable() {
  const { 
    queue, 
    callNext, 
    startConsultation, 
    completeConsultation, 
    skipPatient 
  } = useQueue();

  const getStatusBadge = (status: QueueItem['status']) => {
    switch (status) {
      case 'IN_CONSULTATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            In Consultation
          </span>
        );
      case 'NEXT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 text-xs font-black uppercase tracking-wider animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            Next
          </span>
        );
      case 'WAITING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
            Waiting
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold uppercase">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: QueueItem['priority']) => {
    if (priority === 'URGENT') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-[11px] font-black uppercase">
          <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse" />
          Urgent
        </span>
      );
    }
    if (priority === 'HIGH') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 text-[11px] font-bold uppercase">
          High
        </span>
      );
    }
    return (
      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
        Normal
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
      {/* Table Top Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Active Queue Monitor</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Live outpatient roster for Dr. Priya Sharma (Room 102)</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => callNext()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            title="Advance the queue: completes current consultation and calls next patient"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>CALL NEXT PATIENT</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-200 font-black">
              <th className="py-4 px-4 sm:px-6">Token</th>
              <th className="py-4 px-4">Patient</th>
              <th className="py-4 px-4 hidden md:table-cell">Doctor</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Wait Time</th>
              <th className="py-4 px-4 hidden sm:table-cell">Priority</th>
              <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            <AnimatePresence initial={false}>
              {queue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No patients currently waiting in this queue.
                  </td>
                </tr>
              ) : (
                queue.map((item) => {
                  const isConsulting = item.status === 'IN_CONSULTATION';
                  const isNext = item.status === 'NEXT';

                  return (
                    <motion.tr
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2 }}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        isConsulting
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                          : isNext
                          ? 'bg-cyan-50/60 dark:bg-cyan-950/20'
                          : ''
                      }`}
                    >
                      {/* TOKEN */}
                      <td className="py-4 px-4 sm:px-6 font-mono font-black text-sm">
                        <span className={`px-2.5 py-1 rounded-lg ${
                          isConsulting
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : isNext
                            ? 'bg-cyan-500 text-slate-950 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {item.tokenNumber}
                        </span>
                      </td>

                      {/* PATIENT */}
                      <td className="py-4 px-4">
                        <div className="font-black text-slate-900 dark:text-white text-sm">
                          {item.patient.name}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-0.5 font-medium">
                          <span>{item.patient.age}y, {item.patient.gender}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500 dark:text-slate-400">{item.patient.uhid}</span>
                        </div>
                      </td>

                      {/* DOCTOR */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {item.doctorName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {item.roomNumber}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* WAIT */}
                      <td className="py-4 px-4 font-mono font-bold">
                        {isConsulting ? (
                          <span className="text-slate-400 font-normal">—</span>
                        ) : isNext ? (
                          <span className="text-cyan-700 dark:text-cyan-300 font-black">~2 min</span>
                        ) : (
                          <span className="text-slate-800 dark:text-slate-200 font-bold">~{item.estimatedWaitMinutes} min</span>
                        )}
                      </td>

                      {/* PRIORITY */}
                      <td className="py-4 px-4 hidden sm:table-cell">
                        {getPriorityBadge(item.priority)}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isConsulting ? (
                            <button
                              onClick={() => completeConsultation(item.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-sm active:scale-95 transition-all"
                              title="Mark consultation completed and discharge"
                            >
                              COMPLETE
                            </button>
                          ) : isNext ? (
                            <button
                              onClick={() => startConsultation(item.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-sm active:scale-95 transition-all"
                              title="Admit patient into room"
                            >
                              START
                            </button>
                          ) : (
                            <button
                              onClick={() => startConsultation(item.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors"
                              title="Move patient to consultation"
                            >
                              START
                            </button>
                          )}

                          <button
                            onClick={() => skipPatient(item.id)}
                            className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-colors"
                            title="Skip this patient (e.g. absent when called)"
                          >
                            SKIP
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
