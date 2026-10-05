'use client';

import React from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole } = useQueue();

  const handleRoleSelect = (role: UserRole, destination: string) => {
    setCurrentRole(role);
    router.push(destination);
  };

  const loginRoles = [
    {
      role: 'patient' as UserRole,
      title: 'Patient',
      description: 'Check in, view token position, track live waiting time, and view prescriptions.',
      destination: '/patient',
      buttonText: 'Continue as Patient',
      icon: User,
      color: 'border-cyan-500/30 hover:border-cyan-500 bg-cyan-500/5',
      accent: 'text-cyan-500',
    },
    {
      role: 'staff' as UserRole,
      title: 'Hospital Staff',
      description: 'Front-desk operations, triage queue management, call next patient, and dispatch.',
      destination: '/staff',
      buttonText: 'Continue as Staff',
      icon: ClipboardList,
      color: 'border-blue-500/30 hover:border-blue-500 bg-blue-500/5',
      accent: 'text-blue-500',
    },
    {
      role: 'doctor' as UserRole,
      title: 'Doctor',
      description: 'Consultation console for Dr. Priya Sharma, vitals view, and diagnosis dispatch.',
      destination: '/doctor',
      buttonText: 'Continue as Doctor',
      icon: Stethoscope,
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5',
      accent: 'text-emerald-500',
    },
    {
      role: 'admin' as UserRole,
      title: 'Administrator',
      description: 'Executive analytics, wait-time telemetry, department flow, and hospital oversight.',
      destination: '/admin',
      buttonText: 'Continue as Admin',
      icon: BarChart3,
      color: 'border-purple-500/30 hover:border-purple-500 bg-purple-500/5',
      accent: 'text-purple-500',
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-cyan-400 flex items-center justify-center mx-auto shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            MediQueue
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose your persona below to directly experience the unified hospital queue platform.
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hackathon Demo Mode • Instant Role Authentication</span>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loginRoles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between shadow-sm hover:shadow-md ${item.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm">
                      <Icon className={`w-5 h-5 ${item.accent}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Persona
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => handleRoleSelect(item.role, item.destination)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  <span>{item.buttonText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-slate-400">
          Built for VIT Hackathon Theme 5 by <strong className="text-slate-600 dark:text-slate-300">Team CodeForge</strong>
        </div>
      </div>
    </div>
  );
}
