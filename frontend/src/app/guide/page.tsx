'use client';

import { useTranslation } from '../../lib/i18n';
import Link from 'next/link';

export default function GuidePage() {
    const { t } = useTranslation();

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f3f4f6',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '2rem',
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                marginBottom: '0.5rem',
                            }}>
                                {t('guide.title')}
                            </h1>
                            <p style={{ color: '#6b7280' }}>{t('guide.subtitle')}</p>
                        </div>
                        <Link href="/login" style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            borderRadius: '0.375rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                        }}>
                            {t('guide.backToLogin')}
                        </Link>
                    </div>
                </div>

                {/* Overview Section */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        📋 {t('guide.overview.title')}
                    </h2>
                    <p style={{ color: '#374151', lineHeight: '1.75' }}>
                        {t('guide.overview.description')}
                    </p>
                </div>

                {/* Features Section */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        ✨ {t('guide.features.title')}
                    </h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {/* Dashboard Feature */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '0.5rem',
                            borderLeft: '4px solid #2563eb',
                        }}>
                            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                                {t('guide.features.dashboard.title')}
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                                {t('guide.features.dashboard.description')}
                            </p>
                        </div>

                        {/* Tag Input Feature */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '0.5rem',
                            borderLeft: '4px solid #16a34a',
                        }}>
                            <h3 style={{ fontWeight: '600', color: '#166534', marginBottom: '0.5rem' }}>
                                {t('guide.features.tagInput.title')}
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                                {t('guide.features.tagInput.description')}
                            </p>
                        </div>

                        {/* Reports Feature */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#fefce8',
                            borderRadius: '0.5rem',
                            borderLeft: '4px solid #ca8a04',
                        }}>
                            <h3 style={{ fontWeight: '600', color: '#854d0e', marginBottom: '0.5rem' }}>
                                {t('guide.features.reports.title')}
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                                {t('guide.features.reports.description')}
                            </p>
                        </div>

                        {/* Webhook Feature */}
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#fdf4ff',
                            borderRadius: '0.5rem',
                            borderLeft: '4px solid #a855f7',
                        }}>
                            <h3 style={{ fontWeight: '600', color: '#7e22ce', marginBottom: '0.5rem' }}>
                                {t('guide.features.webhook.title')}
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                                {t('guide.features.webhook.description')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Getting Started Section */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        🚀 {t('guide.gettingStarted.title')}
                    </h2>
                    <ol style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: '0.75rem',
                    }}>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                flexShrink: 0,
                            }}>1</span>
                            <span style={{ color: '#374151' }}>{t('guide.gettingStarted.step1')}</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                flexShrink: 0,
                            }}>2</span>
                            <span style={{ color: '#374151' }}>{t('guide.gettingStarted.step2')}</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                flexShrink: 0,
                            }}>3</span>
                            <span style={{ color: '#374151' }}>{t('guide.gettingStarted.step3')}</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                borderRadius: '50%',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                flexShrink: 0,
                            }}>4</span>
                            <span style={{ color: '#374151' }}>{t('guide.gettingStarted.step4')}</span>
                        </li>
                    </ol>
                </div>

                {/* User Roles Section */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '1.5rem',
                    marginBottom: '1.5rem',
                }}>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}>
                        👥 {t('guide.roles.title')}
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem',
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>
                                        {t('guide.roles.role')}
                                    </th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>
                                        {t('guide.roles.permissions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#fee2e2',
                                            color: '#991b1b',
                                            borderRadius: '0.25rem',
                                            fontWeight: '500',
                                        }}>Admin</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                                        {t('guide.roles.adminDesc')}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '0.25rem',
                                            fontWeight: '500',
                                        }}>Operator</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                                        {t('guide.roles.operatorDesc')}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#dcfce7',
                                            color: '#166534',
                                            borderRadius: '0.25rem',
                                            fontWeight: '500',
                                        }}>Viewer</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                                        {t('guide.roles.viewerDesc')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Help Section */}
                <div style={{
                    backgroundColor: '#eff6ff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: '1px solid #bfdbfe',
                }}>
                    <h2 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1e40af',
                        marginBottom: '0.5rem',
                    }}>
                        💬 {t('guide.help.title')}
                    </h2>
                    <p style={{ color: '#3b82f6', fontSize: '0.875rem' }}>
                        {t('guide.help.description')}
                    </p>
                </div>
            </div>
        </div>
    );
}
