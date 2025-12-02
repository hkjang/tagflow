'use client';

import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700';
  };

  return (
    <div className="w-64 bg-blue-600 min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-white text-2xl font-bold">TagFlow</h1>
        <p className="text-blue-200 text-sm mt-1">
          {user?.role === 'admin' ? 'Administrator' : 'Operator'}
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link
          href="/dashboard"
          className={`block px-4 py-3 rounded-lg transition ${isActive('/dashboard')}`}
        >
          Dashboard
        </Link>

        <Link
          href="/events"
          className={`block px-4 py-3 rounded-lg transition ${isActive('/events')}`}
        >
          Tag Events
        </Link>

        <Link
          href="/monitoring"
          className={`block px-4 py-3 rounded-lg transition ${isActive('/monitoring')}`}
        >
          Webhook Logs
        </Link>

        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-4 text-blue-200 text-xs font-semibold uppercase">
              Admin
            </div>

            <Link
              href="/admin/webhooks"
              className={`block px-4 py-3 rounded-lg transition ${isActive('/admin/webhooks')}`}
            >
              Webhooks
            </Link>

            <Link
              href="/admin/users"
              className={`block px-4 py-3 rounded-lg transition ${isActive('/admin/users')}`}
            >
              Users
            </Link>

            <Link
              href="/admin/cleanup"
              className={`block px-4 py-3 rounded-lg transition ${isActive('/admin/cleanup')}`}
            >
              Cleanup Logs
            </Link>
          </>
        )}

        <Link
          href="/reports"
          className={`block px-4 py-3 rounded-lg transition ${isActive('/reports')}`}
        >
          Reports
        </Link>
      </nav>

      <div className="p-4 border-t border-blue-500">
        <div className="text-white text-sm mb-2">
          {user?.username}
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
