'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Calendar, FileText, Stethoscope, User } from 'lucide-react';

export function PatientBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/patient', icon: Home },
    { label: 'Doctors', href: '/patient/find-doctor', icon: Stethoscope },
    { label: 'My Queue', href: '/patient/queue', icon: Layers },
    { label: 'Appts', href: '/patient/appointment', icon: Calendar },
    { label: 'Reports', href: '/patient/reports', icon: FileText },
    { label: 'Profile', href: '/patient/profile', icon: User },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-2 pb-5 safe-bottom shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-cyan-600 dark:text-cyan-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
