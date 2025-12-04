'use client';

import { useTranslation } from '../lib/i18n';

export default function LanguageSwitcher() {
    const { locale, setLocale, t } = useTranslation();

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>🌐</span>
            <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as 'ko' | 'en')}
                style={{
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    border: '1px solid #374151',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    outline: 'none',
                }}
            >
                <option value="ko" style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    {t('language.korean')}
                </option>
                <option value="en" style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    {t('language.english')}
                </option>
            </select>
        </div>
    );
}
