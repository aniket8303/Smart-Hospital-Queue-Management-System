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
  Sparkles,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { UserRole, ROLE_PROFILES } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { currentRole, currentSession, setCurrentRole, addToast, logout } = useQueue();

  // Mode: 'credentials' (standard login form) vs 'quick' (1-click role switcher)
  const [activeTab, setActiveTab] = useState<'credentials' | 'quick'>('credentials');
  
  // Form fields
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [identifier, setIdentifier] = useState('aniket@mediqueue.org');
  const [password, setPassword] = useState('mediqueue2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Default credentials per role
  const roleCredentials: Record<UserRole, { id: string; pass: string; label: string; placeholder: string; dest: string }> = {
    patient: {
      id: '+91 91234 56789',
      pass: '123456',
      label: 'Phone Number / UHID',
      placeholder: '+91 91234 56789 or UHID-2026-8303',
      dest: '/patient',
    },
    staff: {
      id: 'staff@mediqueue.org',
      pass: 'mediqueue2026',
      label: 'Staff Email / Employee ID',
      placeholder: 'staff@mediqueue.org or STAFF-OPD-102',
      dest: '/staff',
    },
    doctor: {
      id: 'doctor@mediqueue.org',
      pass: 'mediqueue2026',
      label: 'Doctor Medical Email / Reg No.',
      placeholder: 'doctor@mediqueue.org or DOC-GM-8821',
      dest: '/doctor',
    },
    admin: {
      id: 'admin@mediqueue.org',
      pass: 'mediqueue2026',
      label: 'Admin Work Email',
      placeholder: 'admin@mediqueue.org or ADMIN-EXEC-01',
      dest: '/admin',
    },
  };

  // Switch role in credentials form & autofill
  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(roleCredentials[role].id);
    setPassword(roleCredentials[role].pass);
    setErrorMsg('');
  };

  // Submit standard credentials login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your email, phone, or hospital ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password or demo PIN.');
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
    }, 450);
  };

  // 1-Click quick role authentication
  const handleQuickRoleSelect = (role: UserRole, destination: string) => {
    setCurrentRole(role);
    const profile = ROLE_PROFILES[role];
    addToast({
      title: `Switched to ${profile.name}`,
      description: `Authenticated as ${role.toUpperCase()} • Redirecting to portal...`,
      type: 'success',
    });
    router.push(destination);
  };

  const loginRoles = [
    {
      role: 'patient' as UserRole,
      title: 'Patient',
      personaName: 'Aniket Parekar',
      badge: 'UHID-2026-8303 • OPD Wing A',
      description: 'Check in, view token position, track live waiting time, and view prescriptions.',
      destination: '/patient',
      buttonText: 'Sign In as Patient',
      icon: User,
      color: 'border-cyan-500/30 hover:border-cyan-500 bg-cyan-500/5',
      accent: 'text-cyan-500',
    },
    {
      role: 'staff' as UserRole,
      title: 'Hospital Staff',
      personaName: 'Priya Verma',
      badge: 'Desk 1 • Triage & Front-Desk',
      description: 'Front-desk operations, triage queue management, call next patient, and walk-in dispatch.',
      destination: '/staff',
      buttonText: 'Sign In as Staff',
      icon: ClipboardList,
      color: 'border-blue-500/30 hover:border-blue-500 bg-blue-500/5',
      accent: 'text-blue-500',
    },
    {
      role: 'doctor' as UserRole,
      title: 'Doctor',
      personaName: 'Dr. Priya Sharma',
      badge: 'Room 102 • Internal Medicine',
      description: 'Consultation console, patient vitals examination, diagnosis notes, and patient discharge.',
      destination: '/doctor',
      buttonText: 'Sign In as Doctor',
      icon: Stethoscope,
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5',
      accent: 'text-emerald-500',
    },
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      personaName: 'Dr. Rajesh Mehta',
      badge: 'Executive Directorate • Telemetry',
      description: 'Executive analytics, wait-time telemetry, department flow, and hospital oversight.',
      destination: '/admin',
      buttonText: 'Sign In as Admin',
      icon: BarChart3,
      color: 'border-purple-500/30 hover:border-purple-500 bg-purple-500/5',
      accent: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center mx-auto shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            MediQueue Sign In
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Secure, role-isolated authentication for Patients, Hospital Staff, Doctors, and Administrators.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC) Protected</span>
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
                Go to Dashboard →
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

        {/* Tab Switcher: Credentials vs 1-Click Persona */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 ${
              activeTab === 'credentials'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-500" />
            <span>Sign In with Credentials</span>
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2.5 rounded-xl transition-all text-center flex items-center justify-center gap-2 ${
              activeTab === 'quick'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Demo Persona Switcher</span>
          </button>
        </div>

        {/* TAB 1: FORM-BASED SIGN IN */}
        {activeTab === 'credentials' && (
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                1. Select Portal Destination
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['patient', 'staff', 'doctor', 'admin'] as UserRole[]).map((r) => {
                  const isSel = selectedRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSelectRoleTab(r)}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold capitalize transition-all text-center ${
                        isSel
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block -mb-1">
                2. Enter Credentials for {selectedRole.toUpperCase()}
              </span>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {roleCredentials[selectedRole].label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    {selectedRole === 'patient' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={roleCredentials[selectedRole].placeholder}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password / Demo Security PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password or demo PIN"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Demo Hint */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">
                  Demo Target: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{ROLE_PROFILES[selectedRole].name}</strong> ({ROLE_PROFILES[selectedRole].badge})
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectRoleTab(selectedRole)}
                  className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline text-[11px]"
                >
                  Auto-fill Demo
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedRole.toUpperCase()} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: 1-CLICK PERSONA CARDS */}
        {activeTab === 'quick' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loginRoles.map((item) => {
              const Icon = item.icon;
              const isCurrent = currentRole === item.role;
              return (
                <div
                  key={item.role}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${item.color} ${isCurrent ? 'ring-2 ring-cyan-500/50' : ''}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
                        <Icon className={`w-5 h-5 ${item.accent}`} />
                      </div>
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                          Active Role
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          1-Click Access
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                    </div>
                    <strong className="text-xs text-slate-800 dark:text-slate-200 block font-semibold mt-0.5">
                      {item.personaName}
                    </strong>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      {item.badge}
                    </span>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleQuickRoleSelect(item.role, item.destination)}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm active:scale-95 transition-all"
                  >
                    <span>{item.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center text-xs text-slate-400">
          Built for VIT Hackathon Theme 5 by <strong className="text-slate-600 dark:text-slate-300">Team CodeForge</strong>
        </div>
      </div>
    </div>
  );
}
