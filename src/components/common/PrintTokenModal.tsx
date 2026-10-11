'use client';

import React from 'react';
import { QueueItem } from '@/lib/types';
import { X, Printer, CheckCircle2, ShieldCheck, Sparkles, QrCode } from 'lucide-react';
import { QRCodeCanvas } from '@/components/common/QRCodeCanvas';
import { getMobileTokenUrl } from '@/lib/network';

interface PrintTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: QueueItem | null;
}

export function PrintTokenModal({ isOpen, onClose, item }: PrintTokenModalProps) {
  if (!isOpen || !item) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const currentDateStr = new Date(item.joinedAt || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();

  const currentTimeStr = new Date(item.joinedAt || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:fixed print:inset-0">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Top Bar (hidden on print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 print:hidden bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Physical Thermal Slip Preview
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable Thermal Paper Ticket */}
        <div className="p-6 text-center space-y-4 print:p-8 font-sans">
          {/* Hospital Header */}
          <div className="border-b border-dashed border-slate-300 dark:border-slate-700 pb-3 space-y-1">
            <h2 className="text-base font-black tracking-widest uppercase text-slate-900 dark:text-white">
              MEDIQUEUE
            </h2>
            <p className="text-[10px] tracking-wider uppercase text-slate-500 font-semibold">
              Diksha Hospital • OPD Wing A
            </p>
            <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase pt-0.5">
              {item.departmentName}
            </div>
          </div>

          {/* Token Display */}
          <div className="py-2 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              QUEUE TOKEN
            </span>
            <div className="text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {item.tokenNumber}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
              <span>Source:</span>
              <span className="text-cyan-600 dark:text-cyan-400 uppercase">{item.source || 'RECEPTION'}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="border-t border-b border-dashed border-slate-300 dark:border-slate-700 py-3 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{item.patient.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Consultant:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{item.doctorName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room / Door:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{item.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Wait:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-bold">~{item.estimatedWaitMinutes} MIN</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{currentDateStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time Issued:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{currentTimeStr}</span>
            </div>
          </div>

          {/* QR Code Demo Section */}
          <div className="pt-1 flex flex-col items-center justify-center space-y-1.5">
            <div className="w-24 h-24 p-1 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <QRCodeCanvas
                value={getMobileTokenUrl(item.tokenNumber)}
                size={88}
                className="w-full h-full"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono tracking-tight uppercase">
              SCAN TO TRACK LIVE • {item.tokenNumber}
            </p>
          </div>

          {/* Footer Warning */}
          <div className="text-[10px] text-slate-400 italic leading-snug pt-1">
            &ldquo;Please be available near {item.roomNumber} when your token is announced on the lounge display.&rdquo;
          </div>
        </div>

        {/* Modal Actions (hidden on print) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold shadow-md hover:opacity-90 transition-opacity"
          >
            <Printer className="w-4 h-4" />
            <span>Print Physical Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
