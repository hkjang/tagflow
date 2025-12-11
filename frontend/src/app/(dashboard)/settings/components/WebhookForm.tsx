import React, { useState, useEffect } from 'react';
import { CreateWebhookDto, Webhook, WebhookMapping, webhookService } from '../../../../services/webhook.service';

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
    const [mappings, setMappings] = useState<WebhookMapping[]>([]);
    const [newMapping, setNewMapping] = useState({ from_key: '', to_key: '' });
    const [loadingMappings, setLoadingMappings] = useState(false);

    useEffect(() => {
        if (webhook) {
            setFormData({
                name: webhook.name,
                target_url: webhook.target_url,
                http_method: webhook.http_method,
                headers: webhook.headers ? JSON.stringify(webhook.headers, null, 2) : '',
                is_active: webhook.is_active,
            });
            fetchMappings(webhook.id);
        } else {
            setFormData({
                name: '',
                target_url: '',
                http_method: 'POST',
                headers: '',
                is_active: true,
            });
            setMappings([]);
        }
    }, [webhook]);

    const fetchMappings = async (webhookId: number) => {
        try {
            setLoadingMappings(true);
            const data = await webhookService.getMappings(webhookId);
            setMappings(data);
        } catch (error) {
            console.error('Failed to fetch mappings:', error);
        } finally {
            setLoadingMappings(false);
        }
    };

    const handleAddMapping = async () => {
        if (!webhook || !newMapping.from_key || !newMapping.to_key) return;

        try {
            await webhookService.createMapping(webhook.id, newMapping.from_key, newMapping.to_key);
            setNewMapping({ from_key: '', to_key: '' });
            fetchMappings(webhook.id);
        } catch (error) {
            alert('Failed to create mapping');
        }
    };

    const handleDeleteMapping = async (id: number) => {
        if (!confirm('Are you sure you want to delete this mapping?')) return;

        try {
            await webhookService.deleteMapping(id);
            if (webhook) fetchMappings(webhook.id);
        } catch (error) {
            alert('Failed to delete mapping');
        }
    };

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

                    {/* Parameter Mappings Section */}
                    {webhook && (
                        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Parameter Mappings</h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                                Map internal parameter keys to different keys for this webhook.
                            </p>

                            {loadingMappings ? (
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loading mappings...</p>
                            ) : (
                                <div style={{ marginBottom: '1rem' }}>
                                    {mappings.length === 0 ? (
                                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', fontStyle: 'italic' }}>No mappings configured.</p>
                                    ) : (
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {mappings.map(mapping => (
                                                <li key={mapping.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                                                    <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                                        {mapping.from_key} <span style={{ color: '#9ca3af' }}>→</span> {mapping.to_key}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMapping(mapping.id)}
                                                        style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                                                    >
                                                        Delete
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                                    <input
                                        type="text"
                                        list="fromKeyOptions"
                                        placeholder="From Key 선택 또는 직접 입력"
                                        value={newMapping.from_key}
                                        onChange={(e) => setNewMapping({ ...newMapping, from_key: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.375rem',
                                            fontSize: '0.875rem',
                                        }}
                                    />
                                    <datalist id="fromKeyOptions">
                                        <optgroup label="기본 필드">
                                            <option value="card_uid" />
                                            <option value="event_time" />
                                            <option value="source_ip" />
                                            <option value="system_name" />
                                        </optgroup>
                                        <optgroup label="목적 관련 필드">
                                            <option value="purpose_id" />
                                            <option value="purpose_data" />
                                        </optgroup>
                                        <optgroup label="목적 데이터 필드">
                                            <option value="purpose_data.lecture_id" />
                                            <option value="purpose_data.room" />
                                            <option value="purpose_data.subject" />
                                            <option value="purpose_data.facility_id" />
                                            <option value="purpose_data.edu_id" />
                                        </optgroup>
                                        <optgroup label="평탄화된 필드">
                                            <option value="lecture_id" />
                                            <option value="room" />
                                            <option value="subject" />
                                            <option value="facility_id" />
                                            <option value="edu_id" />
                                        </optgroup>
                                    </datalist>
                                </div>
                                <input
                                    type="text"
                                    placeholder="To Key (e.g. tag_id)"
                                    value={newMapping.to_key}
                                    onChange={(e) => setNewMapping({ ...newMapping, to_key: e.target.value })}
                                    style={{ flex: 1, minWidth: '150px', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddMapping}
                                    disabled={!newMapping.from_key || !newMapping.to_key}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        opacity: (!newMapping.from_key || !newMapping.to_key) ? 0.5 : 1,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                                💡 목록에서 선택하거나 직접 입력할 수 있습니다. (예: edu_id, custom_field)
                            </p>
                        </div>
                    )}
                    {!webhook && (
                        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                                Save the webhook first to configure parameter mappings.
                            </p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
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
