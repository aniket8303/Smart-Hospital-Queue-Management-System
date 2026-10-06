'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { 
  Play, 
  CheckCircle2, 
  User, 
  Clock, 
  Activity, 
  FileText, 
  Stethoscope, 
  AlertCircle,
  ChevronRight,
  Sparkles,
  HeartPulse,
  Bell
} from 'lucide-react';

export function DoctorConsole() {
  const { 
    queue, 
    callNext, 
    startConsultation, 
    completeConsultation,
    notifications 
  } = useQueue();

  const currentConsultation = queue.find((q) => q.status === 'IN_CONSULTATION') || queue.find((q) => q.status === 'NEXT');
  const upcomingPatients = queue.filter(
    (q) => q.id !== currentConsultation?.id && (q.status === 'WAITING' || q.status === 'NEXT')
  );

  const [clinicalNotes, setClinicalNotes] = useState('Patient exhibits mild pharyngeal erythema. Clear breath sounds bilaterally.');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Good morning, Dr. Sharma
            </h1>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-black">
              ● Clinical Duty Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
            General Medicine • Room 102 • St. Luke&apos;s Academic Medical Center
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => callNext()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Call Next Patient</span>
          </button>
        </div>
      </div>

      {/* Main Clinical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: CURRENT PATIENT CARD */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase font-black tracking-wider text-slate-700 dark:text-slate-300">
                  Current Consultation
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {currentConsultation && (
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider font-mono ${
                  currentConsultation.status === 'IN_CONSULTATION'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                    : 'bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border border-cyan-500/30'
                }`}>
                  {currentConsultation.status === 'IN_CONSULTATION' ? 'Active Consultation' : 'Called Next'}
                </span>
              )}
            </div>

            {currentConsultation ? (
              <div className="pt-6 space-y-6">
                {/* Patient Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-cyan-400 flex flex-col items-center justify-center font-mono font-black text-xl shadow-md border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-sans font-bold -mb-1">Token</span>
                      <span>{currentConsultation.tokenNumber}</span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                        {currentConsultation.patient.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                        <span>{currentConsultation.patient.age} yrs, {currentConsultation.patient.gender}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{currentConsultation.patient.uhid}</span>
                        <span>•</span>
                        <span>{currentConsultation.patient.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-6">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Waiting Time</span>
                    <strong className="text-2xl font-mono text-cyan-700 dark:text-cyan-400 font-black">8 min</strong>
                  </div>
                </div>

                {/* Vitals Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Blood Pressure</span>
                    <strong className="text-base font-mono text-slate-950 dark:text-white font-black mt-0.5 block">
                      {currentConsultation.vitals?.bp || '120/80'} mmHg
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Pulse Rate</span>
                    <strong className="text-base font-mono text-slate-950 dark:text-white font-black mt-0.5 block">
                      {currentConsultation.vitals?.pulse || 78} bpm
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">Temperature</span>
                    <strong className="text-base font-mono text-slate-950 dark:text-white font-black mt-0.5 block">
                      {currentConsultation.vitals?.temp || '98.6 F'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400 block text-[10px] uppercase font-bold">SpO2 Oxygen</span>
                    <strong className="text-base font-mono text-emerald-600 dark:text-emerald-400 font-black mt-0.5 block">
                      {currentConsultation.vitals?.spO2 || 99}%
                    </strong>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-black tracking-wider text-slate-700 dark:text-slate-300">
                    Chief Complaint &amp; Reason for Visit
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 leading-relaxed font-medium">
                    {currentConsultation.reason}
                  </p>
                </div>

                {/* Clinical Notes Input */}
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-black tracking-wider text-slate-700 dark:text-slate-300">
                    Clinical Assessment Notes &amp; Rx
                  </span>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none text-slate-900 dark:text-white font-medium"
                    placeholder="Enter doctor's prescription or observation..."
                  />
                </div>

                {/* Clinical Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {currentConsultation.status !== 'IN_CONSULTATION' ? (
                    <button
                      onClick={() => startConsultation(currentConsultation.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>START CONSULTATION</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => completeConsultation(currentConsultation.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COMPLETE CONSULTATION</span>
                    </button>
                  )}

                  <button
                    onClick={() => callNext()}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-black text-xs shadow-md active:scale-95 transition-all"
                  >
                    <span>NEXT PATIENT</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500">
                <Stethoscope className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No active consultation in progress
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click &quot;Call Next Patient&quot; above to invite the next scheduled patient from the waiting lounge.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: NEXT IN QUEUE ROSTER */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Next in Queue
              </h3>
              <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-black bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                {upcomingPatients.length} waiting
              </span>
            </div>

            <div className="space-y-3">
              {upcomingPatients.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No further patients in waiting line.
                </div>
              ) : (
                upcomingPatients.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-750 flex items-center justify-center font-mono font-black text-xs text-slate-900 dark:text-slate-100">
                        {item.tokenNumber}
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.patient.name}</span>
                          {idx === 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 font-bold text-[9px] uppercase">
                              Next
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                          {item.reason}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold block">
                        ~{item.estimatedWaitMinutes}m
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Clinical Updates & Role-Specific Notifications */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Clinical Alerts
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Live Feed</span>
            </div>

            <div className="space-y-2.5">
              {notifications
                .filter((n) => n.target === 'doctor' || n.target === 'all')
                .slice(0, 4)
                .map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 dark:text-white font-bold">{notif.title}</strong>
                      <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      {notif.description}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
