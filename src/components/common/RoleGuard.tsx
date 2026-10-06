'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueue } from '@/context/QueueContext';
import { UserRole, ROLE_PROFILES } from '@/lib/types';
import { ShieldAlert, Lock, ArrowRight, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  roleName: string;
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, roleName, children }: RoleGuardProps) {
  const router = useRouter();
  const { currentRole, currentSession, setCurrentRole } = useQueue();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for client mount
  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <div className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span>Verifying role authorization...</span>
        </div>
      </div>
    );
  }

  // 1. If user has no active session (unauthenticated)
  if (!currentRole) {
    const primaryAllowedRole = allowedRoles[0];
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
              Authentication Required
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white pt-1">
              Sign In to Access {roleName}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This hospital section is protected by Role-Based Access Control (RBAC). Please authenticate with your authorized persona to continue.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setCurrentRole(primaryAllowedRole);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Continue as {ROLE_PROFILES[primaryAllowedRole]?.name} ({primaryAllowedRole.toUpperCase()})</span>
            </button>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              <span>Choose Another Persona</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. If user role is NOT in allowedRoles (Forbidden / 403)
  if (!allowedRoles.includes(currentRole)) {
    const userProfile = ROLE_PROFILES[currentRole];
    const defaultRouteForRole = `/${currentRole}`;

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-3xl border border-rose-200 dark:border-rose-950/80 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden">
          {/* Ambient red security glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black uppercase tracking-wider">
              403 • Access Restricted by RBAC
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white pt-1">
              Unauthorized Access Barrier
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              You do not have permission to access the <strong className="text-slate-800 dark:text-slate-200 font-bold">{roleName}</strong>. 
              Each portal is strictly isolated to its respective user type.
            </p>
          </div>

          {/* Role Comparison Pill */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs grid grid-cols-2 gap-3 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Current Role</span>
              <strong className="text-slate-900 dark:text-white capitalize block mt-0.5 font-mono">
                {currentRole} ({userProfile?.name})
              </strong>
              <span className="text-[10px] text-slate-500">{userProfile?.badge}</span>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">Required Role</span>
              <strong className="text-rose-600 dark:text-rose-400 uppercase block mt-0.5 font-mono">
                {allowedRoles.join(' or ')}
              </strong>
              <span className="text-[10px] text-slate-500">Authorized Personnel Only</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                setCurrentRole(allowedRoles[0]);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Authorize &amp; Continue as {ROLE_PROFILES[allowedRoles[0]]?.name} ({allowedRoles[0].toUpperCase()})</span>
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                href={defaultRouteForRole}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to {currentRole} Dashboard</span>
              </Link>

              <Link
                href="/login"
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>Sign In Page</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized: render child components
  return <>{children}</>;
}
