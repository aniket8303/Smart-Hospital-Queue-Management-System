'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { 
  QueueItem, 
  Doctor, 
  Department, 
  UserRole, 
  UserSession, 
  ROLE_PROFILES, 
  DemoStats, 
  AppNotification, 
  SMSAlert, 
  NotificationTarget,
  TokenSource,
  TokenType,
  KioskSession,
  KioskLanguage,
  StaffMember
} from '@/lib/types';
import { 
  INITIAL_QUEUE, 
  INITIAL_DOCTORS, 
  INITIAL_DEPARTMENTS, 
  INITIAL_STAFF,
  COMPLETED_SEED, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SMS_LOGS 
} from '@/lib/demo-data';
import { playHospitalChime, playSuccessChime, playClickSound, playSmsChime } from '@/lib/audio';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  timestamp: number;
}

interface QueueContextType {
  queue: QueueItem[];
  completedQueue: QueueItem[];
  doctors: Doctor[];
  departments: Department[];
  currentUserToken: string | null;
  currentRole: UserRole | null;
  currentSession: UserSession | null;
  logout: () => void;
  toasts: ToastMessage[];
  notifications: AppNotification[];
  smsLogs: SMSAlert[];
  activeSmsBanner: SMSAlert | null;
  dismissSmsBanner: () => void;
  currentQueueDay: string;
  resetDailyQueue: (newDay?: string) => void;
  kioskSession: KioskSession;
  updateKioskSession: (partial: Partial<KioskSession>) => void;
  resetKioskSession: () => void;
  addNotification: (data: {
    target: NotificationTarget;
    title: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'urgent';
    sms?: {
      phone: string;
      body: string;
    };
  }) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (role?: NotificationTarget) => void;
  sendTestSms: (customMsg?: string) => void;
  stats: DemoStats;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
  setCurrentUserToken: (token: string) => void;
  setCurrentRole: (role: UserRole | null) => void;
  setSoundEnabled: (enabled: boolean) => void;
  callNext: (doctorId?: string) => void;
  startConsultation: (tokenId: string) => void;
  completeConsultation: (tokenId: string) => void;
  skipPatient: (tokenId: string) => void;
  joinQueue: (data: {
    patientName: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    departmentId: string;
    doctorId: string;
    reason?: string;
    phone?: string;
    source?: TokenSource;
    tokenType?: TokenType;
    consultationFee?: number;
    transactionId?: string;
    paymentMethod?: 'UPI' | 'CARD' | 'CASH';
    paymentStatus?: 'SUCCESS' | 'PENDING' | 'WAIVED';
  }) => QueueItem;
  resetQueue: () => void;
  addEmergencyPatient: () => void;
  simulateDelay: () => void;
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  getMyQueueItem: () => QueueItem | undefined;
  getMyPosition: () => number;
  cancelQueueRegistration: (tokenNumberToCancel?: string) => void;
  refreshQueue: () => void;
  importOrSyncToken: (item: QueueItem) => void;

  // Admin Management CRUD
  staffMembers: StaffMember[];
  addStaffMember: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaffMember: (id: string, partial: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;

  addDoctor: (doc: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, partial: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  toggleDoctorAvailability: (id: string) => void;

  addDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, partial: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  // Real SMS Gateway
  fast2SmsApiKey: string;
  setFast2SmsApiKey: (key: string) => void;
  sendRealSms: (phone: string, message: string) => Promise<{ success: boolean; simulated?: boolean; error?: string; requestId?: string; details?: any }>;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const STORAGE_KEY_QUEUE = 'mediqueue_active_queue_v4';
const STORAGE_KEY_COMPLETED = 'mediqueue_completed_queue_v4';
const STORAGE_KEY_USER_TOKEN = 'mediqueue_current_token_v4';
const STORAGE_KEY_ROLE = 'mediqueue_current_role_v4';
const STORAGE_KEY_SOUND = 'mediqueue_sound_enabled_v4';
const STORAGE_KEY_THEME = 'mediqueue_theme_v1';
const STORAGE_KEY_NOTIFICATIONS = 'mediqueue_notifications_v1';
const STORAGE_KEY_SMS_LOGS = 'mediqueue_sms_logs_v1';
const STORAGE_KEY_DOCTORS = 'mediqueue_doctors_v2';
const STORAGE_KEY_DEPARTMENTS = 'mediqueue_departments_v2';
const STORAGE_KEY_STAFF = 'mediqueue_staff_v2';
const STORAGE_KEY_FAST2SMS_KEY = 'mediqueue_fast2sms_key_v1';

export function deduplicateQueue(items: QueueItem[]): QueueItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item?.tokenNumber) return false;
    if (seen.has(item.tokenNumber)) return false;
    seen.add(item.tokenNumber);
    return true;
  });
}

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [completedQueue, setCompletedQueue] = useState<QueueItem[]>(COMPLETED_SEED);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(INITIAL_STAFF);
  const [fast2SmsApiKey, setFast2SmsApiKeyState] = useState<string>('');
  const [currentUserToken, setCurrentUserTokenState] = useState<string | null>(null);
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [smsLogs, setSmsLogs] = useState<SMSAlert[]>(INITIAL_SMS_LOGS);
  const [activeSmsBanner, setActiveSmsBanner] = useState<SMSAlert | null>(null);
  const [currentQueueDay, setCurrentQueueDay] = useState<string>('2026-10-06');
  const [kioskSession, setKioskSession] = useState<KioskSession>({
    id: 'kiosk-session-01',
    step: 1,
    language: 'en',
    createdAt: new Date().toISOString(),
    lastActivityAt: Date.now(),
  });

  const updateKioskSession = useCallback((partial: Partial<KioskSession>) => {
    setKioskSession((prev) => ({
      ...prev,
      ...partial,
      lastActivityAt: Date.now(),
    }));
  }, []);

  const resetKioskSession = useCallback(() => {
    setKioskSession({
      id: `ks-${Date.now()}`,
      step: 1,
      language: 'en',
      createdAt: new Date().toISOString(),
      lastActivityAt: Date.now(),
    });
  }, []);

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const setTheme = useCallback((t: 'light' | 'dark') => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, t);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', t === 'dark');
      }
    } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [theme, setTheme]);

  const addToast = useCallback((t: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...t, id, timestamp: Date.now() };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Broadcast updates to all open browser windows/tabs
  const broadcastChange = useCallback((activeQ: QueueItem[], completedQ: QueueItem[]) => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('mediqueue_channel');
        bc.postMessage({ type: 'SYNC', queue: activeQ, completed: completedQ });
        bc.close();
      } catch {
        // Fallback to window storage event
      }
    }
  }, []);

  // Load state from localStorage on initial client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedQueue = localStorage.getItem(STORAGE_KEY_QUEUE);
      const savedCompleted = localStorage.getItem(STORAGE_KEY_COMPLETED);
      const savedToken = localStorage.getItem(STORAGE_KEY_USER_TOKEN);
      const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);
      const savedSound = localStorage.getItem(STORAGE_KEY_SOUND);

      if (savedQueue) {
        setQueue(deduplicateQueue(JSON.parse(savedQueue)));
      } else {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(INITIAL_QUEUE));
      }

      if (savedCompleted) {
        setCompletedQueue(JSON.parse(savedCompleted));
      } else {
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(COMPLETED_SEED));
      }

      if (savedToken) setCurrentUserTokenState(savedToken);
      if (savedRole) setCurrentRoleState(savedRole as UserRole);
      if (savedSound !== null) setSoundEnabledState(savedSound === 'true');
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as 'light' | 'dark' | null;
      if (savedTheme) {
        setThemeState(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const savedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      const savedSms = localStorage.getItem(STORAGE_KEY_SMS_LOGS);
      if (savedNotifs) {
        try { setNotifications(JSON.parse(savedNotifs)); } catch {}
      } else {
        localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      }
      if (savedSms) {
        try { setSmsLogs(JSON.parse(savedSms)); } catch {}
      } else {
        localStorage.setItem(STORAGE_KEY_SMS_LOGS, JSON.stringify(INITIAL_SMS_LOGS));
      }

      const savedDocs = localStorage.getItem(STORAGE_KEY_DOCTORS);
      if (savedDocs) {
        try { setDoctors(JSON.parse(savedDocs)); } catch {}
      } else {
        localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(INITIAL_DOCTORS));
      }

      const savedDepts = localStorage.getItem(STORAGE_KEY_DEPARTMENTS);
      if (savedDepts) {
        try { setDepartments(JSON.parse(savedDepts)); } catch {}
      } else {
        localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(INITIAL_DEPARTMENTS));
      }

      const savedStaff = localStorage.getItem(STORAGE_KEY_STAFF);
      if (savedStaff) {
        try { setStaffMembers(JSON.parse(savedStaff)); } catch {}
      } else {
        localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(INITIAL_STAFF));
      }

      const savedKey = localStorage.getItem(STORAGE_KEY_FAST2SMS_KEY);
      if (savedKey) {
        setFast2SmsApiKeyState(savedKey);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    } finally {
      setIsInitialized(true);
    }

    // Hydrate from server queue to ensure cross-device consistency (LAN / Wi-Fi phones)
    if (typeof window !== 'undefined') {
      fetch('/api/queue')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.queue) && data.queue.length > 0) {
            const clean = deduplicateQueue(data.queue);
            setQueue(clean);
            if (Array.isArray(data.completedQueue)) setCompletedQueue(deduplicateQueue(data.completedQueue));
            try {
              localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(clean));
              if (Array.isArray(data.completedQueue)) {
                localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(data.completedQueue));
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, []);

  // Listen to cross-tab broadcast updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('mediqueue_channel');
    bc.onmessage = (event) => {
      if (event.data?.type === 'SYNC') {
        if (event.data.queue) setQueue(deduplicateQueue(event.data.queue));
        if (event.data.completed) setCompletedQueue(deduplicateQueue(event.data.completed));
      }
    };
    return () => {
      bc.close();
    };
  }, []);

  // Save changes to localStorage and server LAN queue (guaranteed deduplication)
  const persistState = useCallback((newQueue: QueueItem[], newCompleted: QueueItem[]) => {
    const cleanQueue = deduplicateQueue(newQueue);
    const cleanCompleted = deduplicateQueue(newCompleted);
    setQueue(cleanQueue);
    setCompletedQueue(cleanCompleted);
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(cleanQueue));
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(cleanCompleted));
      broadcastChange(cleanQueue, cleanCompleted);
      // Sync across all LAN / Wi-Fi mobile devices
      if (typeof window !== 'undefined') {
        fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SYNC', queue: cleanQueue, completedQueue: cleanCompleted }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error saving state:', err);
    }
  }, [broadcastChange]);

  const setCurrentUserToken = useCallback((token: string) => {
    setCurrentUserTokenState(token);
    try {
      localStorage.setItem(STORAGE_KEY_USER_TOKEN, token);
    } catch {}
  }, []);

  const setCurrentRole = useCallback((role: UserRole | null) => {
    setCurrentRoleState(role);
    try {
      if (role) {
        localStorage.setItem(STORAGE_KEY_ROLE, role);
        if (role === 'patient') {
          const existingToken = localStorage.getItem(STORAGE_KEY_USER_TOKEN);
          if (existingToken) {
            setCurrentUserTokenState(existingToken);
          }
        } else {
          // For staff, doctor, admin: do not attach a patient queue token
          setCurrentUserTokenState(null);
          localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
        }
      } else {
        localStorage.removeItem(STORAGE_KEY_ROLE);
        localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
        setCurrentUserTokenState(null);
      }
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setCurrentRoleState(null);
    setCurrentUserTokenState(null);
    try {
      localStorage.removeItem(STORAGE_KEY_ROLE);
      localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
    } catch {}
    addToast({
      title: 'Signed Out',
      description: 'You have been securely signed out of your portal session.',
      type: 'info',
    });
  }, [addToast]);

  const currentSession = useMemo(() => {
    if (!currentRole) return null;
    const baseProfile = ROLE_PROFILES[currentRole];
    if (currentRole === 'patient') {
      const activeItem = queue.find((q) => q.tokenNumber === currentUserToken);
      if (activeItem) {
        return {
          ...baseProfile,
          name: activeItem.patient.name,
          title: `Token #${activeItem.tokenNumber} • ${activeItem.departmentName}`,
          department: activeItem.departmentName,
          roomNumber: activeItem.roomNumber,
          badge: activeItem.patient.uhid || activeItem.tokenNumber,
        };
      }
    }
    return baseProfile;
  }, [currentRole, queue, currentUserToken]);

  const dismissSmsBanner = useCallback(() => {
    setActiveSmsBanner(null);
  }, []);

  const addNotification = useCallback((data: {
    target: NotificationTarget;
    title: string;
    description: string;
    type?: 'info' | 'success' | 'warning' | 'urgent';
    sms?: {
      phone: string;
      body: string;
    };
  }) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      target: data.target,
      title: data.title,
      description: data.description,
      type: data.type || 'info',
      timestamp: 'Just now',
      read: false,
      smsDetails: data.sms,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev.slice(0, 24)];
      try {
        localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (data.sms) {
      const newSms: SMSAlert = {
        id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        recipientPhone: data.sms.phone,
        recipientName: 'Patient',
        tokenNumber: currentUserToken || undefined,
        message: data.sms.body,
        sentAt: 'Just now',
        status: 'DELIVERED',
      };
      setSmsLogs((prev) => {
        const updatedSms = [newSms, ...prev.slice(0, 19)];
        try {
          localStorage.setItem(STORAGE_KEY_SMS_LOGS, JSON.stringify(updatedSms));
        } catch {}
        return updatedSms;
      });

      if (soundEnabled) playSmsChime();
      setActiveSmsBanner(newSms);
      setTimeout(() => {
        setActiveSmsBanner((curr) => (curr?.id === newSms.id ? null : curr));
      }, 7500);

      // Trigger real SMS delivery via Next.js API route
      if (typeof window !== 'undefined') {
        fetch('/api/sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(fast2SmsApiKey ? { 'x-fast2sms-key': fast2SmsApiKey } : {}),
          },
          body: JSON.stringify({
            phone: data.sms.phone,
            message: data.sms.body,
            apiKey: fast2SmsApiKey,
          }),
        })
          .then(async (res) => {
            const result = await res.json().catch(() => null);
            if (result?.success) {
              addToast({
                title: 'Real SMS Dispatched',
                description: `Sent to ${data.sms?.phone} via Fast2SMS. Ref: ${result.requestId}`,
                type: 'success',
              });
            } else if (result?.simulated) {
              addToast({
                title: 'SMS Carrier Setup Notice',
                description: `To receive real SMS on ${data.sms?.phone}, enter your free Fast2SMS key in Admin Settings -> SMS Gateway.`,
                type: 'info',
              });
            } else {
              addToast({
                title: 'SMS Delivery Notice',
                description: result?.error || 'Unable to dispatch to telco carrier',
                type: 'warning',
              });
            }
          })
          .catch((err) => {
            console.error('Failed to dispatch SMS:', err);
          });
      }
    }
  }, [soundEnabled, currentUserToken, fast2SmsApiKey, addToast]);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback((role?: NotificationTarget) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => {
        if (!role || n.target === role || n.target === 'all') {
          return { ...n, read: true };
        }
        return n;
      });
      try {
        localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const sendTestSms = useCallback((customMsg?: string) => {
    const msg = customMsg || `MediQueue Alert: Token ${currentUserToken} wait time updated to 8 mins. Please remain nearby Room 102.`;
    addNotification({
      target: 'patient',
      title: 'SMS Update Received',
      description: msg,
      type: 'info',
      sms: {
        phone: '+91 91234 56789',
        body: msg,
      },
    });
  }, [currentUserToken, addNotification]);



  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_SOUND, String(enabled));
    } catch {}
  }, []);

  // Recalculate estimated wait times based on position in queue (5 min per patient)
  const recalculateWaitTimes = useCallback((items: QueueItem[]): QueueItem[] => {
    let waitingIndex = 0;
    return items.map((item) => {
      if (item.status === 'COMPLETED' || item.status === 'SKIPPED' || item.status === 'CANCELLED') {
        return { ...item, estimatedWaitMinutes: 0 };
      }
      if (item.status === 'IN_CONSULTATION') {
        return { ...item, estimatedWaitMinutes: 0 };
      }
      if (item.status === 'NEXT') {
        return { ...item, estimatedWaitMinutes: 2 };
      }
      // WAITING
      waitingIndex++;
      return {
        ...item,
        estimatedWaitMinutes: waitingIndex * 5,
      };
    });
  }, []);

  // MAIN CALL NEXT ACTION
  const callNext = useCallback((targetDoctorId?: string) => {
    if (soundEnabled) playHospitalChime();

    setQueue((prevQueue) => {
      const activeItems = [...prevQueue];
      const currentlyConsultingIdx = activeItems.findIndex(
        (i) => i.status === 'IN_CONSULTATION' && (!targetDoctorId || i.doctorId === targetDoctorId)
      );
      const currentlyNextIdx = activeItems.findIndex(
        (i) => i.status === 'NEXT' && (!targetDoctorId || i.doctorId === targetDoctorId)
      );

      let newlyCompleted: QueueItem[] = [];
      const updatedQueue: QueueItem[] = [];

      // 1. If someone is currently in consultation, complete them
      if (currentlyConsultingIdx !== -1) {
        const finished = {
          ...activeItems[currentlyConsultingIdx],
          status: 'COMPLETED' as const,
          consultationEndedAt: new Date().toISOString(),
          estimatedWaitMinutes: 0,
        };
        newlyCompleted.push(finished);
      }

      // 2. Filter remaining active items (not completed)
      for (let i = 0; i < activeItems.length; i++) {
        if (i === currentlyConsultingIdx) continue;
        updatedQueue.push(activeItems[i]);
      }

      // 3. Promote 'NEXT' to 'IN_CONSULTATION'
      let calledTokenNumber = '';
      let calledPatientName = '';
      const nextInLineIdx = updatedQueue.findIndex(
        (i) => i.status === 'NEXT' && (!targetDoctorId || i.doctorId === targetDoctorId)
      );

      if (nextInLineIdx !== -1) {
        calledTokenNumber = updatedQueue[nextInLineIdx].tokenNumber;
        calledPatientName = updatedQueue[nextInLineIdx].patient.name;
        updatedQueue[nextInLineIdx] = {
          ...updatedQueue[nextInLineIdx],
          status: 'IN_CONSULTATION',
          consultationStartedAt: new Date().toISOString(),
          estimatedWaitMinutes: 0,
        };
      } else {
        // If there was no NEXT, promote the first WAITING patient to IN_CONSULTATION
        const firstWaitingIdx = updatedQueue.findIndex(
          (i) => i.status === 'WAITING' && (!targetDoctorId || i.doctorId === targetDoctorId)
        );
        if (firstWaitingIdx !== -1) {
          calledTokenNumber = updatedQueue[firstWaitingIdx].tokenNumber;
          calledPatientName = updatedQueue[firstWaitingIdx].patient.name;
          updatedQueue[firstWaitingIdx] = {
            ...updatedQueue[firstWaitingIdx],
            status: 'IN_CONSULTATION',
            consultationStartedAt: new Date().toISOString(),
            estimatedWaitMinutes: 0,
          };
        }
      }

      // 4. Find the first remaining WAITING patient and promote them to 'NEXT'
      const newNextIdx = updatedQueue.findIndex(
        (i) => i.status === 'WAITING' && (!targetDoctorId || i.doctorId === targetDoctorId)
      );
      if (newNextIdx !== -1) {
        updatedQueue[newNextIdx] = {
          ...updatedQueue[newNextIdx],
          status: 'NEXT',
          estimatedWaitMinutes: 2,
        };
      }

      // Recalculate remaining wait times
      const finalized = recalculateWaitTimes(updatedQueue);

      // Persist completed items
      if (newlyCompleted.length > 0) {
        setCompletedQueue((prevComp) => {
          const nextComp = [...newlyCompleted, ...prevComp];
          try {
            localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(nextComp));
          } catch {}
          return nextComp;
        });
      }

      try {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(finalized));
        broadcastChange(finalized, newlyCompleted);
      } catch {}

      if (calledTokenNumber) {
        addToast({
          title: `Token ${calledTokenNumber} Called`,
          description: `${calledPatientName} is now in consultation with Dr. Priya Sharma.`,
          type: 'success',
        });

        // 1. Patient Notification & High-Priority SMS Alert
        addNotification({
          target: 'patient',
          title: `Token ${calledTokenNumber} Called!`,
          description: `Dr. Priya Sharma is ready in Room 102. Please proceed immediately to Door 102.`,
          type: 'urgent',
          sms: {
            phone: '+91 91234 56789',
            body: `URGENT [MediQueue Alert]: Token ${calledTokenNumber} is now CALLED for consultation with Dr. Priya Sharma in Room 102. Please proceed immediately to Door 102.`,
          },
        });

        // 2. Doctor Notification
        addNotification({
          target: 'doctor',
          title: `Patient Admitted: ${calledTokenNumber}`,
          description: `${calledPatientName} called into Room 102.`,
          type: 'success',
        });

        // 3. Staff Notification
        addNotification({
          target: 'staff',
          title: `Triage Sequence Advanced`,
          description: `Token ${calledTokenNumber} dispatched to Room 102.`,
          type: 'info',
        });
      } else {
        addToast({
          title: 'Queue Advanced',
          description: 'Next patient called successfully.',
          type: 'info',
        });
      }

      return finalized;
    });
  }, [soundEnabled, recalculateWaitTimes, broadcastChange, addToast, addNotification]);

  const startConsultation = useCallback((tokenId: string) => {
    if (soundEnabled) playClickSound();
    setQueue((prev) => {
      const updated = prev.map((item) => {
        if (item.id === tokenId || item.tokenNumber === tokenId) {
          return {
            ...item,
            status: 'IN_CONSULTATION' as const,
            consultationStartedAt: new Date().toISOString(),
            estimatedWaitMinutes: 0,
          };
        }
        return item;
      });
      const finalized = recalculateWaitTimes(updated);
      persistState(finalized, completedQueue);
      return finalized;
    });
    addToast({
      title: 'Consultation Commenced',
      description: `Patient is now in consultation.`,
      type: 'info',
    });
  }, [soundEnabled, recalculateWaitTimes, persistState, completedQueue, addToast]);

  const completeConsultation = useCallback((tokenId: string) => {
    if (soundEnabled) playSuccessChime();
    setQueue((prev) => {
      const itemToComplete = prev.find((i) => i.id === tokenId || i.tokenNumber === tokenId);
      if (!itemToComplete) return prev;

      const finished: QueueItem = {
        ...itemToComplete,
        status: 'COMPLETED',
        consultationEndedAt: new Date().toISOString(),
        estimatedWaitMinutes: 0,
      };

      const remaining = prev.filter((i) => i.id !== itemToComplete.id);
      
      // Auto promote NEXT if available
      const nextIdx = remaining.findIndex((i) => i.status === 'NEXT');
      if (nextIdx !== -1) {
        remaining[nextIdx] = {
          ...remaining[nextIdx],
          status: 'IN_CONSULTATION',
          consultationStartedAt: new Date().toISOString(),
        };
      }
      
      // Auto promote WAITING to NEXT
      const waitingIdx = remaining.findIndex((i) => i.status === 'WAITING');
      if (waitingIdx !== -1) {
        remaining[waitingIdx] = {
          ...remaining[waitingIdx],
          status: 'NEXT',
          estimatedWaitMinutes: 2,
        };
      }

      const finalized = recalculateWaitTimes(remaining);
      const newCompleted = [finished, ...completedQueue];
      persistState(finalized, newCompleted);

      addToast({
        title: `Consultation Completed`,
        description: `Token ${itemToComplete.tokenNumber} marked completed. Queue advanced.`,
        type: 'success',
      });

      addNotification({
        target: 'patient',
        title: 'Consultation Completed',
        description: `Visit complete with Dr. Priya Sharma. Digital summary archived to Medical History.`,
        type: 'success',
        sms: {
          phone: itemToComplete.patient.phone || '+91 91234 56789',
          body: `MediQueue: Consultation finalized for Token ${itemToComplete.tokenNumber}. Your digital prescription is ready for download in your patient portal.`,
        },
      });

      addNotification({
        target: 'doctor',
        title: `Consultation Concluded: ${itemToComplete.tokenNumber}`,
        description: `${itemToComplete.patient.name} discharged successfully.`,
        type: 'info',
      });

      return finalized;
    });
  }, [soundEnabled, completedQueue, recalculateWaitTimes, persistState, addToast, addNotification]);

  const skipPatient = useCallback((tokenId: string) => {
    if (soundEnabled) playClickSound();
    setQueue((prev) => {
      const skippedItem = prev.find((i) => i.id === tokenId || i.tokenNumber === tokenId);
      if (!skippedItem) return prev;
      const updated = prev.filter((i) => i.id !== skippedItem.id);
      const skippedMarked: QueueItem = { ...skippedItem, status: 'SKIPPED', estimatedWaitMinutes: 0 };
      const newCompleted = [skippedMarked, ...completedQueue];
      const finalized = recalculateWaitTimes(updated);
      persistState(finalized, newCompleted);
      addToast({
        title: `Token ${skippedItem.tokenNumber} Skipped`,
        description: `${skippedItem.patient.name} was marked skipped.`,
        type: 'warning',
      });
      return finalized;
    });
  }, [soundEnabled, completedQueue, recalculateWaitTimes, persistState, addToast]);

  // Join Queue flow (Supports: RECEPTION | MOBILE | KIOSK)
  const joinQueue = useCallback((data: {
    patientName: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    departmentId: string;
    doctorId: string;
    reason?: string;
    phone?: string;
    source?: TokenSource;
    tokenType?: TokenType;
    consultationFee?: number;
    transactionId?: string;
    paymentMethod?: 'UPI' | 'CARD' | 'CASH';
    paymentStatus?: 'SUCCESS' | 'PENDING' | 'WAIVED';
  }): QueueItem => {
    if (soundEnabled) playSuccessChime();

    const selectedDept = departments.find((d) => d.id === data.departmentId) || departments[0];
    const selectedDoc = doctors.find((doc) => doc.id === data.doctorId) || doctors[0];

    // Determine token number starting cleanly at 001
    const prefix = selectedDept.code || 'A';
    const existingTokens = queue
      .filter((q) => q.tokenNumber.startsWith(prefix))
      .map((q) => parseInt(q.tokenNumber.split('-')[1] || '0', 10));
    const maxNum = existingTokens.length > 0 ? Math.max(...existingTokens) : 0;
    const nextNumber = maxNum + 1;
    const tokenNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

    const waitingAhead = queue.filter(
      (q) => q.doctorId === selectedDoc.id && (q.status === 'WAITING' || q.status === 'NEXT')
    ).length;

    const estimatedWait = Math.max(5, (waitingAhead + 1) * selectedDoc.averageConsultationTimeMin);
    const source: TokenSource = data.source || 'MOBILE';
    const tokenType: TokenType = data.tokenType || (data.phone ? 'DIGITAL' : 'PHYSICAL');

    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      tokenNumber,
      patient: {
        id: `p-${Date.now()}`,
        name: data.patientName || 'Walk-in Patient',
        age: data.age || 30,
        gender: data.gender || 'Male',
        phone: data.phone || '',
        uhid: `UHID-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      },
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.name,
      departmentId: selectedDept.id,
      departmentName: selectedDept.name,
      roomNumber: selectedDoc.roomNumber,
      joinedAt: new Date().toISOString(),
      status: waitingAhead === 0 ? 'NEXT' : 'WAITING',
      priority: 'NORMAL',
      source,
      tokenType,
      queueDay: currentQueueDay,
      consultationFee: data.consultationFee ?? selectedDoc.consultationFee,
      transactionId: data.transactionId,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus || 'PENDING',
      reason: data.reason || 'General health consultation',
      estimatedWaitMinutes: estimatedWait,
    };

    setQueue((prev) => {
      if (prev.some((q) => q.tokenNumber === tokenNumber)) return prev;
      const nextQ = recalculateWaitTimes(deduplicateQueue([...prev, newItem]));
      try {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(nextQ));
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedQueue));
        broadcastChange(nextQ, completedQueue);
        if (typeof window !== 'undefined') {
          fetch('/api/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'SYNC', queue: nextQ, completedQueue }),
          }).catch(() => {});
        }
      } catch {}
      return nextQ;
    });

    setCurrentUserToken(tokenNumber);

    addToast({
      title: `Token ${tokenNumber} Issued via ${source}!`,
      description: `Position #${waitingAhead + 1} for ${selectedDoc.name} (~${estimatedWait} min).`,
      type: 'success',
    });

    if (data.phone) {
      addNotification({
        target: 'patient',
        title: `Token ${tokenNumber} Confirmed (${source})`,
        description: `You are #${waitingAhead + 1} in line for ${selectedDoc.name} in Room ${selectedDoc.roomNumber}. Est. wait: ~${estimatedWait} min.`,
        type: 'success',
        sms: {
          phone: data.phone,
          body: `MediQueue: Token ${tokenNumber} confirmed (${source}) for ${selectedDoc.name} in ${selectedDoc.roomNumber}. Position: #${waitingAhead + 1}. Est wait: ~${estimatedWait} min. Track: mediqueue.live/track`,
        },
      });
    }

    addNotification({
      target: 'staff',
      title: `New ${source} Check-in`,
      description: `Token ${tokenNumber} (${tokenType}) created via ${source} for ${selectedDoc.name}.`,
      type: 'info',
    });

    return newItem;
  }, [soundEnabled, departments, doctors, queue, currentQueueDay, recalculateWaitTimes, completedQueue, persistState, setCurrentUserToken, addToast, addNotification]);

  const cancelQueueRegistration = useCallback((tokenNumberToCancel?: string) => {
    if (soundEnabled) playClickSound();
    const targetToken = tokenNumberToCancel || currentUserToken;
    if (!targetToken) return;

    setQueue((prev) => {
      const itemToCancel = prev.find((q) => q.tokenNumber === targetToken);
      if (!itemToCancel) return prev;
      const updated = prev.filter((q) => q.tokenNumber !== targetToken);
      const recalculated = recalculateWaitTimes(updated);
      persistState(recalculated, completedQueue);
      return recalculated;
    });

    if (currentUserToken === targetToken) {
      setCurrentUserTokenState('');
      try {
        localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
      } catch {}
    }

    addToast({
      title: 'Registration Cancelled',
      description: `Token ${targetToken} has been removed from the active queue.`,
      type: 'warning',
    });

    addNotification({
      target: 'patient',
      title: 'Queue Registration Cancelled',
      description: `Your token ${targetToken} was cancelled at Diksha Hospital.`,
      type: 'warning',
    });
  }, [soundEnabled, currentUserToken, recalculateWaitTimes, persistState, completedQueue, addToast, addNotification]);

  const refreshQueue = useCallback(() => {
    if (soundEnabled) playClickSound();
    addToast({
      title: 'Queue Telemetry Synced',
      description: 'Latest queue position and wait times refreshed from Diksha Hospital OPD.',
      type: 'info',
    });
  }, [soundEnabled, addToast]);


  // Daily Queue Reset (Separates Active Daily Queue from Historical Records)
  const resetDailyQueue = useCallback((newDay?: string) => {
    if (soundEnabled) playClickSound();
    const targetDay = newDay || new Date().toISOString().split('T')[0];
    setCurrentQueueDay(targetDay);

    // Archive current queue items to completed
    setCompletedQueue((prev) => [
      ...prev,
      ...queue.map((item) => ({ ...item, status: 'COMPLETED' as const })),
    ]);

    // Reset active daily queue
    setQueue([]);
    setCurrentUserTokenState('');
    resetKioskSession();

    addToast({
      title: `Daily Queue Rolled: ${targetDay}`,
      description: 'Active OPD queue reset cleanly. Historical records archived safely.',
      type: 'info',
    });

    addNotification({
      target: 'admin',
      title: `Daily Queue Rolled: ${targetDay}`,
      description: `Hospital day successfully rolled to ${targetDay}. Active token sequences refreshed.`,
      type: 'info',
    });
  }, [soundEnabled, queue, resetKioskSession, addToast, addNotification]);

  const resetQueue = useCallback(() => {
    if (soundEnabled) playClickSound();
    setQueue([]);
    setCompletedQueue([]);
    setCurrentUserTokenState(null);
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify([]));
      localStorage.removeItem(STORAGE_KEY_USER_TOKEN);
      broadcastChange([], []);
      if (typeof window !== 'undefined') {
        fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SYNC', queue: [], completedQueue: [] }),
        }).catch(() => {});
      }
    } catch {}
    addToast({
      title: 'Queue Reset',
      description: 'Active OPD queue cleared cleanly for a fresh operating day.',
      type: 'info',
    });
  }, [soundEnabled, broadcastChange, addToast]);

  const addEmergencyPatient = useCallback(() => {
    if (soundEnabled) playHospitalChime();
    const emergencyItem: QueueItem = {
      id: `q-emg-${Date.now()}`,
      tokenNumber: `E-00${Math.floor(1 + Math.random() * 9)}`,
      patient: {
        id: `p-emg-${Date.now()}`,
        name: 'Emergency Trauma Patient',
        age: 33,
        gender: 'Male',
        phone: '+91 99999 00000',
        uhid: `UHID-EMG-${Date.now().toString().slice(-4)}`,
      },
      doctorId: 'doc-priya-sharma',
      doctorName: 'Dr. Priya Sharma',
      departmentId: 'dept-gen-med',
      departmentName: 'General Medicine',
      roomNumber: 'Room 102',
      joinedAt: new Date().toISOString(),
      status: 'NEXT',
      priority: 'URGENT',
      source: 'RECEPTION',
      tokenType: 'PHYSICAL',
      queueDay: currentQueueDay,
      reason: 'Acute respiratory distress and severe desaturation.',
      vitals: { bp: '150/95', pulse: 110, temp: '100.2 F', spO2: 91 },
      estimatedWaitMinutes: 0,
    };

    setQueue((prev) => {
      // Put right after current consultation
      const inConsult = prev.filter((i) => i.status === 'IN_CONSULTATION');
      const rest = prev.filter((i) => i.status !== 'IN_CONSULTATION');
      const updated = [...inConsult, emergencyItem, ...rest];
      const finalized = recalculateWaitTimes(updated);
      persistState(finalized, completedQueue);
      return finalized;
    });

    addToast({
      title: 'URGENT: Emergency Patient Added',
      description: `Token ${emergencyItem.tokenNumber} prioritized at top of queue.`,
      type: 'urgent',
    });

    // Multi-role notifications
    addNotification({
      target: 'doctor',
      title: 'CRITICAL TRIAGE: Emergency Patient',
      description: `Acute trauma Token ${emergencyItem.tokenNumber} prioritized. Vitals: SpO2 91%, BP 150/95.`,
      type: 'urgent',
    });

    addNotification({
      target: 'staff',
      title: 'Emergency Arrival Handled',
      description: `Token ${emergencyItem.tokenNumber} prioritized to front of OPD line.`,
      type: 'urgent',
    });

    addNotification({
      target: 'admin',
      title: 'Urgent Trauma Inflow',
      description: `Trauma arrival ${emergencyItem.tokenNumber} logged in General Medicine.`,
      type: 'warning',
    });
  }, [soundEnabled, recalculateWaitTimes, persistState, completedQueue, addToast, addNotification]);

  const simulateDelay = useCallback(() => {
    if (soundEnabled) playClickSound();
    setQueue((prev) => {
      const updated = prev.map((item) => {
        if (item.status === 'WAITING' || item.status === 'NEXT') {
          return {
            ...item,
            estimatedWaitMinutes: item.estimatedWaitMinutes + 5,
          };
        }
        return item;
      });
      persistState(updated, completedQueue);
      return updated;
    });

    addToast({
      title: 'Queue Delay Recalculated',
      description: 'Simulated +5 min delay across waiting patients.',
      type: 'warning',
    });

    // Patient SMS advisory & notification
    addNotification({
      target: 'patient',
      title: 'Wait Time Advisory (+5 min)',
      description: 'Dr. Priya Sharma is currently attending a critical case. Estimated wait is delayed by ~5 min.',
      type: 'warning',
      sms: {
        phone: '+91 91234 56789',
        body: 'MediQueue Advisory: Dr. Priya Sharma is currently attending an extended consultation. Your estimated wait has increased by ~5m. Updated times live on your dashboard.',
      },
    });

    addNotification({
      target: 'staff',
      title: 'Queue Delay Calculated',
      description: '+5 min increment applied to active waiting list.',
      type: 'warning',
    });

    addNotification({
      target: 'admin',
      title: 'OPD Flow Deviation',
      description: 'General Medicine wait times exceeded benchmark (+5m variance).',
      type: 'warning',
    });
  }, [soundEnabled, persistState, completedQueue, addToast, addNotification]);

  const getMyQueueItem = useCallback(() => {
    return queue.find((q) => q.tokenNumber === currentUserToken);
  }, [queue, currentUserToken]);

  const getMyPosition = useCallback(() => {
    const activeWaiting = queue.filter(
      (q) => q.status === 'WAITING' || q.status === 'NEXT' || q.status === 'IN_CONSULTATION'
    );
    const myIndex = activeWaiting.findIndex((q) => q.tokenNumber === currentUserToken);
    return myIndex === -1 ? 0 : myIndex + 1;
  }, [queue, currentUserToken]);

  const importOrSyncToken = useCallback((item: QueueItem) => {
    setQueue((prev) => {
      const existingIdx = prev.findIndex((q) => q.tokenNumber === item.tokenNumber || q.id === item.id);
      let updated: QueueItem[];
      if (existingIdx !== -1) {
        // If existing item has generic name and newly scanned item has actual patient name, update it
        updated = prev.map((q, idx) => {
          if (idx === existingIdx && item.patient?.name && item.patient.name !== 'Patient' && item.patient.name !== 'Walk-in Patient') {
            return {
              ...q,
              patient: {
                ...q.patient,
                name: item.patient.name,
              },
            };
          }
          return q;
        });
      } else {
        updated = recalculateWaitTimes(deduplicateQueue([...prev, item]));
      }
      try {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(updated));
        broadcastChange(updated, completedQueue);
        if (typeof window !== 'undefined') {
          fetch('/api/queue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'SYNC', queue: updated, completedQueue }),
          }).catch(() => {});
        }
      } catch {}
      return updated;
    });
    setCurrentUserTokenState(item.tokenNumber);
    setCurrentRoleState('patient');
    try {
      localStorage.setItem(STORAGE_KEY_USER_TOKEN, item.tokenNumber);
      localStorage.setItem(STORAGE_KEY_ROLE, 'patient');
    } catch {}
  }, [completedQueue, recalculateWaitTimes, broadcastChange]);

  const setFast2SmsApiKey = useCallback((key: string) => {
    setFast2SmsApiKeyState(key);
    try {
      localStorage.setItem(STORAGE_KEY_FAST2SMS_KEY, key);
    } catch {}
  }, []);

  const addDoctor = useCallback((doc: Omit<Doctor, 'id'>) => {
    const id = `doc-${Date.now()}`;
    const newDoc: Doctor = { ...doc, id };
    setDoctors((prev) => {
      const next = [...prev, newDoc];
      try { localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Doctor Added', description: `${doc.name} assigned to ${doc.department} (${doc.roomNumber})`, type: 'success' });
  }, [addToast]);

  const updateDoctor = useCallback((id: string, partial: Partial<Doctor>) => {
    setDoctors((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...partial } : d));
      try { localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Doctor Updated', description: 'Doctor configuration updated', type: 'info' });
  }, [addToast]);

  const deleteDoctor = useCallback((id: string) => {
    setDoctors((prev) => {
      const next = prev.filter((d) => d.id !== id);
      try { localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Doctor Removed', description: 'Doctor removed from OPD roster', type: 'warning' });
  }, [addToast]);

  const toggleDoctorAvailability = useCallback((id: string) => {
    setDoctors((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, isAvailable: !d.isAvailable } : d));
      try { localStorage.setItem(STORAGE_KEY_DOCTORS, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const addDepartment = useCallback((dept: Omit<Department, 'id'>) => {
    const id = `dept-${dept.code.toLowerCase()}-${Date.now().toString().slice(-4)}`;
    const newDept: Department = { ...dept, id };
    setDepartments((prev) => {
      const next = [...prev, newDept];
      try { localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Department Added', description: `${dept.name} (${dept.code}) initialized`, type: 'success' });
  }, [addToast]);

  const updateDepartment = useCallback((id: string, partial: Partial<Department>) => {
    setDepartments((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...partial } : d));
      try { localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Department Updated', description: 'Department details saved', type: 'info' });
  }, [addToast]);

  const deleteDepartment = useCallback((id: string) => {
    setDepartments((prev) => {
      const next = prev.filter((d) => d.id !== id);
      try { localStorage.setItem(STORAGE_KEY_DEPARTMENTS, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Department Removed', description: 'Department deleted from hospital directory', type: 'warning' });
  }, [addToast]);

  const addStaffMember = useCallback((staff: Omit<StaffMember, 'id'>) => {
    const id = `staff-${Date.now()}`;
    const newStaff: StaffMember = { ...staff, id };
    setStaffMembers((prev) => {
      const next = [...prev, newStaff];
      try { localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Staff Registered', description: `${staff.name} assigned to ${staff.counterNumber}`, type: 'success' });
  }, [addToast]);

  const updateStaffMember = useCallback((id: string, partial: Partial<StaffMember>) => {
    setStaffMembers((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...partial } : s));
      try { localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Staff Updated', description: 'Staff record updated', type: 'info' });
  }, [addToast]);

  const deleteStaffMember = useCallback((id: string) => {
    setStaffMembers((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try { localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(next)); } catch {}
      return next;
    });
    addToast({ title: 'Staff Removed', description: 'Staff member removed from desk list', type: 'warning' });
  }, [addToast]);

  const sendRealSms = useCallback(async (phone: string, message: string) => {
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(fast2SmsApiKey ? { 'x-fast2sms-key': fast2SmsApiKey } : {}),
        },
        body: JSON.stringify({ phone, message, apiKey: fast2SmsApiKey }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }, [fast2SmsApiKey]);

  // Compute live overview statistics
  const stats: DemoStats = useMemo(() => {
    const waiting = queue.filter((q) => q.status === 'WAITING').length;
    const inConsult = queue.filter((q) => q.status === 'IN_CONSULTATION').length;
    const nextInLine = queue.filter((q) => q.status === 'NEXT').length;
    const completed = completedQueue.length;
    const totalToday = waiting + inConsult + nextInLine + completed;
    return {
      totalPatientsToday: totalToday,
      activeWaiting: waiting + nextInLine,
      inConsultation: inConsult,
      completedToday: completed,
      averageWaitTimeMinutes: 17,
      doctorsOnDuty: doctors.filter((d) => d.isAvailable).length,
    };
  }, [queue, completedQueue, doctors]);

  return (
    <QueueContext.Provider
      value={{
        queue,
        completedQueue,
        doctors,
        departments,
        staffMembers,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        toggleDoctorAvailability,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        fast2SmsApiKey,
        setFast2SmsApiKey,
        sendRealSms,
        currentUserToken,
        currentRole,
        currentSession,
        logout,
        toasts,
        notifications,
        smsLogs,
        activeSmsBanner,
        dismissSmsBanner,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sendTestSms,
        stats,
        soundEnabled,
        theme,
        toggleTheme,
        setTheme,
        setCurrentUserToken,
        setCurrentRole,
        setSoundEnabled,
        callNext,
        startConsultation,
        completeConsultation,
        skipPatient,
        joinQueue,
        currentQueueDay,
        resetDailyQueue,
        kioskSession,
        updateKioskSession,
        resetKioskSession,
        resetQueue,
        addEmergencyPatient,
        simulateDelay,
        dismissToast,
        addToast,
        getMyQueueItem,
        getMyPosition,
        cancelQueueRegistration,
        refreshQueue,
        importOrSyncToken,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
