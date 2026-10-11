'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { HOURLY_PATIENT_FLOW, DEPARTMENT_WAIT_STATS, KIOSK_ANALYTICS } from '@/lib/demo-data';
import { useQueue } from '@/context/QueueContext';
import { 
  Users, 
  Clock, 
  Stethoscope, 
  Layers, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Building2,
  RotateCcw,
  AlertTriangle,
  Play,
  Bell,
  Smartphone,
  Monitor,
  UserRound,
  CreditCard,
  CheckCircle,
  Timer,
  Zap
} from 'lucide-react';

export function AdminCharts() {
  const { stats, resetQueue, addEmergencyPatient, simulateDelay, callNext, notifications } = useQueue();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const departmentColors = ['#22D3EE', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA'];

  return (
    <div className="space-y-6">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Hospital Executive Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-bold">
              Real-Time Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diksha Hospital • Central Outpatient Directorate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">All 5 OPD Wings Operating Norm</span>
        </div>
      </div>

      {/* MediQueue 2.0: Three Modes Comparison Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              One Queue, Three Ways to Join • Mode Breakdown
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
              Demo / Simulated Data
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">Central Queue Engine Synchronized</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Reception */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                Reception Tokens
              </span>
              <UserRound className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">
              42
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Assisted Physical</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">22% volume</span>
            </div>
          </div>

          {/* Card 2: Digital Mobile */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-cyan-500/30 dark:border-cyan-500/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400">
                Digital Tokens
              </span>
              <Smartphone className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">
              67
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Mobile Phone Pass</span>
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">35% volume</span>
            </div>
          </div>

          {/* Card 3: Kiosk */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                Kiosk Tokens
              </span>
              <Monitor className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">
              83
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span>Self-Service Touch</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">43% volume</span>
            </div>
          </div>

          {/* Card 4: Total */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-700 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-300">
                Total Outpatient
              </span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black font-mono text-white mt-2">
              192
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Single central queue</span>
              <span className="text-emerald-400 font-bold font-mono">100% synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Comparison Charts: Source Creation & Processing Time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Token Creation by Source</h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono">
                  Simulated Data
                </span>
              </div>
              <p className="text-xs text-slate-500">Intake volume comparison across the three entry channels</p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Today</span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { source: 'Reception (Staff)', count: 42, color: '#FBBF24' },
                    { source: 'Mobile App', count: 67, color: '#22D3EE' },
                    { source: 'Kiosk (Self-Serve)', count: 83, color: '#34D399' },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="source" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Tokens Generated" radius={[8, 8, 0, 0]}>
                    <Cell fill="#FBBF24" />
                    <Cell fill="#22D3EE" />
                    <Cell fill="#34D399" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full skeleton-shimmer rounded-2xl" />
            )}
          </div>
        </div>

        {/* Processing Time Benchmark Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Average Processing Time</h3>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono">
                  Benchmark
                </span>
              </div>
              <p className="text-xs text-slate-500">Registration speed from arrival to token issuance</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Efficiency</span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { source: 'Reception', timeSec: 180, label: '3.0 min (Manual Entry)' },
                    { source: 'Mobile', timeSec: 90, label: '1.5 min (Self OTP)' },
                    { source: 'Kiosk', timeSec: 45, label: '45 sec (Touchscreen)' },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="source" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="s" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val}s (${val === 180 ? '3m' : val === 90 ? '1.5m' : '45s'})`, 'Avg Duration']}
                  />
                  <Bar dataKey="timeSec" name="Processing Time (sec)" radius={[8, 8, 0, 0]}>
                    <Cell fill="#FBBF24" />
                    <Cell fill="#60A5FA" />
                    <Cell fill="#34D399" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full skeleton-shimmer rounded-2xl" />
            )}
          </div>
        </div>
      </div>

      {/* Kiosk Performance Telemetry Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-slate-900/60 to-slate-900 border border-emerald-500/30 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Self-Service Kiosk Telemetry Today
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Live Terminal Kiosk-01
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated hardware kiosk operational metrics &amp; patient session analytics (Simulated Data).
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold self-start sm:self-auto">
            Session Idle Reset: 60s
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Tokens Generated</span>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">83</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">43% of all intake</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Completion</span>
            <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">45s</div>
            <span className="text-[10px] text-slate-400">4x faster than front desk</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Success</span>
            <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400 mt-1">99.2%</div>
            <span className="text-[10px] text-slate-400">Demo UPI / Card / Cash</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Abandoned Sessions</span>
            <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">1.8%</div>
            <span className="text-[10px] text-slate-400">3 timeout resets</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Peak Usage Hour</span>
            <div className="text-sm font-black font-mono text-slate-900 dark:text-white mt-2">10:00 - 11:30 AM</div>
            <span className="text-[10px] text-slate-400">Morning rush</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Total Patients Today</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">
            128
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+14% vs yesterday</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Active Queues</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-900 dark:text-white mt-2">
            8
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">departments synchronized</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Average Wait</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400 mt-2">
            17 min
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            -4m below benchmark
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] uppercase font-bold tracking-wider">Doctors Available</span>
            <Stethoscope className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            14
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">specialists active in OPD</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Patient Flow by Hour */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Patient Inflow &amp; Completion</h3>
              <p className="text-xs text-slate-500">Hourly volume breakdown throughout the clinic operating day</p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Today</span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_PATIENT_FLOW} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="patients"
                    name="Checked In"
                    stroke="#22D3EE"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#patientGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    name="Discharged"
                    stroke="#34D399"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#completedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full skeleton-shimmer rounded-2xl" />
            )}
          </div>
        </div>

        {/* Chart 2: Average Wait Time by Department */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Average Waiting Time by Department</h3>
              <p className="text-xs text-slate-500">Wait times in minutes across hospital clinical wings</p>
            </div>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 font-semibold">Min</span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEPARTMENT_WAIT_STATS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="avgWait" name="Avg Wait (min)" radius={[8, 8, 0, 0]}>
                    {DEPARTMENT_WAIT_STATS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={departmentColors[index % departmentColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full skeleton-shimmer rounded-2xl" />
            )}
          </div>
        </div>
      </div>

      {/* Admin Executive Queue Operations & Simulation Hub */}
      <div className="p-6 rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100 dark:border-purple-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Executive Operations &amp; Simulation Controls</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized administrator tools for outpatient capacity balancing, emergency trauma injection, and queue state management.
            </p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto">
            Admin Privileged
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <button
            onClick={() => callNext()}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            title="Advance outpatient queue sequence"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Call Next Patient</span>
          </button>

          <button
            onClick={addEmergencyPatient}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-700 dark:text-rose-300 font-bold text-xs active:scale-95 transition-all"
            title="Simulate priority trauma triage arrival"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>+ Emergency Trauma</span>
          </button>

          <button
            onClick={simulateDelay}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs active:scale-95 transition-all"
            title="Simulate a 5-minute wait-time delay"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>+5m Wait Delay</span>
          </button>

          <button
            onClick={resetQueue}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 font-semibold text-xs active:scale-95 transition-all"
            title="Reset queue to original demo state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>
      </div>

      {/* Admin Real-Time Notifications & Audit Stream */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Administrative Notifications &amp; System Events
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live audit trail of queue transitions, emergency triage additions, and system notices
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            {notifications.filter((n) => n.target === 'admin' || n.target === 'all').length} events
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {notifications
            .filter((n) => n.target === 'admin' || n.target === 'all')
            .slice(0, 4)
            .map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{notif.title}</span>
                  <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {notif.description}
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Department Throughput &amp; Load</h3>
          <span className="text-xs text-slate-400">Refreshed live every 15s</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-4">Specialists Active</th>
                <th className="py-3 px-4">Patients Today</th>
                <th className="py-3 px-4">Average Wait</th>
                <th className="py-3 px-4">Efficiency Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DEPARTMENT_WAIT_STATS.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200">
                    {dept.department}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {dept.doctors} on duty
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                    {dept.patientsToday}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                    {dept.avgWait} min
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
