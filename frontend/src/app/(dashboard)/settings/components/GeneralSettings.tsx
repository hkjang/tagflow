import React, { useEffect, useState } from 'react';
import { settingsService } from '../../../../services/settings.service';

export const GeneralSettings: React.FC = () => {
    const [systemName, setSystemName] = useState('');
    const [webhookCardUidKey, setWebhookCardUidKey] = useState('');
    const [tagThrottleTime, setTagThrottleTime] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await settingsService.getSettings();
            setSystemName(settings.system_name || '');
            setWebhookCardUidKey(settings.webhook_card_uid_key || 'card_uid');
            setTagThrottleTime(settings.tag_throttle_time || '0');
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await settingsService.updateSettings({
                system_name: systemName,
                webhook_card_uid_key: webhookCardUidKey,
                tag_throttle_time: tagThrottleTime,
            });
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('Failed to save settings');
        }
    };

    if (loading) return <div>Loading settings...</div>;

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
                        value={systemName}
                        onChange={(e) => setSystemName(e.target.value)}
                        placeholder="TagFlow RFID System"
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

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Webhook Card UID Key
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        The key name used for the Card UID in webhook payloads (default: card_uid).
                    </p>
                    <input
                        type="text"
                        value={webhookCardUidKey}
                        onChange={(e) => setWebhookCardUidKey(e.target.value)}
                        placeholder="card_uid"
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

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                        Tag Throttle Time (minutes)
                    </label>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        If a tag is scanned multiple times within this window, subsequent scans will be ignored. Set to 0 to disable.
                    </p>
                    <input
                        type="number"
                        min="0"
                        value={tagThrottleTime}
                        onChange={(e) => setTagThrottleTime(e.target.value)}
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

                <button
                    onClick={handleSave}
                    style={{
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
