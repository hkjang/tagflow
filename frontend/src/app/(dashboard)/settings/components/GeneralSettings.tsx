import React, { useEffect, useState } from 'react';
import { settingsService } from '../../../../services/settings.service';
import { useTranslation } from '../../../../lib/i18n';

export const GeneralSettings: React.FC = () => {
    const { t } = useTranslation();
    const [systemName, setSystemName] = useState('');
    const [webhookCardUidKey, setWebhookCardUidKey] = useState('');
    const [tagThrottleTime, setTagThrottleTime] = useState('0');
    const [loading, setLoading] = useState(true);
    const [resettingTagEvents, setResettingTagEvents] = useState(false);
    const [resettingWebhookLogs, setResettingWebhookLogs] = useState(false);

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
            alert(t('settings.savedSuccess'));
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert(t('settings.saveFailed'));
        }
    };

    const handleResetTagEvents = async () => {
        if (!confirm(t('settings.confirmResetTagEvents'))) {
            return;
        }

        try {
            setResettingTagEvents(true);
            const result = await settingsService.resetTagEvents();
            alert(t('settings.resetTagEventsSuccess', { count: result.deletedCount }));
        } catch (error: any) {
            console.error('Failed to reset tag events:', error);
            alert(error.response?.data?.message || t('settings.saveFailed'));
        } finally {
            setResettingTagEvents(false);
        }
    };

    const handleResetWebhookLogs = async () => {
        if (!confirm(t('settings.confirmResetWebhookLogs'))) {
            return;
        }

        try {
            setResettingWebhookLogs(true);
            const result = await settingsService.resetWebhookLogs();
            alert(t('settings.resetWebhookLogsSuccess', { count: result.deletedCount }));
        } catch (error: any) {
            console.error('Failed to reset webhook logs:', error);
            alert(error.response?.data?.message || t('settings.saveFailed'));
        } finally {
            setResettingWebhookLogs(false);
        }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <>
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>{t('settings.generalSettings')}</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{t('settings.generalSettingsDesc')}</p>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                            {t('settings.systemName')}
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
                            {t('settings.webhookCardUidKey')}
                        </label>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            {t('settings.webhookCardUidKeyDesc')}
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
                            {t('settings.tagThrottleTime')}
                        </label>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            {t('settings.tagThrottleTimeDesc')}
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
                        {t('settings.saveChanges')}
                    </button>
                </div>
            </div>

            {/* Data Management Section */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>{t('settings.dataManagement')}</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{t('settings.dataManagementDesc')}</p>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            <div>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.25rem' }}>{t('settings.resetTagEvents')}</h3>
                                <p style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{t('settings.resetTagEventsDesc')}</p>
                            </div>
                            <button
                                onClick={handleResetTagEvents}
                                disabled={resettingTagEvents}
                                style={{
                                    backgroundColor: resettingTagEvents ? '#9ca3af' : '#dc2626',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: resettingTagEvents ? 'not-allowed' : 'pointer',
                                    fontWeight: '500',
                                    fontSize: '0.875rem',
                                }}>
                                {resettingTagEvents ? t('settings.resetting') : t('common.reset')}
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '0.5rem', border: '1px solid #fecaca' }}>
                            <div>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991b1b', marginBottom: '0.25rem' }}>{t('settings.resetWebhookLogs')}</h3>
                                <p style={{ fontSize: '0.75rem', color: '#b91c1c' }}>{t('settings.resetWebhookLogsDesc')}</p>
                            </div>
                            <button
                                onClick={handleResetWebhookLogs}
                                disabled={resettingWebhookLogs}
                                style={{
                                    backgroundColor: resettingWebhookLogs ? '#9ca3af' : '#dc2626',
                                    color: 'white',
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: resettingWebhookLogs ? 'not-allowed' : 'pointer',
                                    fontWeight: '500',
                                    fontSize: '0.875rem',
                                }}>
                                {resettingWebhookLogs ? t('settings.resetting') : t('common.reset')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

