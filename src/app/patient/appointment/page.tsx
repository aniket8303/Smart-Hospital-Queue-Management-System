'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueue } from '@/context/QueueContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  CalendarDays,
  XCircle,
  RefreshCw
} from 'lucide-react';

export default function AppointmentPage() {
  const router = useRouter();
  const { queue, currentUserToken, joinQueue, addToast } = useQueue();
  const [isCancelled, setIsCancelled] = useState(false);
  const [rescheduleMessage, setRescheduleMessage] = useState('');

  const myQueueItem = queue.find((q) => q.tokenNumber === currentUserToken);

  const handleJoinQueue = () => {
    if (myQueueItem) {
      router.push('/patient/queue');
      return;
    }

    joinQueue({
      patientName: 'Aniket Parekar',
      departmentId: 'dept-gen-med',
      doctorId: 'doc-priya-sharma',
      reason: 'Scheduled appointment consultation with Dr. Priya Sharma',
      phone: '+91 91234 56789',
    });

    router.push('/patient/queue');
  };

  const handleCancel = () => {
    setIsCancelled(true);
    addToast({
      title: 'Appointment Cancelled',
      description: 'Your 11:30 AM appointment with Dr. Priya Sharma has been cancelled.',
      type: 'warning',
    });
  };

  const handleReschedule = () => {
    setRescheduleMessage('Slot updated: Tomorrow at 10:00 AM');
    addToast({
      title: 'Reschedule Requested',
      description: 'Available slot selected for Tomorrow at 10:00 AM.',
      type: 'info',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Scheduled Appointments
            </h1>
            <p className="text-xs text-slate-500">
              Manage outpatient consultations and join check-in queues
            </p>
          </div>
        </div>
      </div>

      {/* Main Appointment Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Upcoming Appointment
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Dr. Priya Sharma
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              General Medicine • Senior Internal Medicine Specialist
            </p>
          </div>

          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isCancelled
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {isCancelled ? 'Cancelled' : 'Confirmed'}
            </span>
          </div>
        </div>

        {/* Appointment Metadata */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Date &amp; Time</span>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mt-1">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span>{rescheduleMessage ? 'Tomorrow' : 'Today'}</span>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5 block">
              {rescheduleMessage ? '10:00 AM' : '11:30 AM'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Hospital Location</span>
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mt-1">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Room 102, Wing A</span>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Diksha Hospital
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Active Token</span>
            <div className="text-xl font-mono font-black text-cyan-600 dark:text-cyan-400 mt-1">
              {myQueueItem ? myQueueItem.tokenNumber : 'A-042'}
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              {myQueueItem ? 'Checked in to queue' : 'Ready to check-in'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {!isCancelled && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReschedule}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reschedule</span>
              </button>

              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            </div>

            <button
              onClick={handleJoinQueue}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <span>{myQueueItem ? 'View Active Queue' : 'Join Queue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
