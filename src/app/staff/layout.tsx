import React from 'react';
import { RoleGuard } from '@/components/common/RoleGuard';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['staff']} roleName="Hospital Staff Operations">
      {children}
    </RoleGuard>
  );
}
