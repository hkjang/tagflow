import React, { useState, useEffect } from 'react';
import { CreateWebhookDto, Webhook } from '../../../../services/webhook.service';

interface WebhookFormProps {
    webhook: Webhook | null;
    onSubmit: (data: CreateWebhookDto) => Promise<void>;
    onCancel: () => void;
}

export const WebhookForm: React.FC<WebhookFormProps> = ({ webhook, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        target_url: '',
        http_method: 'POST' as 'GET' | 'POST' | 'PUT' | 'DELETE',
        headers: '',
        is_active: true,
    });

    useEffect(() => {
        if (webhook) {
            setFormData({
                name: webhook.name,
                target_url: webhook.target_url,
                http_method: webhook.http_method,
                headers: webhook.headers ? JSON.stringify(webhook.headers, null, 2) : '',
                is_active: webhook.is_active,
            });
        } else {
            setFormData({
                name: '',
                target_url: '',
                http_method: 'POST',
                headers: '',
                is_active: true,
            });
        }
    }, [webhook]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let parsedHeaders = {};
        try {
            if (formData.headers.trim()) {
                parsedHeaders = JSON.parse(formData.headers);
            }
        } catch (e) {
            alert('Invalid JSON in headers');
            return;
        }

        const payload: CreateWebhookDto = {
            name: formData.name,
            target_url: formData.target_url,
            http_method: formData.http_method,
            headers: parsedHeaders,
            is_active: formData.is_active,
        };

        await onSubmit(payload);
    };

    return (
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
                    {webhook ? 'Edit Webhook' : 'Create Webhook'}
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
                            value={formData.target_url}
                            onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
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
                            value={formData.http_method}
                            onChange={(e) => setFormData({ ...formData, http_method: e.target.value as any })}
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
                            onClick={onCancel}
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
                            {webhook ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
