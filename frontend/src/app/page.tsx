export default function HomePage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f3f4f6'
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
        TagFlow
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem' }}>
        RFID Tag Management System
      </p>
      <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <p style={{ color: '#374151' }}>
          Backend API: <a href="http://localhost:3001" style={{ color: '#2563eb' }}>http://localhost:3001</a>
        </p>
      </div>
    </div>
  );
}
