import React from 'react';
import { RoleGuard } from '@/components/common/RoleGuard';
import { PatientBottomNav } from '@/components/patient/PatientBottomNav';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['patient']} roleName="Patient Portal">
      <div className="pb-16 sm:pb-0 min-h-screen">
        {children}
        <PatientBottomNav />
      </div>
    </RoleGuard>
  );
}
