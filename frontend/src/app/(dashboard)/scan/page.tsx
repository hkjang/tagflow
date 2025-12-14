'use client';

import { useState, useRef, useEffect } from 'react';
import apiClient from '../../../services/api.service';
import { useTranslation } from '../../../lib/i18n';
import { purposeService, TagPurpose, PurposeField } from '../../../services/purpose.service';

const SESSION_STORAGE_KEYS = {
    SELECTED_PURPOSE_ID: 'tagflow_scan_purpose_id',
    PURPOSE_DATA: 'tagflow_scan_purpose_data',
};

interface TagEvent {
    id: number;
    card_uid: string;
    event_time: string;
    source_ip: string;
    purpose_id?: number;
}

export default function ScanPage() {
    const { t } = useTranslation();
    const [tagInput, setTagInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [webhookInfo, setWebhookInfo] = useState<{ emp_name: string; flag: string } | null>(null);
    const [recentEvents, setRecentEvents] = useState<TagEvent[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Purpose-related states
    const [purposes, setPurposes] = useState<TagPurpose[]>([]);
    const [selectedPurposeId, setSelectedPurposeId] = useState<number | null>(null);
    const [purposeFields, setPurposeFields] = useState<PurposeField[]>([]);
    const [purposeData, setPurposeData] = useState<Record<string, any>>({});
    const [isInitialized, setIsInitialized] = useState(false);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Load saved purpose selection from sessionStorage on mount
    useEffect(() => {
        try {
            const savedPurposeId = sessionStorage.getItem(SESSION_STORAGE_KEYS.SELECTED_PURPOSE_ID);
            const savedPurposeData = sessionStorage.getItem(SESSION_STORAGE_KEYS.PURPOSE_DATA);

            if (savedPurposeId) {
                setSelectedPurposeId(Number(savedPurposeId));
            }
            if (savedPurposeData) {
                setPurposeData(JSON.parse(savedPurposeData));
            }
        } catch (error) {
            console.error('Failed to load saved purpose data:', error);
        }
        setIsInitialized(true);
    }, []);

    // Fetch recent events and purposes on mount
    useEffect(() => {
        fetchRecentEvents();
        fetchPurposes();
    }, []);

    // Fetch fields when purpose is selected
    useEffect(() => {
        if (selectedPurposeId) {
            fetchPurposeFields(selectedPurposeId);
        } else {
            setPurposeFields([]);
            // Only clear purposeData if user explicitly deselected (not on initial load)
            if (isInitialized) {
                setPurposeData({});
                sessionStorage.removeItem(SESSION_STORAGE_KEYS.PURPOSE_DATA);
            }
        }
    }, [selectedPurposeId]);

    // Save purpose selection to sessionStorage when it changes
    useEffect(() => {
        if (!isInitialized) return;

        if (selectedPurposeId) {
            sessionStorage.setItem(SESSION_STORAGE_KEYS.SELECTED_PURPOSE_ID, String(selectedPurposeId));
        } else {
            sessionStorage.removeItem(SESSION_STORAGE_KEYS.SELECTED_PURPOSE_ID);
        }
    }, [selectedPurposeId, isInitialized]);

    // Save purpose data to sessionStorage when it changes
    useEffect(() => {
        if (!isInitialized) return;

        if (Object.keys(purposeData).length > 0) {
            sessionStorage.setItem(SESSION_STORAGE_KEYS.PURPOSE_DATA, JSON.stringify(purposeData));
        }
    }, [purposeData, isInitialized]);

    const fetchPurposes = async () => {
        try {
            const data = await purposeService.getActivePurposes();
            // Sort by ID descending (newest first)
            const sortedPurposes = [...data].sort((a, b) => b.id - a.id);
            setPurposes(sortedPurposes);

            // Auto-select the most recent active purpose if no saved selection exists
            const savedPurposeId = sessionStorage.getItem(SESSION_STORAGE_KEYS.SELECTED_PURPOSE_ID);
            if (!savedPurposeId && sortedPurposes.length > 0) {
                setSelectedPurposeId(sortedPurposes[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch purposes:', error);
        }
    };

    const fetchPurposeFields = async (purposeId: number) => {
        try {
            const fields = await purposeService.getFields(purposeId);
            setPurposeFields(fields);

            // Only initialize with default values if no saved data exists
            const savedPurposeData = sessionStorage.getItem(SESSION_STORAGE_KEYS.PURPOSE_DATA);
            if (!savedPurposeData || Object.keys(purposeData).length === 0) {
                const initialData: Record<string, any> = {};
                fields.forEach(field => {
                    if (field.default_value) {
                        initialData[field.field_name] = field.default_value;
                    }
                });
                setPurposeData(initialData);
            }
        } catch (error) {
            console.error('Failed to fetch purpose fields:', error);
        }
    };

    const fetchRecentEvents = async () => {
        try {
            const response = await apiClient.get('/events', {
                params: { limit: 10, page: 1 },
            });
            setRecentEvents(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch recent events:', error);
        }
    };

    const handlePurposeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const newPurposeId = value ? Number(value) : null;
        setSelectedPurposeId(newPurposeId);

        // Clear purpose data when changing purpose
        if (newPurposeId !== selectedPurposeId) {
            setPurposeData({});
            sessionStorage.removeItem(SESSION_STORAGE_KEYS.PURPOSE_DATA);
        }
    };

    const handleFieldChange = (fieldName: string, value: any) => {
        setPurposeData(prev => ({ ...prev, [fieldName]: value }));
    };

    const validateRequiredFields = (): boolean => {
        for (const field of purposeFields) {
            if (field.is_required && !purposeData[field.field_name]) {
                setMessage({
                    type: 'error',
                    text: `${field.field_label} 필드는 필수입니다.`,
                });
                return false;
            }
        }
        return true;
    };

    // Mask card UID: show only first and last character, replace middle with asterisks
    const maskCardUid = (uid: string): string => {
        if (!uid || uid.length <= 2) return uid;
        const firstChar = uid.charAt(0);
        const lastChar = uid.charAt(uid.length - 1);
        const middleMask = '*'.repeat(uid.length - 2);
        return `${firstChar}${middleMask}${lastChar}`;
    };

    // Korean keyboard to English mapping (for when Korean input is accidentally used)
    const koreanToEnglish: Record<string, string> = {
        'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't', 'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
        'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g', 'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
        'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v', 'ㅠ': 'b', 'ㅜ': 'n', 'ㅡ': 'm',
        'ㅃ': 'Q', 'ㅉ': 'W', 'ㄸ': 'E', 'ㄲ': 'R', 'ㅆ': 'T', 'ㅒ': 'O', 'ㅖ': 'P',
    };

    // Track IME composition state
    const isComposingRef = useRef(false);

    const handleCompositionStart = () => {
        isComposingRef.current = true;
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
        isComposingRef.current = false;
        // Process the composed text
        handleInputChange({ target: e.target } as React.ChangeEvent<HTMLInputElement>);
    };

    // Convert Korean characters to English equivalents
    const convertKoreanToEnglish = (text: string): string => {
        let result = '';
        for (const char of text) {
            if (koreanToEnglish[char]) {
                result += koreanToEnglish[char];
            } else if (/[a-zA-Z0-9]/.test(char)) {
                result += char;
            }
            // Other characters (including composed Korean) are ignored
        }
        return result;
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // Don't process during IME composition
        if (isComposingRef.current) return;

        const value = e.target.value;

        // Convert Korean characters to English and filter
        const converted = convertKoreanToEnglish(value);

        // Only allow alphanumeric characters and limit to 8
        const sanitized = converted.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toLowerCase();
        setTagInput(sanitized);

        // Force update the input value to remove any Korean characters
        if (inputRef.current) {
            inputRef.current.value = sanitized;
        }

        // Auto-submit when 8 characters are entered
        if (sanitized.length === 8 && !isProcessing) {
            await submitTag(sanitized);
        }
    };

    // Helper function to get local time in ISO format with timezone offset
    const getLocalISOString = () => {
        const now = new Date();
        const offset = -now.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const minutes = String(Math.abs(offset) % 60).padStart(2, '0');

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');

        return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${sign}${hours}:${minutes}`;
    };

    const submitTag = async (uid: string) => {
        // Validate required fields if a purpose is selected
        if (selectedPurposeId && !validateRequiredFields()) {
            return;
        }

        setIsProcessing(true);
        setMessage(null);
        setWebhookInfo(null);

        try {
            const payload: any = {
                card_uid: uid,
                event_time: getLocalISOString(),
            };

            // Add purpose_id and purpose_data if a purpose is selected
            if (selectedPurposeId) {
                payload.purpose_id = selectedPurposeId;
                if (Object.keys(purposeData).length > 0) {
                    payload.purpose_data = purposeData;
                }
            }

            const response = await apiClient.post('/events/manual', payload);

            // Check if tag was throttled (event is null) or use appropriate message
            const isThrottled = response.data.event === null ||
                (response.data.message && response.data.message.toLowerCase().includes('throttled'));

            setMessage({
                type: 'success',
                text: isThrottled ? t('scan.throttledMessage') : t('scan.successMessage'),
            });

            // Check for webhook responses and display employee info
            if (response.data.webhookResponses && response.data.webhookResponses.length > 0) {
                for (let webhookRes of response.data.webhookResponses) {
                    // Parse JSON string if the response is a string
                    if (typeof webhookRes === 'string') {
                        try {
                            webhookRes = JSON.parse(webhookRes);
                        } catch (e) {
                            console.warn('Failed to parse webhook response as JSON:', e);
                            continue;
                        }
                    }

                    if (webhookRes && webhookRes.emp_name) {
                        setWebhookInfo({
                            emp_name: webhookRes.emp_name,
                            flag: webhookRes.flag || '',
                        });
                        break; // Only show the first webhook with employee info
                    }
                }
            }

            // Clear input after success
            setTagInput('');

            // Refresh recent events
            await fetchRecentEvents();

            // Auto-focus back to input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setMessage(null);
                setWebhookInfo(null);
            }, 3000);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || t('scan.failedMessage'),
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const renderFieldInput = (field: PurposeField) => {
        const value = purposeData[field.field_name] || '';
        const baseStyle = {
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
        };

        switch (field.field_type) {
            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field.field_name, Number(e.target.value))}
                        style={baseStyle}
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                        style={baseStyle}
                    />
                );
            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                        style={baseStyle}
                    >
                        <option value="">선택하세요</option>
                        {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                        style={baseStyle}
                    />
                );
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header - Compact */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                    {t('scan.title')}
                </h1>
                {selectedPurposeId && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: '#dbeafe',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        color: '#1e40af',
                    }}>
                        <span>📋</span>
                        <span>{purposes.find(p => p.id === selectedPurposeId)?.name}</span>
                    </div>
                )}
            </div>

            {/* Main Content - 2 Column Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1, minHeight: 0 }}>
                {/* Left Column - Tag Input */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                }}>
                    {/* Tag Input Section */}
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '3.5rem',
                            height: '3.5rem',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            marginBottom: '0.75rem',
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>📱</span>
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                            {t('scan.manualRegistration')}
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                            {t('scan.description')}
                        </p>
                    </div>

                    {/* Purpose Selection - Compact */}
                    {purposes.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                            <select
                                value={selectedPurposeId || ''}
                                onChange={handlePurposeChange}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.75rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    fontSize: '0.875rem',
                                    backgroundColor: '#f9fafb',
                                    color: '#374151',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="">📋 목적 선택 안함 (기본)</option>
                                {purposes.map(purpose => (
                                    <option key={purpose.id} value={purpose.id}>
                                        {purpose.name}
                                    </option>
                                ))}
                            </select>
                            <p style={{
                                fontSize: '0.7rem',
                                color: '#9ca3af',
                                marginTop: '0.375rem',
                                marginBottom: 0,
                            }}>
                                💡 최근 등록된 활성 목적이 자동 선택됩니다. 선택한 값은 로그아웃 전까지 유지됩니다.
                            </p>
                        </div>
                    )}

                    {/* Dynamic Purpose Fields - Compact Grid */}
                    {purposeFields.length > 0 && (
                        <div style={{
                            marginBottom: '1rem',
                            backgroundColor: '#f8fafc',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                        }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: purposeFields.length > 2 ? '1fr 1fr' : '1fr',
                                gap: '0.75rem',
                            }}>
                                {purposeFields.map(field => (
                                    <div key={field.id}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '0.25rem',
                                            fontWeight: '500',
                                            fontSize: '0.75rem',
                                            color: '#64748b',
                                        }}>
                                            {field.field_label}
                                            {field.is_required && <span style={{ color: '#ef4444' }}> *</span>}
                                        </label>
                                        {renderFieldInput(field)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Tag Input - Prominent */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '1rem 0',
                    }}>
                        <div style={{ width: '100%', maxWidth: '320px' }}>
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="text"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                value={tagInput}
                                onChange={handleInputChange}
                                onCompositionStart={handleCompositionStart}
                                onCompositionEnd={handleCompositionEnd}
                                disabled={isProcessing}
                                placeholder={t('scan.placeholder')}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '2rem',
                                    fontFamily: 'monospace',
                                    textAlign: 'center',
                                    border: '3px solid',
                                    borderColor: tagInput.length === 8 ? '#10b981' : '#e5e7eb',
                                    borderRadius: '0.75rem',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    letterSpacing: '0.15em',
                                    background: tagInput.length === 8 ? 'linear-gradient(to bottom, #ecfdf5, #ffffff)' : 'white',
                                    textTransform: 'lowercase',
                                }}
                                onFocus={(e) => {
                                    if (tagInput.length !== 8) {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    if (tagInput.length !== 8) {
                                        e.target.style.borderColor = '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '0.5rem',
                                padding: '0 0.25rem',
                            }}>
                                <span style={{
                                    color: tagInput.length === 8 ? '#10b981' : '#9ca3af',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                }}>
                                    {tagInput.length}/8
                                </span>
                                {isProcessing && (
                                    <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                                        ⏳ {t('scan.processing')}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Status Messages */}
                        {(message || webhookInfo) && (
                            <div style={{ width: '100%', maxWidth: '320px', marginTop: '1rem' }}>
                                {message && (
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                                        color: message.type === 'success' ? '#166534' : '#991b1b',
                                        fontSize: '0.875rem',
                                        fontWeight: '500',
                                        textAlign: 'center',
                                        animation: 'fadeIn 0.3s',
                                    }}>
                                        {message.type === 'success' ? '✅' : '❌'} {message.text}
                                    </div>
                                )}
                                {webhookInfo && (
                                    <div style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
                                        marginTop: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem',
                                        animation: 'fadeIn 0.3s',
                                    }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e40af' }}>
                                            👤 {webhookInfo.emp_name}
                                        </span>
                                        {webhookInfo.flag && (
                                            <span style={{
                                                backgroundColor: webhookInfo.flag === '입실' ? '#10b981' : '#f59e0b',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                            }}>
                                                {webhookInfo.flag}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tips - Collapsible/Compact */}
                    <div style={{
                        backgroundColor: '#f1f5f9',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#64748b',
                        lineHeight: '1.5',
                    }}>
                        <strong>💡 팁:</strong> 8자리 카드 UID 입력 시 자동 등록됩니다.
                    </div>
                </div>

                {/* Right Column - Recent Events */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                            {t('scan.recentEvents')}
                        </h3>
                        <span style={{
                            backgroundColor: '#e0e7ff',
                            color: '#4338ca',
                            padding: '0.25rem 0.625rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                        }}>
                            {recentEvents.length}건
                        </span>
                    </div>

                    {recentEvents.length === 0 ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9ca3af',
                        }}>
                            <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</span>
                            <span style={{ fontSize: '0.875rem' }}>{t('scan.noRecentEvents')}</span>
                        </div>
                    ) : (
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white' }}>
                                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
                                            {t('scan.cardUid')}
                                        </th>
                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
                                            {t('scan.eventTime')}
                                        </th>
                                        <th style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280' }}>
                                            {t('scan.sourceIp')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentEvents.map((event, index) => (
                                        <tr
                                            key={event.id}
                                            style={{
                                                borderBottom: '1px solid #f3f4f6',
                                                backgroundColor: index === 0 ? '#fefce8' : 'transparent',
                                                transition: 'background-color 0.2s',
                                            }}
                                        >
                                            <td style={{
                                                padding: '0.5rem',
                                                fontFamily: 'monospace',
                                                fontSize: '0.8rem',
                                                fontWeight: index === 0 ? '600' : '400',
                                                color: index === 0 ? '#854d0e' : '#374151',
                                            }}>
                                                {maskCardUid(event.card_uid)}
                                            </td>
                                            <td style={{
                                                padding: '0.5rem',
                                                fontSize: '0.75rem',
                                                color: '#6b7280',
                                            }}>
                                                {formatDate(event.event_time)}
                                            </td>
                                            <td style={{
                                                padding: '0.5rem',
                                                fontSize: '0.75rem',
                                                color: '#9ca3af',
                                            }}>
                                                {event.source_ip}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

