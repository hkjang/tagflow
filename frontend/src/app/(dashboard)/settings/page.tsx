'use client';

import { useState, useEffect } from 'react';
import { webhookService, Webhook, CreateWebhookDto } from '../../../services/webhook.service';

export default function SettingsPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState<CreateWebhookDto>({
    name: '',
    url: '',
    method: 'POST',
    headers: '',
    is_active: true,
  });

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
    setFormData({ name: '', url: '', method: 'POST', headers: '', is_active: true });
    setShowModal(true);
  };

  const handleEdit = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      method: webhook.method,
      headers: webhook.headers || '',
      is_active: webhook.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingWebhook) {
        await webhookService.updateWebhook(editingWebhook.id, formData);
      } else {
        await webhookService.createWebhook(formData);
      }
      setShowModal(false);
      loadWebhooks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save webhook');
    }
  };

  const handleDelete = async (webhook: Webhook) => {
    if (confirm(`Are you sure you want to delete webhook "${webhook.name}"?`)) {
      try {
        await webhookService.deleteWebhook(webhook.id);
        loadWebhooks();
      } catch (error) {
        alert('Failed to delete webhook');
      }
    }
  };

  const handleTest = async (webhook: Webhook) => {
    try {
      await webhookService.testWebhook(webhook.id);
      alert('Webhook test successful! Check the webhook logs for details.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Webhook test failed');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        Settings
      </h1>

      {/* Webhook Configuration Section */}
      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Webhook Configuration</h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Configure webhooks to send RFID tag events to external systems.</p>
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
            Add Webhook
          </button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {webhooks.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No webhooks configured.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>URL</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Method</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((webhook) => (
                  <tr key={webhook.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#1f2937', fontWeight: '500' }}>{webhook.name}</td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{webhook.url}</td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {webhook.method}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem' }}>
                      <span style={{
                        backgroundColor: webhook.is_active ? '#d1fae5' : '#fee2e2',
                        color: webhook.is_active ? '#065f46' : '#991b1b',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {webhook.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', textAlign: 'right', fontSize: '0.875rem', fontWeight: '500' }}>
                      <button
                        onClick={() => handleTest(webhook)}
                        style={{ color: '#059669', border: 'none', background: 'none', cursor: 'pointer', marginRight: '1rem' }}
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleEdit(webhook)}
                        style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', marginRight: '1rem' }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(webhook)}
                        style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* General Settings Section */}
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

      {/* Webhook Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., ERP Integration"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  placeholder="https://example.com/api/webhook"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  HTTP Method
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                  }}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Headers (JSON format, optional)
                </label>
                <textarea
                  value={formData.headers}
                  onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                  placeholder='{"Authorization": "Bearer token123"}'
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Active</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                  }}
                >
                  {editingWebhook ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
