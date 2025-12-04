'use client';

import { useState, useEffect } from 'react';
import { webhookService, Webhook, CreateWebhookDto } from '../../../services/webhook.service';
import { WebhookList } from './components/WebhookList';
import { WebhookForm } from './components/WebhookForm';
import { GeneralSettings } from './components/GeneralSettings';
import { useTranslation } from '../../../lib/i18n';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const data = await webhookService.getAllWebhooks();
      setWebhooks(data);
    } catch (error) {
      console.error('Failed to load webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWebhook(null);
    setShowModal(true);
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setShowModal(true);
  };

  const handleSubmit = async (data: CreateWebhookDto) => {
    try {
      if (editingWebhook) {
        await webhookService.updateWebhook(editingWebhook.id, data);
      } else {
        await webhookService.createWebhook(data);
      }
      setShowModal(false);
      loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || t('settings.saveWebhookFailed'));
    }
  };

  const handleDelete = async (webhook: Webhook) => {
    if (confirm(t('settings.confirmDeleteWebhook', { name: webhook.name }))) {
      try {
        await webhookService.deleteWebhook(webhook.id);
        loadWebhooks();
      } catch (error) {
        alert(t('settings.deleteWebhookFailed'));
      }
    }
  };

  const handleTest = async (webhook: Webhook) => {
    try {
      await webhookService.testWebhook(webhook.id);
      alert(t('settings.webhookTestSuccess'));
    } catch (error: any) {
      alert(error.response?.data?.message || t('settings.webhookTestFailed'));
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>{t('common.loading')}</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        {t('settings.title')}
      </h1>

      {/* Webhook Configuration Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>{t('settings.webhookConfig')}</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{t('settings.webhookConfigDesc')}</p>
          </div>
          <button
            onClick={handleCreate}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            {t('settings.addWebhook')}
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          <WebhookList
            webhooks={webhooks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTest={handleTest}
          />
        </div>
      </div>

      {/* General Settings Section */}
      <GeneralSettings />

      {/* Webhook Modal */}
      {showModal && (
        <WebhookForm
          webhook={editingWebhook}
          onSubmit={handleSubmit}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

