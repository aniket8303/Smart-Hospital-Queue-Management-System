export type QueueStatus = 
  | 'WAITING' 
  | 'NEXT' 
  | 'IN_CONSULTATION' 
  | 'COMPLETED' 
  | 'SKIPPED' 
  | 'CANCELLED';

export type PriorityLevel = 'NORMAL' | 'HIGH' | 'URGENT';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  uhid: string; // Unique Health ID
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  roomNumber: string;
  specialization: string;
  avatarUrl?: string;
  isAvailable: boolean;
  averageConsultationTimeMin: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  iconName: string;
  description: string;
  activeDoctors: number;
}

export type TokenSource = 'RECEPTION' | 'MOBILE' | 'KIOSK';
export type TokenType = 'PHYSICAL' | 'DIGITAL';

export interface QueueItem {
  id: string;
  tokenNumber: string; // e.g. "A-042"
  patient: Patient;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  roomNumber: string;
  joinedAt: string; // ISO string
  consultationStartedAt?: string;
  consultationEndedAt?: string;
  status: QueueStatus;
  priority: PriorityLevel;
  source: TokenSource; // RECEPTION | MOBILE | KIOSK
  tokenType?: TokenType; // PHYSICAL | DIGITAL
  queueDay?: string; // e.g. "2026-10-06"
  consultationFee?: number;
  transactionId?: string;
  paymentMethod?: 'UPI' | 'CARD' | 'CASH';
  paymentStatus?: 'SUCCESS' | 'PENDING' | 'WAIVED';
  reason: string;
  notes?: string;
  vitals?: {
    bp?: string;
    pulse?: number;
    temp?: string;
    spO2?: number;
  };
  estimatedWaitMinutes: number;
}

export type KioskLanguage = 'en' | 'hi' | 'mr';

export interface KioskSession {
  id: string;
  step: 1 | 2 | 3 | 4 | 5;
  language: KioskLanguage;
  departmentId?: string;
  doctorId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  patientPhone?: string;
  isExistingPatient?: boolean;
  paymentMethod?: 'UPI' | 'CARD' | 'CASH';
  paymentStatus?: 'PENDING' | 'SUCCESS';
  transactionId?: string;
  tokenGenerated?: QueueItem;
  createdAt: string;
  lastActivityAt: number;
}

export interface KioskAnalytics {
  tokensToday: number;
  avgCompletionSeconds: number;
  paymentSuccessRate: number;
  abandonedSessionsCount: number;
  peakHour: string;
  bySource: {
    reception: number;
    mobile: number;
    kiosk: number;
  };
  processingTimes: {
    receptionMin: number;
    mobileMin: number;
    kioskSeconds: number;
  };
}

export interface Appointment {
  id: string;
  doctorName: string;
  department: string;
  roomNumber: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  tokenNumber?: string;
}

export type UserRole = 'patient' | 'staff' | 'doctor' | 'admin';

export interface UserSession {
  role: UserRole;
  name: string;
  title: string;
  department?: string;
  roomNumber?: string;
  badge: string;
}

export const ROLE_PROFILES: Record<UserRole, UserSession> = {
  patient: {
    role: 'patient',
    name: 'Aniket Parekar',
    title: 'Outpatient Patient',
    badge: 'UHID-2026-8303',
  },
  staff: {
    role: 'staff',
    name: 'Priya Verma',
    title: 'Hospital Front-Desk Ops',
    department: 'Triage & Reception',
    roomNumber: 'Desk 1',
    badge: 'STAFF-OPD-102',
  },
  doctor: {
    role: 'doctor',
    name: 'Dr. Priya Sharma',
    title: 'Senior Physician',
    department: 'General Medicine',
    roomNumber: 'Room 102',
    badge: 'DOC-GM-8821',
  },
  admin: {
    role: 'admin',
    name: 'Dr. Rajesh Mehta',
    title: 'Chief Operations Officer',
    department: 'Hospital Directorate',
    badge: 'ADMIN-EXEC-01',
  },
};

export interface DemoStats {
  totalPatientsToday: number;
  activeWaiting: number;
  inConsultation: number;
  completedToday: number;
  averageWaitTimeMinutes: number;
  doctorsOnDuty: number;
}

export type NotificationTarget = 'patient' | 'staff' | 'doctor' | 'admin' | 'all';

export interface SMSAlert {
  id: string;
  recipientPhone: string;
  recipientName: string;
  tokenNumber?: string;
  message: string;
  sentAt: string;
  status: 'DELIVERED' | 'SENT';
}

export interface AppNotification {
  id: string;
  target: NotificationTarget;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  timestamp: string;
  read: boolean;
  smsDetails?: {
    phone: string;
    body: string;
  };
}

export interface Biomarker {
  id: string;
  name: string;
  scientificName: string;
  category: 'Metabolic & Sugar' | 'Heart & Lipids' | 'Blood Cells (CBC)' | 'Kidney Function' | 'Liver Function';
  value: number;
  unit: string;
  normalRange: string;
  minNormal: number;
  maxNormal: number;
  status: 'OPTIMAL' | 'BORDERLINE' | 'ELEVATED' | 'LOW';
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  plainEnglishExplanation: string; // Plain everyday language explanation
  recommendation: string; // What the patient should do
  historicalValues: {
    date: string;
    value: number;
    label: string;
  }[];
}

export interface MedicalReport {
  id: string;
  title: string;
  category: string;
  date: string;
  laboratory: string;
  doctorName: string;
  summaryPlainEnglish: string;
  overallHealthScore: number; // 0-100
  overallStatus: 'Improving' | 'Stable' | 'Needs Attention';
  biomarkers: Biomarker[];
  aiInsights: string[];
  uploadedAt: string;
}



