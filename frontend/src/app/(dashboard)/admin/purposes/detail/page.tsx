'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    purposeService,
    TagPurpose,
    PurposeField,
    PurposeWebhook,
    PurposeRule,
    PurposeFollowup,
    PurposeStats,
} from '../../../../../services/purpose.service';
import { webhookService, Webhook } from '../../../../../services/webhook.service';

const FIELD_TYPES = [
    { value: 'string', label: '문자열' },
    { value: 'number', label: '숫자' },
    { value: 'date', label: '날짜' },
    { value: 'select', label: '선택' },
];

const RULE_TYPES = [
    { value: 'TIME_WINDOW', label: '시간대 규칙' },
    { value: 'USER_GROUP', label: '사용자 그룹' },
    { value: 'DUPLICATE_POLICY', label: '중복 정책' },
];

const ACTION_TYPES = [
    { value: 'NOTIFICATION', label: '알림' },
    { value: 'APPROVAL', label: '승인 요청' },
    { value: 'API_CALL', label: '외부 API 호출' },
];

export default function PurposeDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const purposeId = Number(searchParams.get('id'));

    const [purpose, setPurpose] = useState<TagPurpose | null>(null);
    const [fields, setFields] = useState<PurposeField[]>([]);
    const [webhooks, setWebhooks] = useState<PurposeWebhook[]>([]);
    const [rules, setRules] = useState<PurposeRule[]>([]);
    const [followups, setFollowups] = useState<PurposeFollowup[]>([]);
    const [stats, setStats] = useState<PurposeStats | null>(null);
    const [availableWebhooks, setAvailableWebhooks] = useState<Webhook[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'fields' | 'webhooks' | 'rules' | 'followups'>('fields');

    // Modal states
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [showFollowupModal, setShowFollowupModal] = useState(false);

    // Form states
    const [fieldForm, setFieldForm] = useState({
        field_name: '',
        field_label: '',
        field_type: 'string' as PurposeField['field_type'],
        is_required: false,
        default_value: '',
        options: '',
    });
    const [editingField, setEditingField] = useState<PurposeField | null>(null);

    const [webhookForm, setWebhookForm] = useState({
        webhook_id: 0,
        field_mappings: '{}',
    });

    const [ruleForm, setRuleForm] = useState({
        rule_type: 'DUPLICATE_POLICY' as PurposeRule['rule_type'],
        rule_config: '{"window_minutes": 5, "allow_duplicate": false}',
    });

    const [followupForm, setFollowupForm] = useState({
        action_type: 'NOTIFICATION' as PurposeFollowup['action_type'],
        action_config: '{"message_template": "태그가 등록되었습니다."}',
    });

    useEffect(() => {
        if (purposeId) {
            fetchData();
        }
    }, [purposeId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [purposeData, fieldsData, webhooksData, rulesData, followupsData, statsData, webhooksList] = await Promise.all([
                purposeService.getPurposeById(purposeId),
                purposeService.getFields(purposeId),
                purposeService.getWebhooks(purposeId),
                purposeService.getRules(purposeId),
                purposeService.getFollowups(purposeId),
                purposeService.getPurposeStats(purposeId),
                webhookService.getAllWebhooks(),
            ]);
            setPurpose(purposeData);
            setFields(fieldsData);
            setWebhooks(webhooksData);
            setRules(rulesData);
            setFollowups(followupsData);
            setStats(statsData);
            setAvailableWebhooks(webhooksList);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Field handlers
    const handleOpenFieldModal = (field?: PurposeField) => {
        if (field) {
            setEditingField(field);
            setFieldForm({
                field_name: field.field_name,
                field_label: field.field_label,
                field_type: field.field_type,
                is_required: field.is_required,
                default_value: field.default_value || '',
                options: field.options?.join(', ') || '',
            });
        } else {
            setEditingField(null);
            setFieldForm({ field_name: '', field_label: '', field_type: 'string', is_required: false, default_value: '', options: '' });
        }
        setShowFieldModal(true);
    };

    const handleCloseFieldModal = () => {
        setShowFieldModal(false);
        setEditingField(null);
        setFieldForm({ field_name: '', field_label: '', field_type: 'string', is_required: false, default_value: '', options: '' });
    };

    const handleCreateField = async () => {
        try {
            await purposeService.createField(purposeId, {
                ...fieldForm,
                options: fieldForm.options ? fieldForm.options.split(',').map(s => s.trim()) : undefined,
            });
            handleCloseFieldModal();
            fetchData();
        } catch (error) {
            console.error('Failed to create field:', error);
        }
    };

    const handleUpdateField = async () => {
        if (!editingField) return;
        try {
            await purposeService.updateField(editingField.id, {
                ...fieldForm,
                options: fieldForm.options ? fieldForm.options.split(',').map(s => s.trim()) : undefined,
            });
            handleCloseFieldModal();
            fetchData();
        } catch (error) {
            console.error('Failed to update field:', error);
        }
    };

    const handleSaveField = async () => {
        if (editingField) {
            await handleUpdateField();
        } else {
            await handleCreateField();
        }
    };

    const handleDeleteField = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await purposeService.deleteField(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete field:', error);
        }
    };

    // Webhook handlers
    const handleCreateWebhook = async () => {
        try {
            await purposeService.createWebhook(purposeId, {
                webhook_id: webhookForm.webhook_id,
                field_mappings: JSON.parse(webhookForm.field_mappings),
            });
            setShowWebhookModal(false);
            setWebhookForm({ webhook_id: 0, field_mappings: '{}' });
            fetchData();
        } catch (error) {
            console.error('Failed to create webhook:', error);
        }
    };

    const handleDeleteWebhook = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await purposeService.deleteWebhook(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete webhook:', error);
        }
    };

    // Rule handlers
    const handleCreateRule = async () => {
        try {
            await purposeService.createRule(purposeId, {
                rule_type: ruleForm.rule_type,
                rule_config: JSON.parse(ruleForm.rule_config),
            });
            setShowRuleModal(false);
            setRuleForm({ rule_type: 'DUPLICATE_POLICY', rule_config: '{"window_minutes": 5, "allow_duplicate": false}' });
            fetchData();
        } catch (error) {
            console.error('Failed to create rule:', error);
        }
    };

    const handleDeleteRule = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await purposeService.deleteRule(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete rule:', error);
        }
    };

    // Followup handlers
    const handleCreateFollowup = async () => {
        try {
            await purposeService.createFollowup(purposeId, {
                action_type: followupForm.action_type,
                action_config: JSON.parse(followupForm.action_config),
            });
            setShowFollowupModal(false);
            setFollowupForm({ action_type: 'NOTIFICATION', action_config: '{"message_template": "태그가 등록되었습니다."}' });
            fetchData();
        } catch (error) {
            console.error('Failed to create followup:', error);
        }
    };

    const handleDeleteFollowup = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await purposeService.deleteFollowup(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete followup:', error);
        }
    };

    const getWebhookName = (webhookId: number) => {
        const wh = availableWebhooks.find(w => w.id === webhookId);
        return wh?.name || `Webhook #${webhookId}`;
    };

    if (!purposeId) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div>잘못된 접근입니다.</div>
            </div>
        );
    }

    if (loading || !purpose) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <button
                        onClick={() => router.push('/admin/purposes')}
                        style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '0.5rem' }}
                    >
                        ← 목록으로
                    </button>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
                        {purpose.name}
                    </h1>
                    <p style={{ color: '#6b7280' }}>{purpose.description}</p>
                </div>
                {stats && (
                    <div style={{ display: 'flex', gap: '1.5rem', backgroundColor: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.events_today}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>오늘</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.events_this_week}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>이번 주</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{stats.total_events}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>전체</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
                {[
                    { key: 'fields', label: '필드 설정', count: fields.length },
                    { key: 'webhooks', label: '웹훅 연결', count: webhooks.length },
                    { key: 'rules', label: '규칙 설정', count: rules.length },
                    { key: 'followups', label: '후속 처리', count: followups.length },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: activeTab === tab.key ? '#3b82f6' : 'transparent',
                            color: activeTab === tab.key ? 'white' : '#6b7280',
                            border: 'none',
                            borderRadius: '0.375rem 0.375rem 0 0',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Fields Tab */}
            {activeTab === 'fields' && (
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>목적별 필드</h2>
                        <button
                            onClick={() => handleOpenFieldModal()}
                            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                        >
                            + 필드 추가
                        </button>
                    </div>

                    {/* Guide */}
                    <div style={{ backgroundColor: '#f0fdf4', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#166534' }}>
                        💡 필드는 스캔 페이지에서 목적 선택 시 표시됩니다. 필드명(영문)은 웹훅 전송 시 키로 사용되며, purpose_data.필드명 또는 필드명으로 매핑할 수 있습니다.
                    </div>

                    {fields.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            등록된 필드가 없습니다.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>필드명</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>라벨</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>타입</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>필수</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>기본값</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fields.map(field => (
                                    <tr key={field.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{field.field_name}</td>
                                        <td style={{ padding: '0.75rem' }}>{field.field_label}</td>
                                        <td style={{ padding: '0.75rem' }}>{FIELD_TYPES.find(t => t.value === field.field_type)?.label}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>{field.is_required ? '✓' : ''}</td>
                                        <td style={{ padding: '0.75rem' }}>{field.default_value || '-'}</td>
                                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleOpenFieldModal(field)}
                                                style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', marginRight: '0.5rem' }}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteField(field.id)}
                                                style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>연결된 웹훅</h2>
                        <button
                            onClick={() => setShowWebhookModal(true)}
                            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                        >
                            + 웹훅 연결
                        </button>
                    </div>

                    {/* Guide */}
                    <div style={{ backgroundColor: '#fdf4ff', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#7e22ce' }}>
                        💡 여기에 연결된 웹훅은 이 목적의 태그 이벤트 발생 시 자동 호출됩니다. 웹훅은 설정 페이지에서 먼저 등록해야 합니다.
                    </div>

                    {webhooks.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            연결된 웹훅이 없습니다.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {webhooks.map(pw => (
                                <div key={pw.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h3 style={{ fontWeight: '600' }}>{getWebhookName(pw.webhook_id)}</h3>
                                            {pw.field_mappings && (
                                                <pre style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                                    {JSON.stringify(pw.field_mappings, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteWebhook(pw.id)}
                                            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Rules Tab */}
            {activeTab === 'rules' && (
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>태그 규칙</h2>
                        <button
                            onClick={() => setShowRuleModal(true)}
                            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                        >
                            + 규칙 추가
                        </button>
                    </div>

                    {/* Guide */}
                    <div style={{ backgroundColor: '#fefce8', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#854d0e' }}>
                        💡 규칙으로 태그 이벤트 처리 방식을 설정합니다. 중복 정책(window_minutes)으로 짧은 시간 내 중복 태그를 억제할 수 있습니다.
                    </div>

                    {rules.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            등록된 규칙이 없습니다.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {rules.map(rule => (
                                <div key={rule.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontWeight: '600' }}>{RULE_TYPES.find(t => t.value === rule.rule_type)?.label}</h3>
                                            <pre style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                                {JSON.stringify(rule.rule_config, null, 2)}
                                            </pre>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRule(rule.id)}
                                            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Followups Tab */}
            {activeTab === 'followups' && (
                <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>후속 처리</h2>
                        <button
                            onClick={() => setShowFollowupModal(true)}
                            style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
                        >
                            + 후속 처리 추가
                        </button>
                    </div>

                    {/* Guide */}
                    <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#991b1b' }}>
                        💡 후속 처리는 태그 이벤트 등록 후 추가 작업을 수행합니다. 알림, 승인 요청, 외부 API 호출 등을 설정할 수 있습니다.
                    </div>

                    {followups.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            등록된 후속 처리가 없습니다.
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {followups.map(followup => (
                                <div key={followup.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', padding: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontWeight: '600' }}>{ACTION_TYPES.find(t => t.value === followup.action_type)?.label}</h3>
                                            <pre style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem' }}>
                                                {JSON.stringify(followup.action_config, null, 2)}
                                            </pre>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteFollowup(followup.id)}
                                            style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Field Modal */}
            {showFieldModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>{editingField ? '필드 수정' : '필드 추가'}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>필드명 (영문) *</label>
                                <input type="text" value={fieldForm.field_name} onChange={e => setFieldForm({ ...fieldForm, field_name: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} placeholder="예: lecture_id" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>라벨 (표시명) *</label>
                                <input type="text" value={fieldForm.field_label} onChange={e => setFieldForm({ ...fieldForm, field_label: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} placeholder="예: 강의 ID" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>타입 *</label>
                                <select value={fieldForm.field_type} onChange={e => setFieldForm({ ...fieldForm, field_type: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input type="checkbox" id="is_required" checked={fieldForm.is_required} onChange={e => setFieldForm({ ...fieldForm, is_required: e.target.checked })} />
                                <label htmlFor="is_required">필수 필드</label>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>기본값</label>
                                <input type="text" value={fieldForm.default_value} onChange={e => setFieldForm({ ...fieldForm, default_value: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} />
                            </div>
                            {fieldForm.field_type === 'select' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>옵션 (쉼표 구분)</label>
                                    <input type="text" value={fieldForm.options} onChange={e => setFieldForm({ ...fieldForm, options: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }} placeholder="옵션1, 옵션2, 옵션3" />
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button onClick={handleCloseFieldModal} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>취소</button>
                            <button onClick={handleSaveField} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>{editingField ? '저장' : '추가'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Webhook Modal */}
            {showWebhookModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>웹훅 연결</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>웹훅 선택 *</label>
                                <select value={webhookForm.webhook_id} onChange={e => setWebhookForm({ ...webhookForm, webhook_id: Number(e.target.value) })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                                    <option value={0}>웹훅을 선택하세요</option>
                                    {availableWebhooks.map(wh => <option key={wh.id} value={wh.id}>{wh.name} ({wh.target_url})</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>필드 매핑 (JSON)</label>
                                <textarea value={webhookForm.field_mappings} onChange={e => setWebhookForm({ ...webhookForm, field_mappings: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '100px', fontFamily: 'monospace' }} placeholder='{"lecture_id": "lectureId"}' />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowWebhookModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>취소</button>
                            <button onClick={handleCreateWebhook} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>연결</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rule Modal */}
            {showRuleModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>규칙 추가</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>규칙 유형 *</label>
                                <select value={ruleForm.rule_type} onChange={e => setRuleForm({ ...ruleForm, rule_type: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                                    {RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>규칙 설정 (JSON) *</label>
                                <textarea value={ruleForm.rule_config} onChange={e => setRuleForm({ ...ruleForm, rule_config: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '100px', fontFamily: 'monospace' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowRuleModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>취소</button>
                            <button onClick={handleCreateRule} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>추가</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Followup Modal */}
            {showFollowupModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>후속 처리 추가</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>액션 유형 *</label>
                                <select value={followupForm.action_type} onChange={e => setFollowupForm({ ...followupForm, action_type: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}>
                                    {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>액션 설정 (JSON) *</label>
                                <textarea value={followupForm.action_config} onChange={e => setFollowupForm({ ...followupForm, action_config: e.target.value })} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minHeight: '100px', fontFamily: 'monospace' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowFollowupModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>취소</button>
                            <button onClick={handleCreateFollowup} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer' }}>추가</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
