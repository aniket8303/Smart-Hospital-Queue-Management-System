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

export interface DemoStats {
  totalPatientsToday: number;
  activeWaiting: number;
  inConsultation: number;
  completedToday: number;
  averageWaitTimeMinutes: number;
  doctorsOnDuty: number;
}
