import { Doctor, Department, QueueItem, Appointment, StaffMember } from './types';

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-01',
    name: 'Priya Verma',
    employeeId: 'STAFF-OPD-102',
    departmentId: 'dept-gen-med',
    departmentName: 'General Medicine',
    counterNumber: 'Desk 1',
    shift: 'Morning',
    isActive: true,
  },
  {
    id: 'staff-02',
    name: 'Suresh Patil',
    employeeId: 'STAFF-OPD-103',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    counterNumber: 'Desk 2',
    shift: 'Morning',
    isActive: true,
  },
  {
    id: 'staff-03',
    name: 'Kavita Deshmukh',
    employeeId: 'STAFF-OPD-104',
    departmentId: 'dept-ortho',
    departmentName: 'Orthopedics',
    counterNumber: 'Desk 3',
    shift: 'Evening',
    isActive: true,
  },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-gen-med',
    name: 'General Medicine',
    code: 'GM',
    iconName: 'Stethoscope',
    description: 'Comprehensive primary health care, diagnostic consultations, and routine exams.',
    activeDoctors: 4,
  },
  {
    id: 'dept-cardio',
    name: 'Cardiology',
    code: 'CAR',
    iconName: 'HeartPulse',
    description: 'Cardiac evaluations, ECG, echocardiography, and preventive heart care.',
    activeDoctors: 3,
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedics',
    code: 'ORT',
    iconName: 'Bone',
    description: 'Bone, joint, spinal issues, sports injuries, and trauma rehabilitation.',
    activeDoctors: 3,
  },
  {
    id: 'dept-pedia',
    name: 'Pediatrics',
    code: 'PED',
    iconName: 'Baby',
    description: 'Compassionate pediatric medicine, vaccinations, and growth monitoring.',
    activeDoctors: 2,
  },
  {
    id: 'dept-derma',
    name: 'Dermatology',
    code: 'DRM',
    iconName: 'Sparkles',
    description: 'Advanced skin treatments, allergies, diagnostics, and cosmetic wellness.',
    activeDoctors: 2,
  },
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-priya-sharma',
    name: 'Dr. Priya Sharma',
    department: 'General Medicine',
    departmentId: 'dept-gen-med',
    roomNumber: 'Room 102',
    specialization: 'Senior Physician & Internal Medicine Specialist',
    isAvailable: true,
    averageConsultationTimeMin: 5,
    consultationFee: 300,
  },
  {
    id: 'doc-rahul-mehta',
    name: 'Dr. Rahul Mehta',
    department: 'Cardiology',
    departmentId: 'dept-cardio',
    roomNumber: 'Room 204',
    specialization: 'Consultant Interventional Cardiologist',
    isAvailable: true,
    averageConsultationTimeMin: 8,
    consultationFee: 500,
  },
  {
    id: 'doc-neha-kulkarni',
    name: 'Dr. Neha Kulkarni',
    department: 'Orthopedics',
    departmentId: 'dept-ortho',
    roomNumber: 'Room 108',
    specialization: 'Orthopedic Surgeon & Joint Replacement Specialist',
    isAvailable: true,
    averageConsultationTimeMin: 7,
    consultationFee: 450,
  },
  {
    id: 'doc-rajesh-verma',
    name: 'Dr. Rajesh Verma',
    department: 'Pediatrics',
    departmentId: 'dept-pedia',
    roomNumber: 'Room 301',
    specialization: 'Pediatrician & Neonatologist',
    isAvailable: true,
    averageConsultationTimeMin: 6,
    consultationFee: 350,
  },
];

export const INITIAL_APPOINTMENT: Appointment = {
  id: 'apt-001',
  doctorName: 'Dr. Priya Sharma',
  department: 'General Medicine',
  roomNumber: 'Room 102',
  date: 'Today',
  time: '11:30 AM',
  status: 'Confirmed',
  tokenNumber: 'A-042',
};

export const INITIAL_QUEUE: QueueItem[] = [];

export const COMPLETED_SEED: QueueItem[] = [];


export const KIOSK_ANALYTICS: import('./types').KioskAnalytics = {
  tokensToday: 83,
  avgCompletionSeconds: 45,
  paymentSuccessRate: 99.2,
  abandonedSessionsCount: 3,
  peakHour: '10:00 AM - 11:30 AM',
  bySource: {
    reception: 42,
    mobile: 67,
    kiosk: 83,
  },
  processingTimes: {
    receptionMin: 3.0,
    mobileMin: 1.5,
    kioskSeconds: 45,
  },
};

export const HOURLY_PATIENT_FLOW = [
  { hour: '08:00', patients: 12, completed: 8, avgWait: 11 },
  { hour: '09:00', patients: 28, completed: 22, avgWait: 14 },
  { hour: '10:00', patients: 42, completed: 34, avgWait: 19 },
  { hour: '11:00', patients: 38, completed: 31, avgWait: 17 },
  { hour: '12:00', patients: 24, completed: 26, avgWait: 13 },
  { hour: '13:00', patients: 16, completed: 15, avgWait: 10 },
  { hour: '14:00', patients: 32, completed: 28, avgWait: 16 },
  { hour: '15:00', patients: 26, completed: 24, avgWait: 14 },
];

export const DEPARTMENT_WAIT_STATS = [
  { department: 'General Medicine', avgWait: 15, patientsToday: 48, doctors: 4 },
  { department: 'Cardiology', avgWait: 22, patientsToday: 32, doctors: 3 },
  { department: 'Orthopedics', avgWait: 18, patientsToday: 26, doctors: 3 },
  { department: 'Pediatrics', avgWait: 12, patientsToday: 28, doctors: 2 },
  { department: 'Dermatology', avgWait: 14, patientsToday: 20, doctors: 2 },
];

export const INITIAL_NOTIFICATIONS: import('./types').AppNotification[] = [
  // Patient notifications
  {
    id: 'notif-p-1',
    target: 'patient',
    title: 'Token A-042 Confirmed',
    description: 'Your token A-042 is booked for Dr. Priya Sharma (Room 102). Est. wait: ~15 min.',
    type: 'success',
    timestamp: '10 min ago',
    read: false,
    smsDetails: {
      phone: '+91 91234 56789',
      body: 'MediQueue: Token A-042 issued for General Medicine (Room 102). 2 patients ahead. Est. wait ~15m.',
    },
  },
  {
    id: 'notif-p-2',
    target: 'patient',
    title: 'Queue Position Update',
    description: 'Queue advanced: 2 patients ahead for Dr. Priya Sharma in Room 102.',
    type: 'info',
    timestamp: '3 min ago',
    read: false,
    smsDetails: {
      phone: '+91 91234 56789',
      body: 'MediQueue: 2 patients ahead in line. Please remain seated near OPD Lounge A.',
    },
  },
  {
    id: 'notif-p-3',
    target: 'patient',
    title: 'Appointment Reminder',
    description: 'Your consultation with Dr. Priya Sharma is scheduled for today at 11:30 AM.',
    type: 'info',
    timestamp: '30 min ago',
    read: true,
  },

  // Staff notifications
  {
    id: 'notif-s-1',
    target: 'staff',
    title: 'Walk-In Registration',
    description: 'Front Desk 1 issued token A-043 for General Medicine triage.',
    type: 'info',
    timestamp: '5 min ago',
    read: false,
  },
  {
    id: 'notif-s-2',
    target: 'staff',
    title: 'Room 102 Turnover',
    description: 'Dr. Priya Sharma is ready for consultation advancement.',
    type: 'success',
    timestamp: '12 min ago',
    read: true,
  },

  // Doctor notifications
  {
    id: 'notif-d-1',
    target: 'doctor',
    title: 'Next Patient Queued',
    description: 'Outpatient Patient (Token A-042) is queued at OPD Lounge A.',
    type: 'info',
    timestamp: '8 min ago',
    read: false,
  },
  {
    id: 'notif-d-2',
    target: 'doctor',
    title: 'Vitals Recorded (Room 102)',
    description: 'Vitals recorded for Token A-041: BP 118/76, SpO2 99%, Pulse 72 bpm.',
    type: 'success',
    timestamp: '18 min ago',
    read: true,
  },

  // Admin notifications
  {
    id: 'notif-a-1',
    target: 'admin',
    title: 'Hospital Wait Benchmark Met',
    description: 'Average OPD wait time is 17 min, beating benchmark target by 4 min.',
    type: 'success',
    timestamp: '15 min ago',
    read: false,
  },
  {
    id: 'notif-a-2',
    target: 'admin',
    title: 'Daily Outpatient Milestone',
    description: 'Hospital has successfully processed 128 outpatient tokens today.',
    type: 'info',
    timestamp: '45 min ago',
    read: true,
  },
];

export const INITIAL_SMS_LOGS: import('./types').SMSAlert[] = [
  {
    id: 'sms-1',
    recipientPhone: '+91 91234 56789',
    recipientName: 'Patient',
    tokenNumber: 'A-042',
    message: 'MediQueue: Welcome. Token A-042 is confirmed for Dr. Priya Sharma in Room 102. 2 patients ahead. Est wait: ~15m.',
    sentAt: '10 min ago',
    status: 'DELIVERED',
  },
  {
    id: 'sms-2',
    recipientPhone: '+91 91234 56789',
    recipientName: 'Patient',
    tokenNumber: 'A-042',
    message: 'MediQueue Alert: Outpatient queue advanced. You are currently #2 in line. Please remain near Door 102.',
    sentAt: '3 min ago',
    status: 'DELIVERED',
  },
];

export const INITIAL_PATIENT_PROFILE: import('./types').PatientProfile = {
  id: 'patient-profile-1',
  uhid: 'UHID-2026-8303',
  name: 'Patient',
  email: 'patient@mediqueue.org',
  phone: '+91 91234 56789',
  gender: 'Male',
  age: 28,
  bloodGroup: 'B+',
  emergencyContact: '+91 98765 43210',
  address: '702 Emerald Heights, Diksha Hospital Road, Pune',
  role: 'patient',
  registeredAt: '2026-09-15T09:30:00Z',
};

export const INITIAL_PAYMENTS: import('./types').PaymentRecord[] = [
  {
    id: 'pay-1',
    transactionId: 'MQ-2026-8303',
    tokenNumber: 'A-042',
    patientName: 'Patient',
    doctorName: 'Dr. Priya Sharma',
    departmentName: 'General Medicine',
    amount: 300,
    paymentMethod: 'UPI',
    status: 'SUCCESS',
    isDemo: true,
    paidAt: 'Today, 10:45 AM',
    receiptUrl: '/receipts/MQ-2026-8303',
  },
  {
    id: 'pay-2',
    transactionId: 'MQ-2026-7741',
    tokenNumber: 'CAR-012',
    patientName: 'Patient',
    doctorName: 'Dr. Rahul Mehta',
    departmentName: 'Cardiology',
    amount: 500,
    paymentMethod: 'CARD',
    status: 'SUCCESS',
    isDemo: true,
    paidAt: 'Oct 04, 2026',
    receiptUrl: '/receipts/MQ-2026-7741',
  },
  {
    id: 'pay-3',
    transactionId: 'MQ-2026-5120',
    tokenNumber: 'ORT-009',
    patientName: 'Patient',
    doctorName: 'Dr. Neha Kulkarni',
    departmentName: 'Orthopedics',
    amount: 450,
    paymentMethod: 'UPI',
    status: 'SUCCESS',
    isDemo: true,
    paidAt: 'Sep 21, 2026',
    receiptUrl: '/receipts/MQ-2026-5120',
  },
];

export const INITIAL_APPOINTMENTS: import('./types').Appointment[] = [
  {
    id: 'appt-1',
    doctorName: 'Dr. Priya Sharma',
    department: 'General Medicine',
    roomNumber: 'Room 102',
    date: 'Today',
    time: '11:30 AM',
    status: 'Confirmed',
    tokenNumber: 'A-042',
  },
  {
    id: 'appt-2',
    doctorName: 'Dr. Rahul Mehta',
    department: 'Cardiology',
    roomNumber: 'Room 204',
    date: 'Tomorrow',
    time: '02:00 PM',
    status: 'Confirmed',
  },
  {
    id: 'appt-3',
    doctorName: 'Dr. Neha Kulkarni',
    department: 'Orthopedics',
    roomNumber: 'Room 108',
    date: 'Sep 21, 2026',
    time: '10:00 AM',
    status: 'Completed',
    tokenNumber: 'ORT-009',
  },
];


