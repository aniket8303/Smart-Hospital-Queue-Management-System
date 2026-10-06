import React from 'react';
import { RoleGuard } from '@/components/common/RoleGuard';

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['doctor']} roleName="Clinical Doctor Console">
      {children}
    </RoleGuard>
  );
}
