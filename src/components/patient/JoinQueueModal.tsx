'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  AlertCircle,
  Building2,
  Lock,
  Phone,
  Calendar,
  Check
} from 'lucide-react';
import { QueueItem } from '@/lib/types';

interface JoinQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinedSuccess?: (item: QueueItem) => void;
  initialDoctorId?: string;
  initialDeptId?: string;
}

export function JoinQueueModal({ 
  isOpen, 
  onClose, 
  onJoinedSuccess, 
  initialDoctorId, 
  initialDeptId 
}: JoinQueueModalProps) {
  const router = useRouter();
  const { departments, doctors, joinQueue, queue, addToast, setCurrentUserToken, getMyPosition } = useQueue();

  // Steps: 1: Dept -> 2: Doctor -> 3: Patient Info -> 4: Fee Review -> 5: Payment Method -> 6: Payment Processing -> 7: Token Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  const [selectedDeptId, setSelectedDeptId] = useState<string>(initialDeptId || departments[0]?.id || 'dept-gen-med');
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDoctorId || doctors[0]?.id || 'doc-priya-sharma');
  const [patientName, setPatientName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<number>(25);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [reason, setReason] = useState<string>('');
  
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdItem, setCreatedItem] = useState<QueueItem | null>(null);
  const [generatedTxnId, setGeneratedTxnId] = useState<string>('');

  useEffect(() => {
    if (initialDeptId) setSelectedDeptId(initialDeptId);
    if (initialDoctorId) setSelectedDocId(initialDoctorId);
  }, [initialDeptId, initialDoctorId]);

  if (!isOpen) return null;

  const selectedDepartment = departments.find((d) => d.id === selectedDeptId) || departments[0];
  const departmentDoctors = doctors.filter(
    (d) => d.departmentId === selectedDeptId || d.department === selectedDepartment.name
  );
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

  const doctorFee = selectedDoctor.consultationFee || 300;
  const registrationFee = 0;
  const totalAmount = doctorFee + registrationFee;

  // Compute live queue stats for the doctor
  const waitingPatients = queue.filter(
    (q) => q.doctorId === selectedDoctor.id && (q.status === 'WAITING' || q.status === 'NEXT')
  );
  const currentPatientsAhead = waitingPatients.length;
  const estimatedWaitMin = currentPatientsAhead * (selectedDoctor.averageConsultationTimeMin || 5);

  // Handle Demo Payment and Token Issue
  const handleProcessPaymentAndJoin = () => {
    if (isSubmitting || isProcessingPayment) return; // Prevent double submission!

    setIsProcessingPayment(true);
    setStep(6);

    const txnId = `MQ-2026-${1000 + Math.floor(Math.random() * 9000)}`;
    setGeneratedTxnId(txnId);

    // Simulate backend payment verification
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsSubmitting(true);

      const item = joinQueue({
        patientName: patientName.trim() || 'Walk-in Patient',
        age,
        gender,
        departmentId: selectedDepartment.id,
        doctorId: selectedDoctor.id,
        reason: reason.trim() || 'General Consultation',
        phone: phone.trim(),
        source: 'MOBILE',
        tokenType: 'DIGITAL',
        consultationFee: totalAmount,
        transactionId: txnId,
        paymentMethod,
        paymentStatus: 'SUCCESS',
      });

      setCreatedItem(item);
      setCurrentUserToken(item.tokenNumber);
      setIsSubmitting(false);
      setStep(7);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22D3EE', '#2563EB', '#16A34A', '#0F172A'],
        });
      } catch {}

      if (onJoinedSuccess) onJoinedSuccess(item);
    }, 1200);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setCreatedItem(null);
    onClose();
  };

  const handleTrackQueue = () => {
    handleResetAndClose();
    router.push('/patient/queue');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Diksha Hospital • Smart Queue
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {step === 7 ? 'Digital Token Confirmed' : 'Join Outpatient Queue'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {step === 1 && 'Step 1 of 5: Select Department'}
              {step === 2 && 'Step 2 of 5: Select Doctor'}
              {step === 3 && 'Step 3 of 5: Patient Details'}
              {step === 4 && 'Step 4 of 5: Review Consultation Fee'}
              {step === 5 && 'Step 5 of 5: Payment Method'}
              {step === 6 && 'Processing Payment & Issuing Token...'}
              {step === 7 && 'Your queue position is secured'}
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
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: Select Department */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Choose Medical Department (Diksha Hospital)
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
                        const matchDoc = doctors.find((doc) => doc.departmentId === dept.id || doc.department === dept.name);
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
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-bold">
                          {dept.code}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{dept.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">{dept.description}</p>
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
                Select Available Specialist ({selectedDepartment.name})
              </label>

              <div className="space-y-3">
                {departmentDoctors.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  const waiting = queue.filter((q) => q.doctorId === doc.id && (q.status === 'WAITING' || q.status === 'NEXT')).length;
                  const estWait = waiting * (doc.averageConsultationTimeMin || 5);

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-slate-900 dark:text-white shadow-sm ring-2 ring-cyan-500/25'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-sm">
                          {doc.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                              Available
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{doc.specialization}</p>
                          <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 mt-1 block">
                            {doc.roomNumber} • {waiting} in queue • ~{estWait} min wait
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          ₹{doc.consultationFee}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Consultation</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Confirm Patient Info */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300 tracking-wider">
                    Selected Appointment
                  </span>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">
                    {selectedDoctor.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedDepartment.name} • {selectedDoctor.roomNumber}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Estimated Wait</span>
                  <strong className="text-base font-black text-cyan-700 dark:text-cyan-300 font-mono">
                    ~{estimatedWaitMin} min
                  </strong>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Patient Full Name
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Phone Number (SMS Updates)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Reason for Consultation / Symptoms
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Fee Review & Applicable Charges */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Diksha Hospital • OPD Charge Sheet
                </span>

                <div className="flex justify-between text-xs py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Doctor Consultation Fee ({selectedDoctor.name})</span>
                  <strong className="font-mono text-slate-900 dark:text-white">₹{doctorFee.toFixed(2)}</strong>
                </div>

                <div className="flex justify-between text-xs py-1.5 border-b border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Hospital OPD Registration &amp; Digital Card</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Waived (₹0.00)</span>
                </div>

                <div className="flex justify-between text-sm py-2 font-black">
                  <span className="text-slate-900 dark:text-white">Total Amount Payable</span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 text-lg">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Complimentary Follow-up Policy</span>
                Your consultation fee covers one complimentary follow-up review within 7 calendar days at Diksha Hospital.
              </div>
            </div>
          )}

          {/* STEP 5: Select Payment Method */}
          {step === 5 && (
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                Select Payment Mode
              </label>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-slate-900 dark:text-white ring-2 ring-cyan-500/25'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500 text-slate-950">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">UPI Instant Payment</h4>
                      <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400">Instant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-slate-900 dark:text-white ring-2 ring-cyan-500/25'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Credit / Debit Card</h4>
                      <p className="text-xs text-slate-500">Visa, MasterCard, RuPay</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-slate-500">Secure</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 text-slate-900 dark:text-white ring-2 ring-cyan-500/25'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pay at Hospital Counter</h4>
                      <p className="text-xs text-slate-500">Cash / Counter POS on arrival</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-amber-600 dark:text-amber-400">At Counter</span>
                </button>
              </div>

              {/* Demo Mode Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Demo Payment Mode:</strong> No real bank or card data is charged. Completing this simulation verifies the backend transaction and generates your genuine OPD queue token.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6: Processing Animation */}
          {step === 6 && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Verifying Payment &amp; Allocating Token...
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connecting to Diksha Hospital Central OPD Queue Engine
                </p>
              </div>
            </div>
          )}

          {/* STEP 7: Premium Digital Token Confirmation Screen */}
          {step === 7 && createdItem && (
            <div className="text-center py-2 space-y-5">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                  DIKSHA HOSPITAL • REGISTRATION COMPLETE
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  Your Digital Token is Active
                </h3>
              </div>

              {/* Digital Token Ticket */}
              <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-2xl border border-slate-800 max-w-md mx-auto text-left relative overflow-hidden">
                <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                      ASSIGNED DIGITAL TOKEN
                    </span>
                    <div className="text-5xl font-black font-mono text-cyan-400 mt-1">
                      {createdItem.tokenNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                      WAITING
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1.5">
                      {generatedTxnId || 'MQ-2026-8303'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 text-xs border-b border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Queue Position</span>
                    <strong className="text-base font-black text-white font-mono">
                      #{String(queue.findIndex(q => q.tokenNumber === createdItem.tokenNumber) + 1 || getMyPosition() || 1).padStart(2, '0')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estimated Wait</span>
                    <strong className="text-base font-black text-cyan-400 font-mono">
                      ~{createdItem.estimatedWaitMinutes || 35} mins
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Consulting Doctor</span>
                    <span className="font-bold text-slate-200">{createdItem.doctorName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Department &amp; Room</span>
                    <span className="font-bold text-slate-200">{createdItem.departmentName} • {createdItem.roomNumber}</span>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Payment: ₹{totalAmount.toFixed(2)} ({paymentMethod})</span>
                  <span className="text-emerald-400 font-bold">PAID (DEMO)</span>
                </div>
              </div>

              {/* SMS Alert Note */}
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Real-time SMS alerts have been scheduled for <strong>{phone}</strong>. You will receive an advisory when you are 3 patients away.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          {step > 1 && step < 6 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
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
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-bold shadow-md ml-auto"
            >
              <span>Continue to Doctor</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-bold shadow-md ml-auto"
            >
              <span>Continue to Patient Details</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-bold shadow-md ml-auto"
            >
              <span>Review Charges</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={() => setStep(5)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-bold shadow-md ml-auto"
            >
              <span>Select Payment Method</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 5 && (
            <button
              onClick={handleProcessPaymentAndJoin}
              disabled={isProcessingPayment || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-500/25 ml-auto active:scale-95 transition-all disabled:opacity-50"
            >
              <span>Pay &amp; Generate Token (₹{totalAmount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 7 && (
            <div className="flex gap-2 w-full">
              <button
                onClick={handleTrackQueue}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              >
                Track My Queue Now
              </button>
              <button
                onClick={handleResetAndClose}
                className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
