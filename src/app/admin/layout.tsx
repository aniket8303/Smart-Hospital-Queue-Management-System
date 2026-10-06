import React from 'react';
import { RoleGuard } from '@/components/common/RoleGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['admin']} roleName="Hospital Administration & Analytics">
      {children}
    </RoleGuard>
  );
}
