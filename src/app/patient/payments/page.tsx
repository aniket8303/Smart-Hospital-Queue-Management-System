'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/QueueContext';
import { INITIAL_PAYMENTS } from '@/lib/demo-data';
import { PaymentRecord } from '@/lib/types';
import { 
  CreditCard, 
  Receipt, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  ExternalLink,
  Printer,
  Sparkles,
  Info,
  Building2,
  Calendar,
  X
} from 'lucide-react';

export default function PatientPaymentsPage() {
  const { addToast } = useQueue();
  const [payments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  const handlePrintReceipt = (p: PaymentRecord) => {
    setSelectedReceipt(p);
  };

  const handleDownloadPdf = (transactionId: string) => {
    addToast({
      title: 'Receipt Downloaded',
      description: `Official receipt ${transactionId} saved as PDF.`,
      type: 'success',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
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
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400 block">
              Diksha Hospital • Patient Billing
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              My Payments &amp; Receipts
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Secure record of all consultation charges and payment receipts.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice Banner */}
      <div className="p-4 rounded-3xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/60 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Demo Payment Mode Active
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold">
              Simulated MVP
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            All payments shown below are generated via the verified hospital demo adapter. 
            <strong> No real money is charged</strong>, and sensitive banking credentials (CVV, UPI PIN) are never requested or stored.
          </p>
        </div>
      </div>

      {/* Payment Records List */}
      <div className="space-y-4">
        {payments.map((record) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Receipt className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {record.transactionId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                    Paid • {record.status}
                  </span>
                  {record.tokenNumber && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-mono font-bold">
                      Token #{record.tokenNumber}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  {record.doctorName}
                </h3>
                <p className="text-xs text-slate-500">
                  {record.departmentName} • Method: <strong className="font-mono">{record.paymentMethod}</strong> • {record.paidAt}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Amount</span>
                <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  ₹{record.amount.toFixed(2)}
                </span>
              </div>

              <button
                onClick={() => handlePrintReceipt(record)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-500" />
                <span>View Receipt</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 relative"
            >
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Receipt Header */}
              <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
                  OFFICIAL OUTPATIENT PAYMENT RECEIPT
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Diksha Hospital
                </h2>
                <p className="text-xs text-slate-500">
                  Sector 4, Central Health Boulevard, Pune • Reg: MH-2026-OPD
                </p>
              </div>

              {/* Receipt Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <strong className="font-mono text-slate-900 dark:text-white">{selectedReceipt.transactionId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Token Number:</span>
                  <strong className="font-mono text-cyan-600 dark:text-cyan-400">{selectedReceipt.tokenNumber || 'GM-042'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedReceipt.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consulting Specialist:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReceipt.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department:</span>
                  <span className="text-slate-800 dark:text-slate-200">{selectedReceipt.departmentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{selectedReceipt.status}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm font-black">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-slate-900 dark:text-white">₹{selectedReceipt.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 text-center leading-relaxed">
                Thank you for choosing Diksha Hospital. Keep this digital slip for follow-up verification within 7 days.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleDownloadPdf(selectedReceipt.transactionId)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
