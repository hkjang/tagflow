'use client';

import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Sidebar />
      
      <div style={{ marginLeft: '250px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{
          backgroundColor: 'white',
          padding: '1rem 2rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#ef4444',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Sign out
          </button>
        </header>

        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
