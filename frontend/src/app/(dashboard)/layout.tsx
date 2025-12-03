'use client';

import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
