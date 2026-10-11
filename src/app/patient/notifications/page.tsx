'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { 
  Bell, 
  CheckCheck, 
  ArrowLeft, 
  Clock, 
  MessageSquare, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

export default function PatientNotificationsPage() {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    currentUserToken 
  } = useQueue();

  // Filter notifications intended for patients
  const patientNotifications = notifications.filter(
    (n) => n.target === 'patient' || n.target === 'all'
  );

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-cyan-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400 block">
              Diksha Hospital • Patient Alerts
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Notifications &amp; Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live updates on queue position, doctor consultations, and reminders.
            </p>
          </div>
        </div>

        {patientNotifications.length > 0 && (
          <button
            onClick={() => markAllNotificationsAsRead('patient')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-cyan-500" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {patientNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No notifications yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You will receive real-time updates when you join a queue or when your appointment approaches.
            </p>
          </div>
        ) : (
          patientNotifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => markNotificationAsRead(notif.id)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 ${
                notif.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-80'
                  : 'bg-cyan-50/40 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/80 shadow-sm'
              }`}
            >
              <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 shrink-0 shadow-sm">
                {getNotifIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {notif.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.description}
                </p>

                {notif.smsDetails && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800 text-[11px] font-mono text-slate-500">
                    SMS: &ldquo;{notif.smsDetails.body}&rdquo;
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
