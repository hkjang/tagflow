'use client';

export default function ReportsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        Reports & Analytics
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Event Statistics</h2>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', color: '#9ca3af' }}>
            Chart Placeholder
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Tag Activity</h2>
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', color: '#9ca3af' }}>
            Chart Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
