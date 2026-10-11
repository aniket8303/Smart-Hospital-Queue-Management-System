'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { JoinQueueModal } from '@/components/patient/JoinQueueModal';
import { 
  Search, 
  Stethoscope, 
  Clock, 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  HeartPulse,
  Bone,
  Baby,
  Calendar,
  ShieldCheck,
  Building2,
  Filter
} from 'lucide-react';
import { Doctor } from '@/lib/types';

export default function FindDoctorPage() {
  const { doctors, departments, queue } = useQueue();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [modalDoctorId, setModalDoctorId] = useState<string | undefined>(undefined);
  const [modalDeptId, setModalDeptId] = useState<string | undefined>(undefined);

  // Map icon helper
  const getDeptIcon = (name: string) => {
    if (name.includes('Cardio')) return HeartPulse;
    if (name.includes('Ortho')) return Bone;
    if (name.includes('Pedia')) return Baby;
    if (name.includes('Derma')) return Sparkles;
    return Stethoscope;
  };

  // Compute live queue length and dynamic wait time for each doctor
  const doctorQueueStats = useMemo(() => {
    const statsMap: Record<string, { waitingCount: number; estWaitMinutes: number }> = {};
    doctors.forEach((doc) => {
      const waiting = queue.filter(
        (q) => q.doctorId === doc.id && (q.status === 'WAITING' || q.status === 'NEXT')
      );
      const waitingCount = waiting.length;
      const estWaitMinutes = waitingCount * (doc.averageConsultationTimeMin || 5);
      statsMap[doc.id] = { waitingCount, estWaitMinutes };
    });
    return statsMap;
  }, [doctors, queue]);

  // Filtered doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDeptId === 'ALL' ||
        doc.departmentId === selectedDeptId ||
        doc.department === departments.find((d) => d.id === selectedDeptId)?.name;

      return matchesSearch && matchesDept;
    });
  }, [doctors, departments, searchQuery, selectedDeptId]);

  const handleOpenJoinFlow = (doc: Doctor) => {
    setModalDoctorId(doc.id);
    setModalDeptId(doc.departmentId);
    setIsJoinModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/patient"
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
                Diksha Hospital • OPD Directory
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Find a Doctor &amp; Book Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Browse available specialists, view live waiting times, and join an outpatient queue.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Department Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, specialty (e.g. Cardiologist, Physician)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedDeptId('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedDeptId === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            All Departments ({doctors.length})
          </button>
          {departments.map((dept) => {
            const Icon = getDeptIcon(dept.name);
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{dept.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => {
          const stats = doctorQueueStats[doc.id] || { waitingCount: 0, estWaitMinutes: 0 };
          const DeptIcon = getDeptIcon(doc.department);

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              <div>
                {/* Doctor Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-13 h-13 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Available Today
                        </span>
                      </div>
                      <h3 className="font-black text-base text-slate-900 dark:text-white mt-0.5">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1">
                        {doc.specialization}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                    <DeptIcon className="w-3 h-3 text-cyan-500" />
                    {doc.department}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-[11px]">
                    {doc.roomNumber}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                    Fee: ₹{doc.consultationFee}
                  </span>
                </div>

                {/* Queue Status Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 mb-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      Current Queue:
                    </span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                      {stats.waitingCount} {stats.waitingCount === 1 ? 'patient' : 'patients'} waiting
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      Estimated Wait:
                    </span>
                    <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">
                      ~{stats.estWaitMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenJoinFlow(doc)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all group-hover:bg-cyan-400"
              >
                <span>Join Live Queue (₹{doc.consultationFee})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No doctors match your query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or switch department filter to &ldquo;All Departments&rdquo;.
          </p>
        </div>
      )}

      {/* Join Queue Modal */}
      <JoinQueueModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
      />
    </div>
  );
}
