import React from 'react';

export const GeneralSettings: React.FC = () => {
    return (
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>General Settings</h2>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Manage system-wide configurations.</p>
            </div>

            <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        System Name
                    </label>
                    <input
                        type="text"
                        defaultValue="TagFlow RFID System"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '0.5rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.375rem',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>

                <button style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                }}>
                    Save Changes
                </button>
            </div>
        </div>
    );
};
