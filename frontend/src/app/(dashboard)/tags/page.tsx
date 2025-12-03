'use client';

export default function TagsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
          Tag Management
        </h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            RFID Tags Auto-Registration
          </h2>
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            RFID tags are automatically registered when they are scanned by an RFID reader. 
            Each tag event is captured and processed by the system, creating a record in the database.
          </p>
          <div style={{ backgroundColor: '#f3f4f6', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
              How it works:
            </h3>
            <ul style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li>RFID reader detects a tag</li>
              <li>Tag UID is sent to the backend via HTTP request</li>
              <li>System creates a tag event record</li>
              <li>Configured webhooks are triggered to notify external systems</li>
            </ul>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1.5rem' }}>
            To view tag events and statistics, visit the <strong>Reports</strong> page.
          </p>
        </div>
      </div>
    </div>
  );
}
