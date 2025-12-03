'use client';

export default function TagsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
          Tag Management
        </h1>
        <button style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: 'pointer',
          fontWeight: '500',
        }}>
          Register Tag
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
        <p>No tags registered yet.</p>
      </div>
    </div>
  );
}
