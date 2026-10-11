'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueue } from '@/context/QueueContext';
import { INITIAL_PATIENT_PROFILE } from '@/lib/demo-data';
import { PatientProfile } from '@/lib/types';
import { 
  User, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  AlertCircle, 
  Lock, 
  Save, 
  LogOut, 
  ArrowLeft,
  Bell,
  CheckCircle2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function PatientProfilePage() {
  const router = useRouter();
  const { logout, addToast, getMyQueueItem } = useQueue();
  const myItem = getMyQueueItem();

  const [profile, setProfile] = useState<PatientProfile>(() => {
    if (myItem) {
      return {
        ...INITIAL_PATIENT_PROFILE,
        name: myItem.patient.name,
        uhid: myItem.patient.uhid || INITIAL_PATIENT_PROFILE.uhid,
        phone: myItem.patient.phone || INITIAL_PATIENT_PROFILE.phone,
      };
    }
    return INITIAL_PATIENT_PROFILE;
  });
  const [phone, setPhone] = useState(profile.phone);
  const [emergencyContact, setEmergencyContact] = useState(profile.emergencyContact);
  const [address, setAddress] = useState(profile.address);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      setProfile((prev) => ({
        ...prev,
        phone,
        emergencyContact,
        address,
      }));
      setIsSaving(false);
      addToast({
        title: 'Profile Updated',
        description: 'Permitted contact details saved securely.',
        type: 'success',
      });
    }, 400);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
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
              Diksha Hospital • Patient Record
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              My Profile &amp; Privacy
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage verified contact information and review hospital privacy settings.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/60 transition-all active:scale-95 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 rounded-3xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-2xl shadow-inner">
            AP
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {profile.name}
              </h2>
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold">
                {profile.uhid}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registered Patient at Diksha Hospital • Age: {profile.age} • Blood Group: <strong className="text-rose-500">{profile.bloodGroup}</strong>
            </p>
          </div>
        </div>

        {/* Security / RBAC Immutability Guard */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Role (Immutable)</span>
            <div className="flex items-center gap-2 mt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <strong className="text-slate-900 dark:text-white uppercase font-mono font-bold">
                PATIENT (ROLE_PATIENT)
              </strong>
            </div>
            <span className="text-[10px] text-slate-500">Role changes are strictly restricted by server RBAC.</span>
          </div>

          <div className="sm:border-l sm:border-slate-200 dark:sm:border-slate-800 sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Queue Priority</span>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              <strong className="text-slate-900 dark:text-white uppercase font-mono font-bold">
                NORMAL (STANDARD OPD)
              </strong>
            </div>
            <span className="text-[10px] text-slate-500">Clinical priority is managed exclusively by triage nurses.</span>
          </div>
        </div>
      </div>

      {/* Editable Contact Info Form */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Permitted Contact Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            You can safely update your primary phone number and emergency contact.
          </p>
        </div>

        <form onSubmit={handleSaveContactInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Phone Number (SMS Alerts)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Emergency Contact Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Residential Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Permitted Details'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          Notification Preferences
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-cyan-500" />
              <div>
                <strong className="text-xs text-slate-900 dark:text-white block">Real-Time SMS Alerts</strong>
                <span className="text-[11px] text-slate-500">Receive token calls and wait-time updates on your phone.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 cursor-pointer">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <div>
                <strong className="text-xs text-slate-900 dark:text-white block">Hospital Audio Chimes</strong>
                <span className="text-[11px] text-slate-500">Play auditory chimes when token advances in browser.</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={chimeEnabled}
              onChange={(e) => setChimeEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
