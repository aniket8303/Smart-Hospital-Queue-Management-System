'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ShieldCheck, Heart, Sparkles, Users } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  if (pathname === '/queue-display') return null;

  return (
    <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 py-10 pb-24 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-850">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">MediQueue</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                v1.0 Demo
              </span>
            </div>
            <p className="text-slate-500 text-xs">
              &quot;Smart Queues. Shorter Waits. Better Care.&quot; — Hackathon Prototype.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/patient" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Patient Portal
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/staff" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Staff Ops
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/doctor" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Clinical Console
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Hospital Analytics
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link href="/queue-display" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              TV Display
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-cyan-500" />
            <span>
              Built by <strong className="text-slate-700 dark:text-slate-200">Team CodeForge</strong>: Aniket Parekar, Gautam Kuwar, Tejas Kulkarni, Shubham Dhobhale
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Theme 5 — Web &amp; App Development
            </span>
            <span>•</span>
            <span>VIT Hackathon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
