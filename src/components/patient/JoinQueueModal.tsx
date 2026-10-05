'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQueue } from '@/context/QueueContext';
import { 
  X, 
  Stethoscope, 
  HeartPulse, 
  Bone, 
  Baby, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  User, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { QueueItem } from '@/lib/types';

interface JoinQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinedSuccess?: (item: QueueItem) => void;
}

export function JoinQueueModal({ isOpen, onClose, onJoinedSuccess }: JoinQueueModalProps) {
  const { departments, doctors, joinQueue } = useQueue();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dept-gen-med');
  const [selectedDocId, setSelectedDocId] = useState<string>(doctors[0]?.id || 'doc-priya-sharma');
  const [patientName, setPatientName] = useState<string>('Aniket Parekar');
  const [phone, setPhone] = useState<string>('+91 91234 56789');
  const [reason, setReason] = useState<string>('Mild fever and seasonal allergy symptoms');
  const [createdItem, setCreatedItem] = useState<QueueItem | null>(null);

  if (!isOpen) return null;

  const selectedDepartment = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const departmentDoctors = doctors.filter((d) => d.department === selectedDepartment.name);
  const selectedDoctor = doctors.find((d) => d.id === selectedDocId) || departmentDoctors[0] || doctors[0];

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return HeartPulse;
      case 'Bone': return Bone;
      case 'Baby': return Baby;
      case 'Sparkles': return Sparkles;
      default: return Stethoscope;
    }
  };

  const handleConfirm = () => {
    const item = joinQueue({
      patientName: patientName.trim() || 'Aniket Parekar',
      departmentId: selectedDepartment.id,
      doctorId: selectedDoctor.id,
      reason: reason.trim() || 'General Consultation',
      phone: phone.trim(),
    });

    setCreatedItem(item);
    setStep(4);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22D3EE', '#60A5FA', '#34D399', '#0B1220'],
      });
    } catch {}

    if (onJoinedSuccess) onJoinedSuccess(item);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setCreatedItem(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {step === 4 ? 'Queue Token Issued' : 'Join Outpatient Queue'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
              {step === 1 && 'Step 1 of 3: Select Clinical Department'}
              {step === 2 && 'Step 2 of 3: Select Consulting Specialist'}
              {step === 3 && 'Step 3 of 3: Review & Confirm Token Generation'}
              {step === 4 && 'Your position has been secured'}
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Select Department */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Choose Medical Department
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {departments.map((dept) => {
                  const Icon = getDeptIcon(dept.iconName);
                  const isSelected = dept.id === selectedDeptId;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setSelectedDeptId(dept.id);
                        const matchDoc = doctors.find((doc) => doc.department === dept.name);
                        if (matchDoc) setSelectedDocId(matchDoc.id);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-slate-900 dark:text-white shadow-sm ring-2 ring-cyan-500/25'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                          Queue: {dept.code}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed font-medium">{dept.description}</p>
                      </div>
                      <div className="mt-3 text-xs font-bold text-cyan-700 dark:text-cyan-400">
                        {dept.activeDoctors} specialists on duty
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Select Consulting Specialist ({selectedDepartment.name})
              </label>

              <div className="space-y-3">
                {departmentDoctors.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                    No doctor currently assigned to this department. Defaulting to Chief Physician.
                  </div>
                ) : (
                  departmentDoctors.map((doc) => {
                    const isSelected = doc.id === selectedDocId;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-slate-900 dark:text-white shadow-sm ring-2 ring-cyan-500/25'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-750 flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-sm">
                            {doc.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                                Available
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{doc.specialization}</p>
                            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1 block">
                              {doc.roomNumber} • Avg Consultation: {doc.averageConsultationTimeMin} min
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-cyan-700 dark:text-cyan-400 block font-mono">
                            ~15 min wait
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">2 ahead</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Confirm Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black text-cyan-700 dark:text-cyan-300 tracking-wider">
                    Assigned Slot
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                    {selectedDepartment.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {selectedDoctor.name} • {selectedDoctor.roomNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600 dark:text-slate-400 block font-medium">Est. Waiting Time</span>
                  <strong className="text-lg font-black text-cyan-700 dark:text-cyan-300 font-mono">
                    ~15 minutes
                  </strong>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400"
                    placeholder="Enter patient name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-slate-400"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                    Chief Complaint / Symptoms
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none placeholder:text-slate-400"
                    placeholder="Briefly describe your symptoms..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Success Screen */}
          {step === 4 && createdItem && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">You&apos;re in the queue!</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
                  Keep your token handy. Live updates will notify you when it&apos;s your turn.
                </p>
              </div>

              {/* Token Ticket Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 max-w-sm mx-auto">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-1">
                  Queue Token
                </div>
                <div className="text-5xl font-black font-mono tracking-tight text-cyan-400 py-1">
                  {createdItem.tokenNumber}
                </div>
                <div className="h-px bg-slate-800 my-3" />
                <div className="grid grid-cols-2 gap-2.5 text-left text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Doctor</span>
                    <strong className="text-slate-100 font-bold">{createdItem.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                    <strong className="text-slate-100 font-bold">{createdItem.departmentName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Patients Ahead</span>
                    <strong className="text-cyan-300 font-bold">2 patients ahead</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Wait</span>
                    <strong className="text-emerald-400 font-bold">~15 minutes</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs font-bold shadow-md ml-auto transition-all"
            >
              <span>Continue to Doctor</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white text-xs font-bold shadow-md ml-auto transition-all"
            >
              <span>Review Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 ml-auto active:scale-95 transition-all"
            >
              <span>Join Queue Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
            >
              View My Queue Status
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
