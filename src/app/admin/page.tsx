'use client';

import React, { useState } from 'react';
import { useQueue } from '@/context/QueueContext';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { Doctor, Department, StaffMember } from '@/lib/types';
import { 
  Building2, 
  Stethoscope, 
  Users, 
  Smartphone, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Key, 
  Clock, 
  IndianRupee, 
  DoorClosed, 
  ShieldCheck, 
  X,
  ExternalLink,
  Activity
} from 'lucide-react';

export default function AdminPage() {
  const { 
    departments, 
    addDepartment, 
    deleteDepartment, 
    doctors, 
    addDoctor, 
    updateDoctor, 
    deleteDoctor, 
    toggleDoctorAvailability,
    staffMembers, 
    addStaffMember, 
    deleteStaffMember,
    fast2SmsApiKey,
    setFast2SmsApiKey,
    sendRealSms,
    addToast
  } = useQueue();

  const [activeTab, setActiveTab] = useState<'departments' | 'doctors' | 'staff' | 'sms' | 'analytics'>('doctors');

  // Modals state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Forms state
  const [deptForm, setDeptForm] = useState({ name: '', code: '', description: '' });
  const [docForm, setDocForm] = useState({
    name: '',
    departmentId: '',
    roomNumber: 'Room 102',
    specialization: '',
    consultationFee: 300,
    averageConsultationTimeMin: 5,
  });
  const [staffForm, setStaffForm] = useState({
    name: '',
    employeeId: '',
    departmentId: '',
    counterNumber: 'Desk 1',
    shift: 'Morning' as 'Morning' | 'Evening' | 'Night',
  });

  // SMS Test Form state
  const [smsTestPhone, setSmsTestPhone] = useState('');
  const [smsTestMsg, setSmsTestMsg] = useState('Diksha Hospital: Your appointment token GM-042 is confirmed for Dr. Priya Sharma in Room 102. Approx wait: 15 mins.');
  const [apiKeyInput, setApiKeyInput] = useState(fast2SmsApiKey || '');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [smsResult, setSmsResult] = useState<any>(null);

  // Department submit
  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) return;
    addDepartment({
      name: deptForm.name,
      code: deptForm.code.toUpperCase(),
      description: deptForm.description || 'Clinical specialty department',
      iconName: 'Building2',
      activeDoctors: 1,
    });
    setDeptForm({ name: '', code: '', description: '' });
    setShowAddDeptModal(false);
  };

  // Doctor submit
  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.name) return;
    const selectedDept = departments.find((d) => d.id === docForm.departmentId) || departments[0];
    addDoctor({
      name: docForm.name,
      department: selectedDept.name,
      departmentId: selectedDept.id,
      roomNumber: docForm.roomNumber || 'Room 102',
      specialization: docForm.specialization || 'Consultant Specialist',
      consultationFee: Number(docForm.consultationFee) || 300,
      averageConsultationTimeMin: Number(docForm.averageConsultationTimeMin) || 5,
      isAvailable: true,
    });
    setDocForm({
      name: '',
      departmentId: '',
      roomNumber: 'Room 102',
      specialization: '',
      consultationFee: 300,
      averageConsultationTimeMin: 5,
    });
    setShowAddDocModal(false);
  };

  // Staff submit
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.employeeId) return;
    const selectedDept = departments.find((d) => d.id === staffForm.departmentId) || departments[0];
    addStaffMember({
      name: staffForm.name,
      employeeId: staffForm.employeeId,
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      counterNumber: staffForm.counterNumber,
      shift: staffForm.shift,
      isActive: true,
    });
    setStaffForm({
      name: '',
      employeeId: '',
      departmentId: '',
      counterNumber: 'Desk 1',
      shift: 'Morning',
    });
    setShowAddStaffModal(false);
  };

  // Test SMS Dispatch
  const handleTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsTestPhone) {
      addToast({ title: 'Phone Required', description: 'Enter a 10-digit mobile number', type: 'warning' });
      return;
    }
    setIsSendingSms(true);
    setSmsResult(null);

    const res = await sendRealSms(smsTestPhone, smsTestMsg);
    setIsSendingSms(false);
    setSmsResult(res);

    if (res.success) {
      addToast({
        title: 'SMS Dispatched!',
        description: `Delivered to +91 ${smsTestPhone} via Fast2SMS`,
        type: 'success',
      });
    } else if (res.simulated) {
      addToast({
        title: 'API Key Required for Telco Delivery',
        description: 'Save your Fast2SMS API key below to send real SMS to mobile towers.',
        type: 'info',
      });
    } else {
      addToast({
        title: 'Gateway Error',
        description: res.error || 'Failed to dispatch SMS',
        type: 'warning',
      });
    }
  };

  const handleSaveApiKey = () => {
    setFast2SmsApiKey(apiKeyInput.trim());
    addToast({
      title: 'API Key Saved',
      description: 'Fast2SMS credentials updated and stored.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Hospital Administration & Management
              </h1>
              <p className="text-xs text-slate-500">
                Diksha Hospital • Central Directorate • Authoritative Resource Management
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'doctors'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Doctors ({doctors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'departments'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Departments ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'staff'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff ({staffMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sms')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'sms'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS Gateway & Test</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DOCTORS MANAGEMENT */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Medical Practitioners & Consultation Rooms
              </h2>
              <p className="text-xs text-slate-500">
                Configure doctor availability, consultation fees, and assigned rooms. All patient queues synchronize immediately.
              </p>
            </div>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {doc.name}
                    </h3>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                      {doc.department}
                    </span>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {doc.specialization}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteDoctor(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <DoorClosed className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.roomNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{doc.averageConsultationTimeMin} min / patient</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white col-span-2">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Consultation Fee: ₹{doc.consultationFee}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500 font-medium">Duty Status:</span>
                  <button
                    onClick={() => toggleDoctorAvailability(doc.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      doc.isAvailable
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {doc.isAvailable ? '● Available on Duty' : '○ Off Duty / Break'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DEPARTMENTS MANAGEMENT */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Clinical Departments & OPD Wings
              </h2>
              <p className="text-xs text-slate-500">
                Manage hospital specialty units and department token code prefixes (e.g., GM, CAR, ORT).
              </p>
            </div>
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => {
              const docCount = doctors.filter((d) => d.departmentId === dept.id).length;
              return (
                <div
                  key={dept.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono font-black text-xs">
                          {dept.code}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {dept.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {dept.description}
                      </p>
                    </div>
                    {departments.length > 1 && (
                      <button
                        onClick={() => deleteDepartment(dept.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete department"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>Assigned Doctors:</span>
                    <strong className="text-slate-900 dark:text-white font-mono font-bold">
                      {docCount} Practitioner{docCount !== 1 ? 's' : ''}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Front-Desk Reception & Triage Staff
              </h2>
              <p className="text-xs text-slate-500">
                Staff members authorized to register walk-in patients and generate physical token slips.
              </p>
            </div>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Register Staff Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffMembers.map((staff) => (
              <div
                key={staff.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {staff.name}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {staff.employeeId}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteStaffMember(staff.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove staff"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs space-y-1.5 py-2 border-y border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Desk / Counter:</span>
                    <strong className="text-slate-900 dark:text-white font-bold">{staff.counterNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <strong className="text-slate-900 dark:text-white">{staff.departmentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shift:</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold">{staff.shift}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized Reception Desk Access</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SMS GATEWAY & LIVE DISPATCH TEST */}
      {activeTab === 'sms' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Real SMS Gateway Configuration & Mobile Dispatch
            </h2>
            <p className="text-xs text-slate-500">
              Deliver live SMS notifications directly to patients&apos; phones using Fast2SMS (India DLT &amp; Quick Route).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Key Setup */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Key className="w-4 h-4 text-purple-600" />
                <span>Fast2SMS API Credentials</span>
              </div>
              <p className="text-xs text-slate-500">
                To receive real SMS on your mobile phone in India (+91), enter your free Fast2SMS authorization key below.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Fast2SMS Authorization Key:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="Paste Fast2SMS API Key (e.g. jdfk8934kjfd...)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    Save Key
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 text-xs text-purple-900 dark:text-purple-300 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>How to get free Fast2SMS Credits:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-purple-800 dark:text-purple-400">
                  <li>Visit <strong>fast2sms.com</strong> and create a free account.</li>
                  <li>Go to <strong>Dev API</strong> in the left sidebar.</li>
                  <li>Copy your Authorization Key and paste it in the box above.</li>
                  <li>All patient registrations will now send real SMS messages to real mobile phones!</li>
                </ol>
              </div>
            </div>

            {/* Live SMS Tester */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Send className="w-4 h-4 text-emerald-500" />
                <span>Test Live SMS to Your Phone</span>
              </div>
              <p className="text-xs text-slate-500">
                Enter your mobile number right now to test actual delivery to your handset.
              </p>

              <form onSubmit={handleTestSms} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Mobile Number:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={smsTestPhone}
                      onChange={(e) => setSmsTestPhone(e.target.value)}
                      placeholder="e.g. 9822012345"
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-mono font-bold"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Message Body:
                  </label>
                  <textarea
                    rows={2}
                    value={smsTestMsg}
                    onChange={(e) => setSmsTestMsg(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingSms}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingSms ? 'Contacting Telco Gateway...' : 'Send Live SMS to My Mobile'}</span>
                </button>
              </form>

              {/* Gateway Result Display */}
              {smsResult && (
                <div
                  className={`p-3.5 rounded-2xl text-xs space-y-1 font-mono border ${
                    smsResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    {smsResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{smsResult.success ? 'Gateway Dispatched (HTTP 200)' : 'Notice / Error:'}</span>
                  </div>
                  <p className="text-[11px] font-sans">
                    {smsResult.message || smsResult.error}
                  </p>
                  {smsResult.requestId && (
                    <div className="text-[10px] text-slate-500">
                      Request ID: {smsResult.requestId}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TELEMETRY & CHARTS */}
      {activeTab === 'analytics' && (
        <div>
          <AdminCharts />
        </div>
      )}

      {/* MODAL 1: ADD DEPARTMENT */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Clinical Department
              </h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Department Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neurology"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Department Token Code (2-4 uppercase letters):
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  placeholder="e.g. NEU"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="Clinical services and consultations provided..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD DOCTOR */}
      {showAddDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Medical Practitioner
              </h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoc} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Doctor Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ananya Sen"
                  value={docForm.name}
                  onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Department:
                </label>
                <select
                  value={docForm.departmentId}
                  onChange={(e) => setDocForm({ ...docForm, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Room Number:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 105"
                    value={docForm.roomNumber}
                    onChange={(e) => setDocForm({ ...docForm, roomNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Consultation Fee (₹):
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={docForm.consultationFee}
                    onChange={(e) => setDocForm({ ...docForm, consultationFee: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Specialization / Qualifications:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Neurologist & Surgeon"
                  value={docForm.specialization}
                  onChange={(e) => setDocForm({ ...docForm, specialization: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD STAFF */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register Front-Desk Staff Member
              </h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Employee ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAFF-OPD-105"
                  value={staffForm.employeeId}
                  onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Desk / Counter:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Desk 4"
                    value={staffForm.counterNumber}
                    onChange={(e) => setStaffForm({ ...staffForm, counterNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Assigned Shift:
                  </label>
                  <select
                    value={staffForm.shift}
                    onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Department:
                </label>
                <select
                  value={staffForm.departmentId}
                  onChange={(e) => setStaffForm({ ...staffForm, departmentId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
