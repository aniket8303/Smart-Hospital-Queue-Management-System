'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  LogOut,
  Sun,
  Moon,
  ClipboardList,
  FileSpreadsheet
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    queue, 
    currentUserToken, 
    currentRole, 
    currentSession, 
    logout, 
    theme, 
    toggleTheme 
  } = useQueue();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on waiting room full display, do not show normal navbar
  if (pathname === '/queue-display') return null;

  const isLoginPage = pathname === '/login';
  const myQueueItem = queue.find((q) => q.tokenNumber === currentUserToken);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMobileMenuOpen(false);
  };

  // Avatar initials generator
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

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
                  Diksha Hospital
                </span>
              </div>
            </Link>

            {/* Strict Role Context Breadcrumb (Hidden on login page) */}
            {!isLoginPage && currentRole && (
              <div className="hidden md:flex items-center text-xs text-slate-500 font-medium pl-3 border-l border-slate-200 dark:border-slate-800">
                {currentRole === 'patient' && (
                  <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 font-medium">
                    Patient Portal
                  </span>
                )}
                {currentRole === 'staff' && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium">
                    Hospital Staff Ops
                  </span>
                )}
                {currentRole === 'doctor' && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-medium">
                    Clinical Console
                  </span>
                )}
                {currentRole === 'admin' && (
                  <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-medium">
                    Administrator
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav Links - STRICTLY ISOLATED BY CURRENT ROLE */}
          <nav className="hidden md:flex items-center gap-1">
            {/* If on Login Page OR Guest (unauthenticated): show public links only */}
            {(isLoginPage || !currentRole) && (
              <>
                <Link
                  href="/"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/#three-ways"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  How to Join
                </Link>
                <Link
                  href="/queue-display"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Live TV Screen
                </Link>
                <Link
                  href="/kiosk"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Kiosk Terminal
                </Link>
              </>
            )}

            {/* 1. PATIENT NAVIGATION (Only when authenticated as patient AND not on login page) */}
            {!isLoginPage && currentRole === 'patient' && (
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
                  href="/patient/reports"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/patient/reports'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Reports &amp; Trends
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

            {/* 2. STAFF NAVIGATION */}
            {currentRole === 'staff' && (
              <>
                <Link
                  href="/staff"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/staff'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Operations Hub
                </Link>
                <Link
                  href="/staff/queue"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/staff/queue'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Live Queue Roster
                </Link>
                <Link
                  href="/queue-display"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Waiting Room TV
                </Link>
              </>
            )}

            {/* 3. DOCTOR NAVIGATION */}
            {currentRole === 'doctor' && (
              <>
                <Link
                  href="/doctor"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/doctor'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Consultation Console
                </Link>
                <Link
                  href="/doctor/queue"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/doctor/queue'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Patient Roster
                </Link>
              </>
            )}

            {/* 4. ADMIN NAVIGATION */}
            {currentRole === 'admin' && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Executive Overview
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
                <Link
                  href="/queue-display"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Waiting Room TV
                </Link>
              </>
            )}

            {/* 5. GUEST / UNLOGGED USER */}
            {!currentRole && (
              <div className="flex items-center gap-2">
                <Link
                  href="/queue-display"
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Public TV Screen
                </Link>
              </div>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Active Patient Token Badge (ONLY shown inside patient portal, NEVER on login, staff, doctor or admin) */}
            {!isLoginPage && myQueueItem && currentRole === 'patient' && pathname.startsWith('/patient') && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
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

            {/* Notification Bell (Multi-role alerts & SMS) */}
            <NotificationBell />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:text-cyan-500 transition-colors shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Calm Mode' : 'Switch to Midnight Dark Mode'}
              aria-label="Toggle visual theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Authenticated User Profile OR Sign In Button (Hidden when already on login page) */}
            {!isLoginPage && (
              currentSession ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs transition-colors"
                    title="Click to Switch Portal Persona or Sign Out"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold flex items-center justify-center text-[10px]">
                      {getInitials(currentSession.name)}
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-slate-900 dark:text-white leading-none">
                        {currentSession.name}
                      </span>
                      <span className="block text-[10px] text-cyan-600 dark:text-cyan-400 capitalize -mt-0.5 font-semibold">
                        {currentSession.role} ▾
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Sign out of current role"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 shadow-sm transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-600" />
                  <span>Sign In / Select Portal</span>
                </Link>
              )
            )}
          </div>

          {/* Mobile menu toggle & quick actions */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationBell />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
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

      {/* Mobile Menu Dropdown - STRICTLY FILTERED BY CURRENT ROLE */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-5 space-y-2">
          {currentSession && (
            <div className="p-3 mb-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-xs text-slate-900 dark:text-white block">{currentSession.name}</strong>
                <span className="text-[10px] text-slate-400 capitalize">{currentSession.title} ({currentSession.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-2 py-1">
            {currentRole ? `${currentRole.toUpperCase()} Navigation` : 'Public Navigation'}
          </div>

          {currentRole === 'patient' && (
            <>
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
                href="/patient/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Reports &amp; Health Trends
              </Link>
              <Link
                href="/patient/appointment"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Appointments
              </Link>
              <Link
                href="/patient/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Consultation History
              </Link>
            </>
          )}

          {currentRole === 'staff' && (
            <>
              <Link
                href="/staff"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Staff Operations Hub
              </Link>
              <Link
                href="/staff/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Live Queue Roster
              </Link>
              <Link
                href="/queue-display"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-cyan-600 dark:text-cyan-400"
              >
                Waiting Room TV
              </Link>
            </>
          )}

          {currentRole === 'doctor' && (
            <>
              <Link
                href="/doctor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Consultation Console
              </Link>
              <Link
                href="/doctor/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Patient Roster
              </Link>
            </>
          )}

          {currentRole === 'admin' && (
            <>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Executive Overview
              </Link>
              <Link
                href="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Analytics & Reports
              </Link>
              <Link
                href="/queue-display"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-cyan-600 dark:text-cyan-400"
              >
                Waiting Room TV
              </Link>
            </>
          )}

          {!currentRole && (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
            >
              Sign In / Select Role
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
