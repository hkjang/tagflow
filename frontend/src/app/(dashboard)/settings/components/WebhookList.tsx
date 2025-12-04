import React from 'react';
import { Webhook } from '../../../../services/webhook.service';

interface WebhookListProps {
    webhooks: Webhook[];
    onEdit: (webhook: Webhook) => void;
    onDelete: (webhook: Webhook) => void;
    onTest: (webhook: Webhook) => void;
}

export const WebhookList: React.FC<WebhookListProps> = ({ webhooks, onEdit, onDelete, onTest }) => {
    if (webhooks.length === 0) {
        return (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>No webhooks configured.</p>
        );
    }

    return (
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
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#6b7280', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{webhook.target_url}</td>
                        <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                            <span style={{ backgroundColor: '#f3f4f6', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                {webhook.http_method}
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
                                onClick={() => onTest(webhook)}
                                style={{ color: '#059669', border: 'none', background: 'none', cursor: 'pointer', marginRight: '1rem' }}
                            >
                                Test
                            </button>
                            <button
                                onClick={() => onEdit(webhook)}
                                style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', marginRight: '1rem' }}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(webhook)}
                                style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
