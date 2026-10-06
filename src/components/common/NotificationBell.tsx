'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQueue } from '@/context/QueueContext';
import { 
  Bell, 
  CheckCheck, 
  Smartphone, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Clock, 
  Send,
  X,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export function NotificationBell() {
  const { 
    notifications, 
    smsLogs, 
    currentRole, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    sendTestSms 
  } = useQueue();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'sms'>('notifications');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter notifications strictly for current role
  const roleNotifications = notifications.filter(
    (n) => n.target === currentRole || n.target === 'all'
  );

  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-cyan-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors shadow-sm"
        title="View Notifications & Updates"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden text-xs">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Updates &amp; Alerts</span>
                <span className="px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 uppercase">
                  {currentRole}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllNotificationsAsRead(currentRole || undefined)}
                  className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Patient Tabs (App Alerts vs SMS Messages) */}
          {currentRole === 'patient' && (
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-2.5 text-center font-bold text-xs transition-colors border-b-2 ${
                  activeTab === 'notifications'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                App Alerts ({roleNotifications.length})
              </button>
              <button
                onClick={() => setActiveTab('sms')}
                className={`flex-1 py-2.5 text-center font-bold text-xs transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'sms'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3 h-3 text-cyan-500" />
                <span>SMS Logs ({smsLogs.length})</span>
              </button>
            </div>
          )}

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {activeTab === 'notifications' ? (
              roleNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No notifications for {currentRole} portal.
                </div>
              ) : (
                roleNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      !notif.read ? 'bg-cyan-50/40 dark:bg-cyan-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="mt-0.5">{getIconForType(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {notif.description}
                      </p>
                      {notif.smsDetails && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-cyan-700 dark:text-cyan-400 font-mono">
                          <MessageSquare className="w-2.5 h-2.5" />
                          <span>SMS dispatched to {notif.smsDetails.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )
            ) : (
              // SMS Logs List
              smsLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No SMS text messages sent yet.
                </div>
              ) : (
                smsLogs.map((sms) => (
                  <div key={sms.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-850 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">
                        To: <strong className="text-slate-800 dark:text-slate-200">{sms.recipientPhone}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                        ● Delivered
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-xl font-medium leading-relaxed">
                      {sms.message}
                    </p>
                    <span className="text-[10px] text-slate-400 block font-mono text-right">
                      {sms.sentAt}
                    </span>
                  </div>
                ))
              )
            )}
          </div>

          {/* Footer with Test SMS Action */}
          {currentRole === 'patient' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">Simulate mobile SMS alert:</span>
              <button
                onClick={() => sendTestSms()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all"
              >
                <Send className="w-3 h-3" />
                <span>Send Test SMS</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
