'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { QueueItem, TokenType } from '@/lib/types';
import { PrintTokenModal } from '@/components/common/PrintTokenModal';
import { QRCodeCanvas } from '@/components/common/QRCodeCanvas';
import { getMobileTokenUrl } from '@/lib/network';
import { 
  X, 
  User, 
  Stethoscope, 
  Building2, 
  Printer, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Ticket
} from 'lucide-react';

interface ReceptionTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTokenCreated?: (item: QueueItem) => void;
}

export function ReceptionTokenModal({
  isOpen,
  onClose,
  onTokenCreated,
}: ReceptionTokenModalProps) {
  const { departments, doctors, joinQueue } = useQueue();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [patientName, setPatientName] = useState('Rahul Patil');
  const [patientAge, setPatientAge] = useState('38');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState('+91 98220 11420');
  const [selectedDeptId, setSelectedDeptId] = useState('dept-gen-med');
  const [selectedDocId, setSelectedDocId] = useState('doc-priya-sharma');
  const [tokenType, setTokenType] = useState<TokenType>('PHYSICAL');
  const [createdItem, setCreatedItem] = useState<QueueItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleCreateToken = () => {
    const item = joinQueue({
      patientName: patientName.trim() || 'Walk-in Patient',
      age: parseInt(patientAge, 10) || 30,
      gender: patientGender,
      departmentId: selectedDeptId,
      doctorId: selectedDocId,
      reason: 'Reception Assisted Registration',
      phone: patientPhone.trim(),
      source: 'RECEPTION',
      tokenType,
      consultationFee: 300,
    });

    setCreatedItem(item);
    setStep(5);
    if (onTokenCreated) onTokenCreated(item);
  };

  const handleCloseAll = () => {
    setStep(1);
    setCreatedItem(null);
    onClose();
  };

  const selectedDept = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const selectedDoc = doctors.find((d) => d.id === selectedDocId) || doctors[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {step === 5 ? 'Token Generated' : 'Create Patient Token (Receptionist)'}
              </h2>
              <p className="text-xs text-slate-500">
                {step === 1 && 'Step 1 of 4: Patient Information'}
                {step === 2 && 'Step 2 of 4: Select Clinical Department'}
                {step === 3 && 'Step 3 of 4: Assign Specialist Doctor'}
                {step === 4 && 'Step 4 of 4: Token Type (Physical vs Digital)'}
                {step === 5 && 'Staff Token Summary & Print Slip'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Patient Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g. Rahul Patil"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="38"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Phone Number (Optional for Physical Token)
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="+91 98220 11420 (Leave blank if patient has no phone)"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Patients without phone receive assisted physical token printouts.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Department */}
          {step === 2 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Outpatient Department:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      const matchingDoc = doctors.find((d) => d.department === dept.name) || doctors[0];
                      setSelectedDocId(matchingDoc.id);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedDeptId === dept.id
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{dept.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Doctor */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Assign Consulting Specialist in {selectedDept.name}:
              </label>
              <div className="space-y-2">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedDocId === doc.id
                        ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</div>
                      <div className="text-xs text-slate-500">{doc.specialization}</div>
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-1 block">
                        {doc.roomNumber} • Avg {doc.averageConsultationTimeMin}m per patient
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Available
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Token Type Selection */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Select Token Delivery Channel:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Physical Token */}
                <div
                  onClick={() => setTokenType('PHYSICAL')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    tokenType === 'PHYSICAL'
                      ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white flex items-center justify-center mb-2">
                      <Printer className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">PHYSICAL TOKEN</h4>
                    <p className="text-xs text-slate-500">
                      For patients without a smartphone. System generates a printed thermal paper slip.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 mt-3 block">
                    ✓ Print slip directly
                  </span>
                </div>

                {/* Digital Token */}
                <div
                  onClick={() => setTokenType('DIGITAL')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    tokenType === 'DIGITAL'
                      ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white flex items-center justify-center mb-2">
                      <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">DIGITAL TOKEN</h4>
                    <p className="text-xs text-slate-500">
                      Dispatches live SMS alerts with dynamic queue position tracking. Patient can leave waiting room.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 mt-3 block">
                    ✓ SMS updates enabled
                  </span>
                </div>
              </div>

              {/* Estimate preview for receptionist */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Waiting Time</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">~25 minutes</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Patients Ahead</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">4 patients ahead</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Staff Estimate View (Success Screen) */}
          {step === 5 && createdItem && (
            <div className="text-center py-2 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Token {createdItem.tokenNumber} Created Successfully
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assisted registration recorded into central hospital queue engine.
                </p>
              </div>

              {/* Staff Estimate Summary Ticket */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Token ID</span>
                  <span className="text-3xl font-black font-mono text-cyan-400">{createdItem.tokenNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Position</span>
                    <strong className="text-white text-sm font-mono font-bold">#4 in line</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Wait</span>
                    <strong className="text-emerald-400 text-sm font-bold">~{createdItem.estimatedWaitMinutes} min</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Consultant</span>
                    <strong className="text-slate-200">{createdItem.doctorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Queue Source</span>
                    <strong className="text-cyan-400 uppercase font-mono">RECEPTION ({createdItem.tokenType})</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Tell patient: &ldquo;Your estimated waiting time is approximately {createdItem.estimatedWaitMinutes} minutes. There are 3 patients ahead.&rdquo;
                </div>
              </div>

              {/* Patient Smartphone QR Scan Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl bg-white p-1 flex items-center justify-center shadow-md border border-slate-200 dark:border-slate-800 shrink-0">
                    <QRCodeCanvas
                      value={getMobileTokenUrl(createdItem.tokenNumber, 'claim', {
                        name: createdItem.patient.name,
                        doc: createdItem.doctorName,
                        dept: createdItem.departmentName,
                        room: createdItem.roomNumber,
                        pos: createdItem.estimatedWaitMinutes ? Math.ceil(createdItem.estimatedWaitMinutes / 5) : 1,
                        wait: createdItem.estimatedWaitMinutes || 5,
                      })}
                      size={60}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      📱 Patient Scannable QR Pass
                    </span>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      Patient can point their phone camera at this screen to open their digital token pass immediately.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase bg-cyan-100 dark:bg-cyan-950 px-2.5 py-1 rounded-full shrink-0">
                  Live Pass
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-bold ml-auto"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleCreateToken}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-md ml-auto active:scale-95 transition-all"
            >
              <span>Issue Token Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 5 && (
            <div className="flex items-center gap-2 w-full justify-end">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print Physical Token</span>
              </button>

              <button
                onClick={handleCloseAll}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-sm"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Print Modal */}
      <PrintTokenModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        item={createdItem}
      />
    </div>
  );
}
