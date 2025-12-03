'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (isAuthenticated && user) {
    router.push('/dashboard');
    return null; // or a loading spinner while redirecting
  }


  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f3f4f6',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem',
        }}>
          TagFlow
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '2rem',
        }}>
          RFID Tag Management System
        </p>

        {/* User is redirected, so we only show login prompt if NOT authenticated */
        !isAuthenticated && (
          <div style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '1rem',
          }}>
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
            }}>
              Please sign in to access the system
            </p>
            <button
              onClick={() => router.push('/login')}
              style={{
                padding: '0.625rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'white',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              Sign in
            </button>
          </div>
        )}

        <div style={{
          padding: '1.5rem',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ color: '#374151', fontSize: '0.875rem' }}>
            Backend API:{' '}
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              http://localhost:3001
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
