'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Stethoscope, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  HeartHandshake, 
  Sparkles,
  ExternalLink,
  Flame,
  Ambulance,
  Accessibility
} from 'lucide-react';
import { useQueue } from '@/context/QueueContext';

export default function HospitalFacilitiesPage() {
  const { departments, doctors } = useQueue();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
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
              Diksha Hospital • Patient Information
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Hospital Facilities &amp; Guidelines
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Operating hours, emergency contact protocols, departments, and on-campus patient amenities.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Emergency Protocol Alert (Section 18 Mandatory) */}
      <div className="rounded-3xl border-2 border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/30 p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Ambulance className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                  24/7 Acute Emergency Protocol
                </span>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 font-mono">
                  Helpline: 108 / +91 20 2567 8999
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                Medical Emergencies Bypass OPD Queues Immediately
              </h2>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
                If you or a patient is experiencing acute chest pain, breathlessness, profuse bleeding, trauma, or signs of stroke, 
                <strong> DO NOT join or wait in the routine outpatient queue</strong>. Proceed directly to the 
                <strong> 24/7 Red Wing Emergency Entrance (Gate 1)</strong> for immediate resuscitation care.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Overview & Timings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hospital Contact Info */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Diksha Hospital</h3>
              <p className="text-xs text-slate-500">Central Health Campus</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Sector 4, Central Health Boulevard, Pune, Maharashtra 411045</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-mono">+91 20 2567 8900 (Reception)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>NABH Accredited Tertiary Care Center</span>
            </div>
          </div>
        </div>

        {/* OPD Operating Hours */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">OPD Operating Hours</h3>
                <p className="text-xs text-slate-500">Regular Consultation Shifts</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              Open Today
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <strong className="block text-slate-900 dark:text-white font-bold mb-1">Mon – Fri</strong>
              <span className="text-slate-500 block text-[11px]">Morning: 08:30 AM – 01:30 PM</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Evening: 04:30 PM – 08:30 PM</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <strong className="block text-slate-900 dark:text-white font-bold mb-1">Saturday</strong>
              <span className="text-slate-500 block text-[11px]">Morning: 09:00 AM – 02:00 PM</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Evening: 05:00 PM – 07:30 PM</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
              <strong className="block text-slate-900 dark:text-white font-bold mb-1">Sunday &amp; Holidays</strong>
              <span className="text-rose-500 block text-[11px] font-semibold">OPD Closed</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Emergency &amp; ICU 24/7 Open</span>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities & Amenities */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Hospital Facilities &amp; Amenities
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key services available on-site for patients and visitors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 font-bold text-[10px] inline-block">
              Ground Floor, Wing A
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white">24/7 Pharmacy</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Automated electronic prescription dispensing linked directly to doctor consoles.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 font-bold text-[10px] inline-block">
              1st Floor, Wing B
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white">Clinical Pathology Lab</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Rapid digital blood counts, biochemistry, and automated report sync to patient portal.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 font-bold text-[10px] inline-block">
              All Entrances
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white">Wheelchair &amp; Accessibility</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Complimentary wheelchair escorts and dedicated braille/ramp accessibility throughout campus.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 font-bold text-[10px] inline-block">
              Reception Foyer
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white">Check-in Kiosks</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Self-service multilingual terminals for quick token printing and UPI spot check-in.
            </p>
          </div>
        </div>
      </div>

      {/* OPD Consultation Fees Guide */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Transparent Consultation Fees
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Standard OPD fees across hospital departments. Follow-up consultation is complimentary within 7 days.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Available Doctors</th>
                <th className="py-3 px-4">Standard Fee</th>
                <th className="py-3 px-4">Follow-up Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {departments.map((dept) => {
                const doc = doctors.find((d) => d.departmentId === dept.id) || doctors[0];
                return (
                  <tr key={dept.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{dept.name}</td>
                    <td className="py-3 px-4 text-slate-500">{dept.activeDoctors} Specialists</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{doc.consultationFee}</td>
                    <td className="py-3 px-4 text-slate-500">Free within 7 days</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
