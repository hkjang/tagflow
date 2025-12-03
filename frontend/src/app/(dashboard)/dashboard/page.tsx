'use client';

import { useAuth } from '../../../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        Dashboard
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {/* Welcome Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            Welcome back!
          </h2>
          <p style={{ color: '#6b7280' }}>
            Logged in as <span style={{ fontWeight: '600', color: '#1f2937' }}>{user?.username}</span>
          </p>
        </div>

        {/* Quick Stats Placeholder */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            System Status
          </h2>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', marginRight: '0.5rem' }}></div>
            <span style={{ color: '#059669', fontWeight: '500' }}>Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
}
