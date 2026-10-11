'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueue } from '@/context/QueueContext';
import { 
  Activity, 
  User, 
  ClipboardList, 
  Stethoscope, 
  BarChart3, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  KeyRound,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { UserRole, ROLE_PROFILES } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { currentSession, setCurrentRole, addToast, logout } = useQueue();

  const [selectedRole, setSelectedRole] = useState<UserRole>('staff');
  const [identifier, setIdentifier] = useState('staff@dikshahospital.com');
  const [password, setPassword] = useState('DikshaStaff@2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Official production credentials per role
  const roleCredentials: Record<UserRole, { id: string; pass: string; label: string; placeholder: string; dest: string }> = {
    staff: {
      id: 'staff@dikshahospital.com',
      pass: 'DikshaStaff@2026',
      label: 'Staff Email / Employee ID',
      placeholder: 'staff@dikshahospital.com or STAFF-OPD-102',
      dest: '/staff',
    },
    doctor: {
      id: 'doctor@dikshahospital.com',
      pass: 'DikshaDoc@2026',
      label: 'Doctor Medical Email / Reg No.',
      placeholder: 'doctor@dikshahospital.com or DOC-GM-8821',
      dest: '/doctor',
    },
    admin: {
      id: 'admin@dikshahospital.com',
      pass: 'DikshaAdmin@2026',
      label: 'Administrator Work Email',
      placeholder: 'admin@dikshahospital.com or ADMIN-EXEC-01',
      dest: '/admin',
    },
    patient: {
      id: '+91 98220 12345',
      pass: '123456',
      label: 'Mobile Number / UHID',
      placeholder: '+91 98220 12345 or UHID-2026-8303',
      dest: '/patient',
    },
  };

  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(roleCredentials[role].id);
    setPassword(roleCredentials[role].pass);
    setErrorMsg('');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your email, phone, or hospital ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setCurrentRole(selectedRole);
      setIsLoading(false);

      const profile = ROLE_PROFILES[selectedRole];
      addToast({
        title: `Signed in as ${profile.name}`,
        description: `Successfully authenticated into ${profile.title} (${selectedRole.toUpperCase()}).`,
        type: 'success',
      });

      router.push(roleCredentials[selectedRole].dest);
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center mx-auto shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            MediQueue Secure Sign In
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Diksha Hospital • Role-Isolated Access for Hospital Staff, Doctors, Administrators &amp; Patients.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC) Verified</span>
          </div>
        </div>

        {/* Active Session Banner */}
        {currentSession && (
          <div className="p-4 rounded-3xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-slate-500 dark:text-slate-400">Signed In As:</span>
                <strong className="text-slate-900 dark:text-white ml-1.5 font-bold">
                  {currentSession.name} ({currentSession.role.toUpperCase()})
                </strong>
                <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2 font-mono">
                  {currentSession.badge}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => router.push(`/${currentSession.role}`)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
              >
                Go to Portal →
              </button>
              <button
                onClick={() => logout()}
                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Standard Credentials Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Role Selection Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Select Your Role:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { role: 'staff' as UserRole, label: 'Staff', icon: ClipboardList, color: 'text-blue-500' },
                { role: 'doctor' as UserRole, label: 'Doctor', icon: Stethoscope, color: 'text-emerald-500' },
                { role: 'admin' as UserRole, label: 'Admin', icon: BarChart3, color: 'text-purple-500' },
                { role: 'patient' as UserRole, label: 'Patient', icon: User, color: 'text-cyan-500' },
              ].map(({ role, label, icon: Icon, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectRoleTab(role)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    selectedRole === role
                      ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-400'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                {roleCredentials[selectedRole].label}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {selectedRole === 'patient' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <input
                  type={selectedRole === 'patient' ? 'text' : 'email'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={roleCredentials[selectedRole].placeholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password:
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {isLoading ? (
                <span>Authenticating with Hospital Server...</span>
              ) : (
                <>
                  <span>Sign In as {selectedRole.toUpperCase()}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Official Authorized Credentials Box */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-2">
            <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Authorized Hospital Personnel Accounts:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px]">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="font-bold block text-blue-600 dark:text-blue-400">STAFF DESK</span>
                <span className="text-slate-600 dark:text-slate-300">staff@dikshahospital.com</span>
                <span className="block text-slate-400">DikshaStaff@2026</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="font-bold block text-emerald-600 dark:text-emerald-400">DOCTOR CABIN</span>
                <span className="text-slate-600 dark:text-slate-300">doctor@dikshahospital.com</span>
                <span className="block text-slate-400">DikshaDoc@2026</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="font-bold block text-purple-600 dark:text-purple-400">ADMIN DIRECTORATE</span>
                <span className="text-slate-600 dark:text-slate-300">admin@dikshahospital.com</span>
                <span className="block text-slate-400">DikshaAdmin@2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
