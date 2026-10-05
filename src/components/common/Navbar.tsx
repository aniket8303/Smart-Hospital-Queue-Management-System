'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueue } from '@/context/QueueContext';
import { 
  Activity, 
  Menu, 
  X, 
  User, 
  Calendar, 
  Clock, 
  History, 
  Stethoscope, 
  BarChart2, 
  Tv, 
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { queue, currentUserToken, theme, toggleTheme } = useQueue();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on waiting room full display, do not show normal navbar
  if (pathname === '/queue-display') return null;

  const myQueueItem = queue.find((q) => q.tokenNumber === currentUserToken);

  // Determine current active section
  const isPatient = pathname.startsWith('/patient');
  const isStaff = pathname.startsWith('/staff');
  const isDoctor = pathname.startsWith('/doctor');
  const isAdmin = pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-cyan-400 dark:text-slate-900 shadow-md group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  MediQueue
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </span>
                <span className="block text-[10px] uppercase font-semibold text-slate-400 -mt-1 tracking-wider">
                  Smart Hospital Queue
                </span>
              </div>
            </Link>

            {/* Role Context Breadcrumb */}
            <div className="hidden md:flex items-center text-xs text-slate-500 font-medium pl-3 border-l border-slate-200 dark:border-slate-800">
              {isPatient && <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 font-medium">Patient Portal</span>}
              {isStaff && <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium">Hospital Staff Ops</span>}
              {isDoctor && <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium">Clinical Console</span>}
              {isAdmin && <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium">Administrator</span>}
              {pathname === '/' && <span className="text-slate-400">Healthcare Queues Reimagined</span>}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {isPatient && (
              <>
                <Link
                  href="/patient"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/patient/queue"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient/queue'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  My Queue
                </Link>
                <Link
                  href="/patient/appointment"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient/appointment'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Appointments
                </Link>
                <Link
                  href="/patient/history"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient/history'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  History
                </Link>
              </>
            )}

            {isStaff && (
              <>
                <Link
                  href="/staff"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/staff'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Queue Operations
                </Link>
                <Link
                  href="/staff/queue"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/staff/queue'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Live Patients
                </Link>
              </>
            )}

            {isDoctor && (
              <>
                <Link
                  href="/doctor"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/doctor'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Consultation
                </Link>
                <Link
                  href="/doctor/queue"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/doctor/queue'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Patient List
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Overview
                </Link>
                <Link
                  href="/admin/analytics"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/analytics'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Analytics & Reports
                </Link>
              </>
            )}

            {pathname === '/' && (
              <div className="flex items-center gap-2">
                <Link
                  href="/patient"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Patient
                </Link>
                <Link
                  href="/staff"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Staff
                </Link>
                <Link
                  href="/doctor"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Doctor
                </Link>
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Admin
                </Link>
              </div>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {myQueueItem && isPatient && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping-subtle" />
                <span className="text-slate-600 dark:text-slate-400">Token:</span>
                <strong className="text-cyan-700 dark:text-cyan-300 font-mono font-bold">
                  {myQueueItem.tokenNumber}
                </strong>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">
                  {myQueueItem.status === 'NEXT'
                    ? 'NEXT'
                    : myQueueItem.status === 'IN_CONSULTATION'
                    ? 'IN CONSULT'
                    : `~${myQueueItem.estimatedWaitMinutes}m wait`}
                </span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Calm Mode' : 'Switch to Midnight Dark Mode'}
              aria-label="Toggle visual theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-600" />
              <span>Switch Role</span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-5 space-y-2">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
            Navigation
          </div>
          <Link
            href="/patient"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Patient Dashboard
          </Link>
          <Link
            href="/patient/queue"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Live Queue Timeline
          </Link>
          <Link
            href="/staff"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Staff Operations
          </Link>
          <Link
            href="/doctor"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Doctor Console
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Hospital Analytics
          </Link>
          <Link
            href="/queue-display"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
          >
            Waiting Room TV Screen
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Role Selector (Demo)
          </Link>
        </div>
      )}
    </header>
  );
}
