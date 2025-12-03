'use client';

export default function UsersPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
          User Management
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
          Add User
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Username</th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ borderTop: '1px solid #e5e7eb' }}>
            {/* Placeholder Data */}
            <tr style={{ borderTop: '1px solid #e5e7eb' }}>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#1f2937' }}>admin</td>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>
                  ADMIN
                </span>
              </td>
              <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>Active</td>
              <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500' }}>
                <button style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', marginRight: '1rem' }}>Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
