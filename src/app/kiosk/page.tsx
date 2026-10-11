'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useQueue } from '@/context/QueueContext';
import { KioskLanguage, QueueItem } from '@/lib/types';
import { PrintTokenModal } from '@/components/common/PrintTokenModal';
import { QRCodeCanvas } from '@/components/common/QRCodeCanvas';
import { getMobileTokenUrl } from '@/lib/network';
import { 
  Activity, 
  Stethoscope, 
  HeartPulse, 
  Bone, 
  Baby, 
  Sparkles, 
  Eye, 
  User, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Printer, 
  Calendar, 
  ShieldCheck, 
  HelpCircle, 
  Loader2, 
  DollarSign,
  Maximize2,
  Minimize2,
  Tv,
  Users
} from 'lucide-react';

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome to MediQueue',
    skipReception: 'Skip the reception queue.',
    subtitle: 'Get your hospital token in less than a minute.',
    start: 'TOUCH TO START',
    needHelp: 'Need help? Ask Reception Desk 1',
    step1Title: 'Step 1: Select Clinical Department',
    step1Sub: 'Touch the department for your health consultation',
    step2Title: 'Step 2: Select Consulting Doctor',
    step2Sub: 'Choose an available specialist currently on duty',
    step3Title: 'Step 3: Patient Information',
    step3Sub: 'Enter your basic details for token generation',
    step4Title: 'Step 4: Consultation Fee & Payment',
    step4Sub: 'Complete fast demo payment to secure your token',
    step5Title: "You're in the Queue!",
    step5Sub: 'Your consultation position has been registered',
    waiting: 'waiting in line',
    estWait: 'Est. wait',
    onDuty: 'On Duty & Available',
    fullName: 'Full Patient Name',
    age: 'Age',
    gender: 'Gender',
    mobileNumber: 'Mobile Number (Optional for SMS)',
    existingPatient: 'Are you an existing hospital patient?',
    yes: 'Yes, Existing',
    no: 'No, First Visit',
    regularFee: 'Standard Consultation Fee',
    totalToPay: 'Total Amount',
    payDemo: 'Pay ₹300 (Simulated Demo)',
    processingPayment: 'Processing Secure Hospital Payment...',
    paymentSuccess: 'Payment Successful',
    tokenReveal: 'Generating Your Token...',
    printToken: 'Print Token Slip',
    sendSms: 'Sent to Mobile',
    viewQueue: 'View Live Waiting Room',
    done: 'Finish & New Patient',
    back: 'Back',
    cancel: 'Cancel',
    home: 'Home Screen',
    dailyReset: 'Daily Reset',
    idleNotice: 'Touch anywhere to keep session active',
    idleWarning: 'Returning to welcome screen in',
    seconds: 'seconds',
  },
  hi: {
    welcome: 'मेडीक्यू में आपका स्वागत है',
    skipReception: 'रिसेप्शन की लंबी कतार से बचें।',
    subtitle: 'एक मिनट से भी कम समय में अपना अस्पताल टोकन प्राप्त करें।',
    start: 'आरंभ करने के लिए स्पर्श करें',
    needHelp: 'मदद चाहिए? रिसेप्शन डेस्क 1 से संपर्क करें',
    step1Title: 'चरण 1: विभाग का चयन करें',
    step1Sub: 'अपने परामर्श के लिए विभाग को स्पर्श करें',
    step2Title: 'चरण 2: डॉक्टर का चयन करें',
    step2Sub: 'उपलब्ध विशेषज्ञ चिकित्सक का चयन करें',
    step3Title: 'चरण 3: मरीज़ की जानकारी',
    step3Sub: 'टोकन के लिए बुनियादी विवरण दर्ज करें',
    step4Title: 'चरण 4: परामर्श शुल्क और भुगतान',
    step4Sub: 'टोकन सुरक्षित करने के लिए त्वरित भुगतान करें',
    step5Title: 'आप कतार में शामिल हो गए हैं!',
    step5Sub: 'आपकी परामर्श स्थिति दर्ज कर ली गई है',
    waiting: 'मरीज़ प्रतीक्षारत',
    estWait: 'अनुमानित समय',
    onDuty: 'ड्यूटी पर उपलब्ध',
    fullName: 'मरीज़ का पूरा नाम',
    age: 'उम्र',
    gender: 'लिंग',
    mobileNumber: 'मोबाइल नंबर (एसएमएस के लिए वैकल्पिक)',
    existingPatient: 'क्या आप पहले से पंजीकृत मरीज़ हैं?',
    yes: 'हाँ, पंजीकृत',
    no: 'नहीं, पहली यात्रा',
    regularFee: 'मानक परामर्श शुल्क',
    totalToPay: 'कुल राशि',
    payDemo: '₹300 भुगतान करें (डेमो)',
    processingPayment: 'सुरक्षित भुगतान संसाधित हो रहा है...',
    paymentSuccess: 'भुगतान सफल रहा',
    tokenReveal: 'टोकन तैयार किया जा रहा है...',
    printToken: 'टोकन पर्ची प्रिंट करें',
    sendSms: 'मोबाइल पर भेजा गया',
    viewQueue: 'लाइव कतार देखें',
    done: 'समाप्त और नया मरीज़',
    back: 'पीछे',
    cancel: 'रद्द करें',
    home: 'होम स्क्रीन',
    dailyReset: 'दैनिक रीसेट',
    idleNotice: 'सत्र चालू रखने के लिए कहीं भी स्पर्श करें',
    idleWarning: 'होम स्क्रीन पर वापसी',
    seconds: 'सेकंड',
  },
  mr: {
    welcome: 'मेडीक्यू मध्ये आपले स्वागत आहे',
    skipReception: 'रिसेप्शनच्या रांगेत उभे राहू नका.',
    subtitle: 'एका मिनिटापेक्षा कमी वेळेत आपले हॉस्पिटल टोकन मिळवा.',
    start: 'सुरू करण्यासाठी स्पर्श करा',
    needHelp: 'मदत हवी आहे? रिसेप्शन डेस्क 1 ला भेटा',
    step1Title: 'टप्पा 1: वैद्यकीय विभाग निवडा',
    step1Sub: 'आपल्या तपासणीसाठी विभाग स्पर्श करा',
    step2Title: 'टप्पा 2: तज्ज्ञ डॉक्टर निवडा',
    step2Sub: 'उपलब्ध डॉक्टरांची निवड करा',
    step3Title: 'टप्पा 3: रुग्णाची माहिती',
    step3Sub: 'टोकनसाठी मूलभूत तपशील प्रविष्ट करा',
    step4Title: 'टप्पा 4: सल्लागार शुल्क आणि पेमेंट',
    step4Sub: 'टोकन मिळवण्यासाठी जलद पेमेंट पूर्ण करा',
    step5Title: 'आपण रांगेत आहात!',
    step5Sub: 'आपली रांगेतील जागा निश्चित झाली आहे',
    waiting: 'रुग्ण रांगेत आहेत',
    estWait: 'अंदाजे वेळ',
    onDuty: 'ड्युटीवर उपलब्ध',
    fullName: 'रुग्णाचे पूर्ण नाव',
    age: 'वय',
    gender: 'लिंग',
    mobileNumber: 'मोबाईल नंबर (एसएमएससाठी ऐच्छिक)',
    existingPatient: 'आपण आधीचे रुग्ण आहात का?',
    yes: 'होय, आधीचे रुग्ण',
    no: 'नाही, पहिली भेट',
    regularFee: 'नियमित तपासणी शुल्क',
    totalToPay: 'एकूण रक्कम',
    payDemo: '₹300 भरा (डेमो पेमेंट)',
    processingPayment: 'सुरक्षित पेमेंट प्रक्रिया सुरू आहे...',
    paymentSuccess: 'पेमेंट यशस्वी झाले',
    tokenReveal: 'टोकन तयार होत आहे...',
    printToken: 'टोकन प्रिंट करा',
    sendSms: 'मोबाईलवर पाठवले',
    viewQueue: 'लाइव्ह रांग पहा',
    done: 'पूर्ण करा व नवीन रुग्ण',
    back: 'मागे',
    cancel: 'रद्द करा',
    home: 'मुख्य स्क्रीन',
    dailyReset: 'दैनिक रीसेट',
    idleNotice: 'सत्र सुरू ठेवण्यासाठी कुठेही स्पर्श करा',
    idleWarning: 'होम स्क्रीनवर परत जाण्यास वेळ',
    seconds: 'सेकंद',
  },
};

const EXTRA_DEPARTMENTS = [
  {
    id: 'dept-gen-med',
    name: 'General Medicine',
    code: 'A',
    icon: Stethoscope,
    desc: 'Primary health care, viral fevers & diagnostics',
    waiting: 12,
    waitMin: 18,
    doctors: 4,
  },
  {
    id: 'dept-cardio',
    name: 'Cardiology',
    code: 'C',
    icon: HeartPulse,
    desc: 'Heart health, ECG & cardiovascular care',
    waiting: 8,
    waitMin: 22,
    doctors: 3,
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedics',
    code: 'O',
    icon: Bone,
    desc: 'Bones, joints, fractures & spine consultations',
    waiting: 6,
    waitMin: 15,
    doctors: 3,
  },
  {
    id: 'dept-pedia',
    name: 'Pediatrics',
    code: 'P',
    icon: Baby,
    desc: 'Child care, vaccinations & newborn health',
    waiting: 5,
    waitMin: 12,
    doctors: 2,
  },
  {
    id: 'dept-derma',
    name: 'Dermatology',
    code: 'D',
    icon: Sparkles,
    desc: 'Skin conditions, allergies & cosmetic health',
    waiting: 4,
    waitMin: 10,
    doctors: 2,
  },
  {
    id: 'dept-ent',
    name: 'ENT Specialist',
    code: 'E',
    icon: Eye,
    desc: 'Ear, nose, throat & allergy diagnostics',
    waiting: 7,
    waitMin: 14,
    doctors: 2,
  },
];

export default function KioskPage() {
  const { 
    departments, 
    doctors, 
    queue,
    joinQueue, 
    currentQueueDay, 
    resetDailyQueue,
    kioskSession,
    updateKioskSession,
    resetKioskSession,
    sendRealSms,
    addToast
  } = useQueue();

  const [language, setLanguage] = useState<KioskLanguage>('en');
  const [step, setStep] = useState<number>(0); // 0 = Idle / Start, 1 = Dept, 2 = Doc, 3 = Patient Info, 4 = Payment, 5 = Token Generated
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-gen-med');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-priya-sharma');
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [isExisting, setIsExisting] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'CASH'>('UPI');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentDone, setPaymentDone] = useState<boolean>(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState<boolean>(false);
  const [generatedItem, setGeneratedItem] = useState<QueueItem | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [idleSecondsRemaining, setIdleSecondsRemaining] = useState<number>(60);
  const [showIdleCountdown, setShowIdleCountdown] = useState<boolean>(false);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  const t = TRANSLATIONS[language];

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Idle Inactivity Detection (resets only the temporary kiosk session back to step 0 after 60s of inactivity)
  useEffect(() => {
    if (step === 0) {
      setShowIdleCountdown(false);
      return;
    }

    const timer = setInterval(() => {
      setIdleSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Timeout reached, return to welcome screen
          handleCancelOrHome();
          return 60;
        }
        if (prev <= 15) {
          setShowIdleCountdown(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const resetIdleTimer = () => {
    setIdleSecondsRemaining(60);
    setShowIdleCountdown(false);
  };

  const handleStartKiosk = () => {
    resetIdleTimer();
    setStep(1);
  };

  const handleSelectDept = (deptId: string) => {
    resetIdleTimer();
    setSelectedDeptId(deptId);
    // Find matching doctor or fallback
    const matchingDoc = doctors.find((d) => d.department.toLowerCase().includes(deptId.split('-')[1] || '')) || doctors[0];
    setSelectedDocId(matchingDoc.id);
    setStep(2);
  };

  const handleSelectDoctor = (docId: string) => {
    resetIdleTimer();
    setSelectedDocId(docId);
    setStep(3);
  };

  const handlePatientInfoNext = () => {
    resetIdleTimer();
    setStep(4);
  };

  const handlePayAndGenerate = () => {
    resetIdleTimer();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentDone(true);
      setIsGeneratingToken(true);

      setTimeout(() => {
        const item = joinQueue({
          patientName: patientName.trim() || 'Walk-in Patient',
          age: parseInt(patientAge, 10) || 30,
          gender: patientGender,
          departmentId: selectedDeptId,
          doctorId: selectedDocId,
          reason: 'Self-service Kiosk Consultation',
          phone: patientPhone.trim(),
          source: 'KIOSK',
          tokenType: patientPhone.trim() ? 'DIGITAL' : 'PHYSICAL',
          consultationFee: 300,
          transactionId: `MQ-TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          paymentMethod,
          paymentStatus: 'SUCCESS',
        });

        setGeneratedItem(item);
        setIsGeneratingToken(false);
        setStep(5);

        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#06b6d4', '#3b82f6', '#10b981', '#ffffff'],
          });
        } catch {}
      }, 1400);
    }, 1600);
  };

  const handleCancelOrHome = () => {
    setStep(0);
    setPaymentDone(false);
    setIsProcessingPayment(false);
    setIsGeneratingToken(false);
    setGeneratedItem(null);
    setShowIdleCountdown(false);
    setIdleSecondsRemaining(60);
    resetKioskSession();
  };

  const handleDailyResetDemo = () => {
    resetDailyQueue();
    handleCancelOrHome();
  };

  const activeDept = EXTRA_DEPARTMENTS.find((d) => d.id === selectedDeptId) || EXTRA_DEPARTMENTS[0];
  const activeDoc = doctors.find((d) => d.id === selectedDocId) || doctors[0];

  return (
    <div 
      onPointerDown={resetIdleTimer} 
      className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none font-sans"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none -z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-0" />

      {/* Top Touchscreen Kiosk Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={handleCancelOrHome}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-bold transition-all"
          >
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-black tracking-tight">MediQueue Kiosk</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold hidden sm:inline-block">
            DAY: {currentQueueDay}
          </span>
        </div>

        {/* Center: Language Switcher (Huge Touch Targets) */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          {(['en', 'hi', 'mr'] as KioskLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                resetIdleTimer();
              }}
              className={`min-w-[54px] min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                language === lang
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black scale-105'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
            </button>
          ))}
        </div>

        {/* Right Tools: Clock, Reset Demo, TV view */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <span className="font-mono text-cyan-400 font-bold text-sm">{currentTimeStr}</span>
            <span className="block text-[10px] text-slate-400 uppercase tracking-widest">Kiosk Terminal #01</span>
          </div>

          <button
            onClick={handleDailyResetDemo}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            title="Reset active daily queue state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daily Reset</span>
          </button>

          <Link
            href="/queue-display"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open Waiting Room TV"
          >
            <Tv className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Inactivity Warning Banner */}
      {showIdleCountdown && step > 0 && (
        <div className="relative z-30 bg-amber-500 text-slate-950 py-2.5 px-6 text-center text-xs font-black flex items-center justify-center gap-2 animate-pulse">
          <span>{t.idleWarning} {idleSecondsRemaining} {t.seconds}. {t.idleNotice}!</span>
          <button
            onClick={resetIdleTimer}
            className="px-3 py-0.5 rounded-lg bg-slate-950 text-white text-[11px] font-bold ml-2"
          >
            I am here!
          </button>
        </div>
      )}

      {/* Main Touchscreen Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto p-6 md:p-10 flex flex-col justify-center max-w-6xl mx-auto w-full">
        {/* STEP 0: WELCOME & START SCREEN */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-3xl mx-auto my-auto"
          >
            {/* Animated Glow Logo */}
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-2xl shadow-cyan-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <Activity className="w-12 h-12 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-black tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-4 py-1.5 rounded-full inline-block mb-3">
                {t.skipReception}
              </span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                {t.welcome}
              </h1>
              <p className="text-base sm:text-xl text-slate-400 mt-3 max-w-xl mx-auto font-medium">
                {t.subtitle}
              </p>
            </div>

            {/* Giant Touch Button (Min 64px Target) */}
            <div className="pt-4">
              <button
                onClick={handleStartKiosk}
                className="w-full sm:w-auto min-h-[72px] px-12 py-5 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xl shadow-2xl shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto"
              >
                <span>{t.start}</span>
                <ArrowRight className="w-7 h-7" />
              </button>
            </div>

            {/* Language Selection Quick Bar */}
            <div className="pt-4 flex items-center justify-center gap-3">
              {(['en', 'hi', 'mr'] as KioskLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-5 py-3 rounded-2xl border text-sm font-bold min-h-[50px] transition-all ${
                    language === lang
                      ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>

            {/* Footer Help */}
            <div className="text-xs text-slate-500 flex items-center justify-center gap-2 pt-4">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>{t.needHelp}</span>
            </div>
          </motion.div>
        )}

        {/* STEP 1: SELECT CLINICAL DEPARTMENT */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{t.step1Title}</h2>
              <p className="text-sm text-slate-400 mt-1">{t.step1Sub}</p>
            </div>

            {/* Department Touch Grid (6 Large Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {EXTRA_DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const isSelected = selectedDeptId === dept.id;
                return (
                  <button
                    key={dept.id}
                    onClick={() => handleSelectDept(dept.id)}
                    className={`min-h-[140px] p-6 rounded-3xl border text-left transition-all flex flex-col justify-between group active:scale-95 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-xl shadow-cyan-500/20'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                        ~{dept.waitMin} min wait
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{dept.desc}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800/80 pt-2.5 mt-2">
                      <span>{dept.waiting} {t.waiting}</span>
                      <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Select ➔
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 2: SELECT DOCTOR */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{t.step2Title}</h2>
              <p className="text-sm text-slate-400 mt-1">
                Department: <strong className="text-cyan-400">{activeDept.name}</strong> • {t.step2Sub}
              </p>
            </div>

            {/* Doctor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {doctors.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 shadow-xl shadow-cyan-500/20'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black text-xl shrink-0">
                        {doc.name.split(' ').map((n) => n[0]).join('')}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-white">{doc.name}</h3>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{doc.specialization}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="font-mono text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                            {doc.roomNumber}
                          </span>
                          <span className="text-emerald-400 font-semibold">{t.onDuty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        <span>Avg Service: <strong className="text-white">{doc.averageConsultationTimeMin}m</strong></span>
                      </div>
                      <button
                        onClick={() => handleSelectDoctor(doc.id)}
                        className="min-h-[50px] px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-2"
                      >
                        <span>SELECT DOCTOR</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: PATIENT INFORMATION */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-2xl mx-auto w-full"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{t.step3Title}</h2>
              <p className="text-sm text-slate-400 mt-1">{t.step3Sub}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full min-h-[58px] px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-bold text-base focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g. Rajesh Kadam or Rahul Sharma"
                />
              </div>

              {/* Age & Gender Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {t.age}
                  </label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full min-h-[58px] px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-base focus:outline-none focus:border-cyan-500"
                    placeholder="21"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {t.gender}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 min-h-[58px]">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPatientGender(g)}
                        className={`rounded-xl text-xs font-bold transition-all ${
                          patientGender === g ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t.mobileNumber}
                </label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full min-h-[58px] px-4 rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-base focus:outline-none focus:border-cyan-500"
                  placeholder="+91 98765 43210"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {patientPhone ? '✓ Mobile provided: Digital Token will be dispatched via SMS' : 'ⓘ No phone: Physical printed token will be dispensed by kiosk'}
                </span>
              </div>

              {/* Existing Patient Toggle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {t.existingPatient}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsExisting(true)}
                    className={`min-h-[50px] rounded-2xl border text-xs font-bold transition-all ${
                      isExisting
                        ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {t.yes}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExisting(false)}
                    className={`min-h-[50px] rounded-2xl border text-xs font-bold transition-all ${
                      !isExisting
                        ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {t.no}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handlePatientInfoNext}
                  className="w-full min-h-[64px] rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>CONTINUE TO PAYMENT</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: PAYMENT CONFIRMATION SCREEN */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 max-w-xl mx-auto w-full"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{t.step4Title}</h2>
              <p className="text-sm text-slate-400 mt-1">{t.step4Sub}</p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              {/* Order Receipt Summary */}
              <div className="border-b border-slate-800 pb-5 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <strong className="text-white text-sm">{activeDept.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Doctor:</span>
                  <strong className="text-white text-sm">{activeDoc.name} ({activeDoc.roomNumber})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient:</span>
                  <strong className="text-white">{patientName} ({patientAge}y, {patientGender})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.regularFee}:</span>
                  <strong className="font-mono text-white text-sm">₹300</strong>
                </div>
              </div>

              {/* Total Row */}
              <div className="flex items-center justify-between text-base">
                <span className="font-black text-slate-300">{t.totalToPay}</span>
                <span className="text-3xl font-black font-mono text-cyan-400">₹300</span>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Select Payment Method:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'CARD', label: 'Card Tap', icon: CreditCard },
                    { id: 'CASH', label: 'Cash at Desk', icon: DollarSign },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`min-h-[70px] p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300 font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pay Action Button with processing animation */}
              <div>
                <button
                  onClick={handlePayAndGenerate}
                  disabled={isProcessingPayment}
                  className="w-full min-h-[68px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
                      <span>{t.processingPayment}</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-6 h-6" />
                      <span>{t.payDemo}</span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-slate-500 text-center block mt-2">
                  ⓘ Clearly labeled: Demo Simulation — No real money is charged
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: TOKEN GENERATED REVEAL ANIMATION */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-xl mx-auto my-auto"
          >
            {/* Success Checkmark Draw Animation */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                ✓ {t.paymentSuccess} • TXN: MQ-2026-1042
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
                {t.step5Title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{t.step5Sub}</p>
            </div>

            {/* Apple-level Token Reveal Pass Card */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-1">
                OFFICIAL HOSPITAL TOKEN
              </div>

              {/* Large Token Animation */}
              <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-cyan-400 py-2">
                {generatedItem?.tokenNumber || 'A-001'}
              </div>

              <div className="h-px bg-slate-800 my-4" />

              {/* Grid of Key Token Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Position</span>
                  <strong className="text-xl font-mono font-bold text-white">
                    {String(generatedItem ? queue.findIndex((q) => q.tokenNumber === generatedItem.tokenNumber) + 1 || 1 : 1).padStart(2, '0')}
                  </strong>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Est. Wait</span>
                  <strong className="text-xl font-mono font-bold text-emerald-400">
                    ~{generatedItem?.estimatedWaitMinutes || 5} MIN
                  </strong>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 col-span-2 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultant</span>
                  <strong className="text-sm font-bold text-white truncate block">{activeDoc.name}</strong>
                  <span className="text-[10px] font-mono text-cyan-400">{activeDoc.roomNumber}</span>
                </div>
              </div>

              {/* Dynamic QR code section with full token metadata */}
              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-slate-800">
                    <QRCodeCanvas
                      value={getMobileTokenUrl(
                        generatedItem?.tokenNumber || 'A-001',
                        'claim',
                        generatedItem ? {
                          name: generatedItem.patient.name,
                          doc: generatedItem.doctorName,
                          dept: generatedItem.departmentName,
                          room: generatedItem.roomNumber,
                          pos: queue.findIndex((q) => q.tokenNumber === generatedItem.tokenNumber) + 1 || 1,
                          wait: generatedItem.estimatedWaitMinutes || 5,
                        } : undefined
                      )}
                      size={60}
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">📱 Scan to Take on Phone</span>
                    <span className="text-[10px] text-cyan-400 font-mono">TOKEN: {generatedItem?.tokenNumber || 'A-001'}</span>
                    <span className="text-[10px] text-slate-400 block">Camera auto-opens digital pass</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-800 hidden sm:inline-block">
                  SOURCE: KIOSK
                </span>
              </div>
            </div>

            {/* Action Buttons: Print, Send SMS, Done */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="min-h-[58px] rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printToken}</span>
              </button>

              <button
                onClick={async () => {
                  if (!patientPhone) {
                    addToast({
                      title: 'No Phone Provided',
                      description: 'Enter a mobile number to receive live SMS notifications.',
                      type: 'warning',
                    });
                    return;
                  }
                  const smsBody = `MediQueue: Token ${generatedItem?.tokenNumber || ''} confirmed at Diksha Hospital for ${activeDoc.name} in ${activeDoc.roomNumber}. Est wait: approx ${generatedItem?.estimatedWaitMinutes || 5} min.`;
                  addToast({
                    title: 'Sending SMS...',
                    description: `Contacting carrier for ${patientPhone}...`,
                    type: 'info',
                  });
                  const res = await sendRealSms(patientPhone, smsBody);
                  if (res?.success) {
                    addToast({
                      title: 'Real SMS Dispatched',
                      description: `Notification dispatched to ${patientPhone} via Fast2SMS. Ref: ${res.requestId}`,
                      type: 'success',
                    });
                  } else if (res?.isRechargeRequired) {
                    addToast({
                      title: 'Fast2SMS Activation Notice',
                      description: 'Fast2SMS requires a one-time ₹100 wallet recharge on fast2sms.com to unlock automated API sending. Displaying interactive on-screen alert.',
                      type: 'warning',
                    });
                  } else if (res?.simulated) {
                    addToast({
                      title: 'SMS Gateway Notice',
                      description: `To receive real SMS on ${patientPhone}, configure your free Fast2SMS API key in Admin -> SMS Gateway.`,
                      type: 'info',
                    });
                  } else {
                    addToast({
                      title: 'SMS Notice',
                      description: res?.error || 'SMS transmission queued.',
                      type: 'warning',
                    });
                  }
                }}
                className="min-h-[58px] rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>{t.sendSms}</span>
              </button>

              <button
                onClick={handleCancelOrHome}
                className="min-h-[58px] rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.done}</span>
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Persistent Touchscreen Footer Navigation (BACK, HOME, CANCEL) */}
      {step > 0 && step < 5 && (
        <footer className="relative z-20 flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <button
            onClick={() => setStep((s) => s - 1)}
            className="min-h-[54px] min-w-[120px] px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.back}</span>
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((st) => (
              <span
                key={st}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === st ? 'bg-cyan-400 scale-125' : step > st ? 'bg-emerald-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleCancelOrHome}
            className="min-h-[54px] min-w-[120px] px-6 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <span>{t.cancel}</span>
          </button>
        </footer>
      )}

      {/* Printable Thermal Slip Modal */}
      <PrintTokenModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        item={generatedItem}
      />
    </div>
  );
}
