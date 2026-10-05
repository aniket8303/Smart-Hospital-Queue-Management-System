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
import { HOURLY_PATIENT_FLOW, DEPARTMENT_WAIT_STATS } from '@/lib/demo-data';
import { useQueue } from '@/context/QueueContext';
import { 
  Users, 
  Clock, 
  Stethoscope, 
  Layers, 
  TrendingUp, 
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

export function AdminCharts() {
  const { stats } = useQueue();
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
            St. Luke&apos;s Academic Medical Center • Central Outpatient Directorate
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">All 5 OPD Wings Operating Norm</span>
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
