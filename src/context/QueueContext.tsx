'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { QueueItem, Doctor, Department, UserRole, DemoStats } from '@/lib/types';
import { INITIAL_QUEUE, INITIAL_DOCTORS, INITIAL_DEPARTMENTS, COMPLETED_SEED } from '@/lib/demo-data';
import { playHospitalChime, playSuccessChime, playClickSound } from '@/lib/audio';

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
  currentUserToken: string;
  currentRole: UserRole;
  toasts: ToastMessage[];
  stats: DemoStats;
  soundEnabled: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
  setCurrentUserToken: (token: string) => void;
  setCurrentRole: (role: UserRole) => void;
  setSoundEnabled: (enabled: boolean) => void;
  callNext: (doctorId?: string) => void;
  startConsultation: (tokenId: string) => void;
  completeConsultation: (tokenId: string) => void;
  skipPatient: (tokenId: string) => void;
  joinQueue: (data: {
    patientName: string;
    departmentId: string;
    doctorId: string;
    reason: string;
    phone?: string;
  }) => QueueItem;
  resetQueue: () => void;
  addEmergencyPatient: () => void;
  simulateDelay: () => void;
  dismissToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  getMyQueueItem: () => QueueItem | undefined;
  getMyPosition: () => number;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

const STORAGE_KEY_QUEUE = 'mediqueue_active_queue_v1';
const STORAGE_KEY_COMPLETED = 'mediqueue_completed_queue_v1';
const STORAGE_KEY_USER_TOKEN = 'mediqueue_current_token_v1';
const STORAGE_KEY_ROLE = 'mediqueue_current_role_v1';
const STORAGE_KEY_SOUND = 'mediqueue_sound_enabled_v1';
const STORAGE_KEY_THEME = 'mediqueue_theme_v1';

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [completedQueue, setCompletedQueue] = useState<QueueItem[]>(COMPLETED_SEED);
  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [departments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [currentUserToken, setCurrentUserTokenState] = useState<string>('A-042');
  const [currentRole, setCurrentRoleState] = useState<UserRole>('patient');
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
        setQueue(JSON.parse(savedQueue));
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
    } catch (e) {
      console.warn('LocalStorage error:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Listen to cross-tab broadcast updates
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('mediqueue_channel');
    bc.onmessage = (event) => {
      if (event.data?.type === 'SYNC') {
        if (event.data.queue) setQueue(event.data.queue);
        if (event.data.completed) setCompletedQueue(event.data.completed);
      }
    };
    return () => {
      bc.close();
    };
  }, []);

  // Save changes to localStorage
  const persistState = useCallback((newQueue: QueueItem[], newCompleted: QueueItem[]) => {
    setQueue(newQueue);
    setCompletedQueue(newCompleted);
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(newQueue));
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(newCompleted));
      broadcastChange(newQueue, newCompleted);
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

  const setCurrentRole = useCallback((role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch {}
  }, []);

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
      } else {
        addToast({
          title: 'Queue Advanced',
          description: 'Next patient called successfully.',
          type: 'info',
        });
      }

      return finalized;
    });
  }, [soundEnabled, recalculateWaitTimes, broadcastChange, addToast]);

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

      return finalized;
    });
  }, [soundEnabled, completedQueue, recalculateWaitTimes, persistState, addToast]);

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

  // Join Queue flow
  const joinQueue = useCallback((data: {
    patientName: string;
    departmentId: string;
    doctorId: string;
    reason: string;
    phone?: string;
  }): QueueItem => {
    if (soundEnabled) playSuccessChime();

    const selectedDept = departments.find((d) => d.id === data.departmentId) || departments[0];
    const selectedDoc = doctors.find((doc) => doc.id === data.doctorId) || doctors[0];

    // Determine token number
    const prefix = selectedDept.code || 'A';
    const existingTokens = queue
      .filter((q) => q.tokenNumber.startsWith(prefix))
      .map((q) => parseInt(q.tokenNumber.split('-')[1] || '0', 10));
    const maxNum = existingTokens.length > 0 ? Math.max(...existingTokens) : 44;
    const nextNumber = maxNum + 1;
    const tokenNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;

    const waitingAhead = queue.filter(
      (q) => q.doctorId === selectedDoc.id && (q.status === 'WAITING' || q.status === 'NEXT')
    ).length;

    const estimatedWait = Math.max(5, (waitingAhead + 1) * selectedDoc.averageConsultationTimeMin);

    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      tokenNumber,
      patient: {
        id: `p-${Date.now()}`,
        name: data.patientName || 'Aniket Parekar',
        age: 21,
        gender: 'Male',
        phone: data.phone || '+91 91234 56789',
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
      reason: data.reason || 'General health consultation',
      estimatedWaitMinutes: estimatedWait,
    };

    setQueue((prev) => {
      const nextQ = recalculateWaitTimes([...prev, newItem]);
      persistState(nextQ, completedQueue);
      return nextQ;
    });

    setCurrentUserToken(tokenNumber);

    addToast({
      title: `Token ${tokenNumber} Issued!`,
      description: `You're #${waitingAhead + 1} in line for ${selectedDoc.name}.`,
      type: 'success',
    });

    return newItem;
  }, [soundEnabled, departments, doctors, queue, recalculateWaitTimes, completedQueue, persistState, setCurrentUserToken, addToast]);

  const resetQueue = useCallback(() => {
    if (soundEnabled) playClickSound();
    setQueue(INITIAL_QUEUE);
    setCompletedQueue(COMPLETED_SEED);
    setCurrentUserTokenState('A-042');
    try {
      localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(INITIAL_QUEUE));
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(COMPLETED_SEED));
      localStorage.setItem(STORAGE_KEY_USER_TOKEN, 'A-042');
      broadcastChange(INITIAL_QUEUE, COMPLETED_SEED);
    } catch {}
    addToast({
      title: 'Demo Queue Reset',
      description: 'Restored original demo state (A-040 in consultation, A-042 #3).',
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
  }, [soundEnabled, recalculateWaitTimes, persistState, completedQueue, addToast]);

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
  }, [soundEnabled, persistState, completedQueue, addToast]);

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
        currentUserToken,
        currentRole,
        toasts,
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
        resetQueue,
        addEmergencyPatient,
        simulateDelay,
        dismissToast,
        addToast,
        getMyQueueItem,
        getMyPosition,
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
