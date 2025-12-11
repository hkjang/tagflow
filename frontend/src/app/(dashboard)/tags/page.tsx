'use client';

import { useTranslation } from '../../../lib/i18n';
import Link from 'next/link';

export default function TagsPage() {
  const { t } = useTranslation();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
          {t('tags.title')}
        </h1>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            {t('tags.autoRegistration')}
          </h2>
          <p style={{ color: '#6b7280', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {t('tags.description')}
          </p>
          <div style={{ backgroundColor: '#f3f4f6', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem' }}>
              {t('tags.howItWorks')}
            </h3>
            <ul style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
              <li>{t('tags.step1')}</li>
              <li>{t('tags.step2')}</li>
              <li>{t('tags.step3')}</li>
              <li>{t('tags.step4')}</li>
            </ul>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '1.5rem' }}>
            {t('tags.viewReports').split(t('tags.reports'))[0]}
            <Link href="/reports" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
              {t('tags.reports')}
            </Link>
            {t('tags.viewReports').split(t('tags.reports'))[1] || ''}
          </p>
        </div>
      </div>
    </div>
  );
}
