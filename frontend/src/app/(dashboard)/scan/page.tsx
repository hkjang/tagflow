'use client';

import { useState, useRef, useEffect } from 'react';
import apiClient from '../../../services/api.service';

interface TagEvent {
    id: number;
    card_uid: string;
    event_time: string;
    source_ip: string;
}

export default function ScanPage() {
    const [tagInput, setTagInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [recentEvents, setRecentEvents] = useState<TagEvent[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Fetch recent events on mount
    useEffect(() => {
        fetchRecentEvents();
    }, []);

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

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Only allow alphanumeric characters and limit to 8
        const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
        setTagInput(sanitized);

        // Auto-submit when 8 characters are entered
        if (sanitized.length === 8 && !isProcessing) {
            await submitTag(sanitized);
        }
    };

    const submitTag = async (uid: string) => {
        setIsProcessing(true);
        setMessage(null);

        try {
            const response = await apiClient.post('/events/manual', {
                card_uid: uid,
            });

            setMessage({
                type: 'success',
                text: response.data.message || 'Tag registered successfully!',
            });

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
            }, 3000);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to register tag',
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

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
                    Tag Input
                </h1>
            </div>

            {/* Input Section */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '2rem', marginBottom: '2rem' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                        Manual Tag Registration
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                        Enter an 8-character RFID tag UID. The tag will be automatically registered when you complete the input.
                    </p>

                    {/* Input Box */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={tagInput}
                            onChange={handleInputChange}
                            disabled={isProcessing}
                            placeholder="Enter 8-character UID"
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                fontSize: '1.5rem',
                                fontFamily: 'monospace',
                                textAlign: 'center',
                                border: '2px solid #d1d5db',
                                borderRadius: '0.5rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                                letterSpacing: '0.2em',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <div style={{
                            marginTop: '0.5rem',
                            color: tagInput.length === 8 ? '#10b981' : '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                        }}>
                            {tagInput.length}/8 characters
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
                            color: message.type === 'success' ? '#065f46' : '#991b1b',
                            marginBottom: '1rem',
                            animation: 'fadeIn 0.3s',
                        }}>
                            {message.text}
                        </div>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                            Processing...
                        </div>
                    )}

                    {/* Help Text */}
                    <div style={{
                        backgroundColor: '#f3f4f6',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        textAlign: 'left',
                        marginTop: '1.5rem',
                    }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            💡 Tips:
                        </h3>
                        <ul style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.6', paddingLeft: '1.5rem', margin: 0 }}>
                            <li>Only alphanumeric characters are allowed</li>
                            <li>Tag will auto-submit when 8 characters are entered</li>
                            <li>Input will automatically clear after successful registration</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Recent Events Section */}
            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1.5rem' }}>
                    Recent Tag Events
                </h3>

                {recentEvents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        No recent events
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                                        Card UID
                                    </th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                                        Event Time
                                    </th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                                        Source IP
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentEvents.map((event, index) => (
                                    <tr
                                        key={event.id}
                                        style={{
                                            borderBottom: '1px solid #e5e7eb',
                                            backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb',
                                        }}
                                    >
                                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                            {event.card_uid}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                                            {formatDate(event.event_time)}
                                        </td>
                                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                                            {event.source_ip}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
