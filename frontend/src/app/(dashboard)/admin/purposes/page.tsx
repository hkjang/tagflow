'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../../../../lib/i18n';
import { purposeService, TagPurpose, PurposeStats } from '../../../../services/purpose.service';
import Link from 'next/link';

const PURPOSE_TYPES = [
    { value: 'ATTENDANCE', label: '교육 출결', icon: '📚' },
    { value: 'ACCESS', label: '출입 관리', icon: '🚪' },
    { value: 'FACILITY', label: '시설 이용', icon: '🏢' },
    { value: 'RESERVATION', label: '예약 관리', icon: '📅' },
];

export default function PurposesAdminPage() {
    const { t } = useTranslation();
    const [purposes, setPurposes] = useState<TagPurpose[]>([]);
    const [stats, setStats] = useState<PurposeStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPurpose, setEditingPurpose] = useState<TagPurpose | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'ATTENDANCE' as TagPurpose['type'],
        description: '',
        is_active: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [purposesData, statsData] = await Promise.all([
                purposeService.getAllPurposes(),
                purposeService.getAllStats(),
            ]);
            setPurposes(purposesData);
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch purposes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await purposeService.createPurpose(formData);
            setShowCreateModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to create purpose:', error);
        }
    };

    const handleUpdate = async () => {
        if (!editingPurpose) return;
        try {
            await purposeService.updatePurpose(editingPurpose.id, formData);
            setEditingPurpose(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Failed to update purpose:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await purposeService.deletePurpose(id);
            fetchData();
        } catch (error) {
            console.error('Failed to delete purpose:', error);
        }
    };

    const handleToggleActive = async (purpose: TagPurpose) => {
        try {
            await purposeService.updatePurpose(purpose.id, { is_active: !purpose.is_active });
            fetchData();
        } catch (error) {
            console.error('Failed to toggle purpose:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'ATTENDANCE',
            description: '',
            is_active: true,
        });
    };

    const openEditModal = (purpose: TagPurpose) => {
        setFormData({
            name: purpose.name,
            type: purpose.type,
            description: purpose.description || '',
            is_active: purpose.is_active,
        });
        setEditingPurpose(purpose);
    };

    const getTypeInfo = (type: string) => {
        return PURPOSE_TYPES.find(t => t.value === type) || { label: type, icon: '📋' };
    };

    const getStatForPurpose = (purposeId: number) => {
        return stats.find(s => s.purpose_id === purposeId);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div>로딩 중...</div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
                    태그 목적 관리
                </h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500',
                    }}
                >
                    + 새 목적 추가
                </button>
            </div>

            {/* Guide Section */}
            <div style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem',
            }}>
                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
                    💡 <strong>태그 목적</strong>은 태그 이벤트의 용도를 구분하고, 목적별로 추가 정보를 수집할 수 있게 합니다.
                    목적을 클릭하여 필드 설정, 웹훅 연결, 규칙 등을 관리하세요.
                    <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#3b82f6' }}>
                        ✓ 활성화된 목적만 스캔 페이지에 표시됩니다 &nbsp;|&nbsp;
                        ✓ 가장 최근 등록된 활성 목적이 기본 선택됩니다
                    </span>
                </p>
            </div>

            {/* Purpose List */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {purposes.length === 0 ? (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#6b7280',
                    }}>
                        등록된 태그 목적이 없습니다. 새 목적을 추가해주세요.
                    </div>
                ) : (
                    purposes.map(purpose => {
                        const typeInfo = getTypeInfo(purpose.type);
                        const stat = getStatForPurpose(purpose.id);

                        return (
                            <div
                                key={purpose.id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    padding: '1.5rem',
                                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                    border: purpose.is_active ? '2px solid #10b981' : '2px solid #d1d5db',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '1.5rem' }}>{typeInfo.icon}</span>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                                                {purpose.name}
                                            </h3>
                                            <span style={{
                                                backgroundColor: purpose.is_active ? '#d1fae5' : '#f3f4f6',
                                                color: purpose.is_active ? '#065f46' : '#6b7280',
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '500',
                                            }}>
                                                {purpose.is_active ? '활성' : '비활성'}
                                            </span>
                                        </div>
                                        <div style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                            {typeInfo.label}
                                        </div>
                                        {purpose.description && (
                                            <p style={{ color: '#4b5563', fontSize: '0.875rem' }}>
                                                {purpose.description}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        {stat && (
                                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                                                <div>
                                                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>오늘</span>
                                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{stat.events_today}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>이번 주</span>
                                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{stat.events_this_week}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>이번 달</span>
                                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{stat.events_this_month}</div>
                                                </div>
                                                <div>
                                                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>전체</span>
                                                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{stat.total_events}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link
                                            href={`/admin/purposes/detail?id=${purpose.id}`}
                                            style={{
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.375rem',
                                                textDecoration: 'none',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            상세 설정
                                        </Link>
                                        <button
                                            onClick={() => openEditModal(purpose)}
                                            style={{
                                                backgroundColor: '#f3f4f6',
                                                color: '#374151',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(purpose)}
                                            style={{
                                                backgroundColor: purpose.is_active ? '#fef3c7' : '#d1fae5',
                                                color: purpose.is_active ? '#92400e' : '#065f46',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {purpose.is_active ? '비활성화' : '활성화'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(purpose.id)}
                                            style={{
                                                backgroundColor: '#fee2e2',
                                                color: '#991b1b',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '0.375rem',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingPurpose) && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        padding: '2rem',
                        width: '100%',
                        maxWidth: '500px',
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                            {editingPurpose ? '목적 수정' : '새 목적 추가'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    목적 이름 *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                    }}
                                    placeholder="예: 오전 교육 출결"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    목적 유형 *
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as TagPurpose['type'] })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                    }}
                                >
                                    {PURPOSE_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    설명
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.375rem',
                                        minHeight: '80px',
                                    }}
                                    placeholder="목적에 대한 설명을 입력하세요"
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <label htmlFor="is_active">활성화</label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingPurpose(null);
                                    resetForm();
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={editingPurpose ? handleUpdate : handleCreate}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    cursor: 'pointer',
                                }}
                            >
                                {editingPurpose ? '수정' : '생성'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
