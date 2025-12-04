'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import apiClient from '../../../services/api.service';
import { useTranslation } from '../../../lib/i18n';

interface EventStats {
  total: number;
  unique_cards: number;
  topCards: { card_uid: string; count: number }[];
  eventsByDay: { date: string; count: number }[];
}

interface WebhookStats {
  totalWebhooks: number;
  activeWebhooks: number;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
}

interface TagEvent {
  id: number;
  card_uid: string;
  event_time: string;
  source_ip: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [eventStats, setEventStats] = useState<EventStats | null>(null);
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<TagEvent[]>([]);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch event statistics
      try {
        const eventRes = await apiClient.get('/reports/events');
        setEventStats(eventRes.data);
      } catch (e) {
        console.error('Failed to fetch event stats:', e);
      }

      // Fetch webhook statistics
      try {
        const webhookRes = await apiClient.get('/reports/webhooks');
        setWebhookStats(webhookRes.data);
      } catch (e) {
        console.error('Failed to fetch webhook stats:', e);
      }

      // Fetch recent events
      try {
        const eventsRes = await apiClient.get('/events', { params: { limit: 5 } });
        setRecentEvents(eventsRes.data.data || []);
      } catch (e) {
        console.error('Failed to fetch recent events:', e);
      }

      // Fetch today's events count
      try {
        const today = new Date().toISOString().split('T')[0];
        const todayRes = await apiClient.get('/reports/events', { params: { startDate: today } });
        setTodayCount(todayRes.data.total || 0);
      } catch (e) {
        console.error('Failed to fetch today count:', e);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getSuccessRate = () => {
    if (!webhookStats || !webhookStats.total_calls) return 0;
    return Math.round((webhookStats.successful_calls / webhookStats.total_calls) * 100);
  };

  const getMaxEventCount = () => {
    if (!eventStats?.eventsByDay?.length) return 1;
    return Math.max(...eventStats.eventsByDay.map(d => d.count), 1);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>{t('dashboard.loading')}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#1f2937' }}>
        {t('dashboard.title')}
      </h1>

      {/* Statistics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* Total Events Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(102, 126, 234, 0.3)',
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('dashboard.totalEvents')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{eventStats?.total?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>{t('dashboard.totalEventsDesc')}</div>
        </div>

        {/* Today Events Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(245, 87, 108, 0.3)',
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('dashboard.todayEvents')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{todayCount.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>{t('dashboard.todayEventsDesc')}</div>
        </div>

        {/* Unique Cards */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(79, 172, 254, 0.3)',
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('dashboard.uniqueCards')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{eventStats?.unique_cards?.toLocaleString() || 0}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>{t('dashboard.uniqueCardsDesc')}</div>
        </div>

        {/* Active Webhooks */}
        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white',
          boxShadow: '0 4px 6px -1px rgba(67, 233, 123, 0.3)',
        }}>
          <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>{t('dashboard.activeWebhooks')}</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{webhookStats?.activeWebhooks || 0} / {webhookStats?.totalWebhooks || 0}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>{t('dashboard.activeWebhooksDesc')}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Event Trend Chart */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            📊 {t('dashboard.eventTrend')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px' }}>
            {eventStats?.eventsByDay?.slice(0, 7).reverse().map((day, index) => {
              const height = Math.max((day.count / getMaxEventCount()) * 100, 5);
              return (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {day.count}
                  </div>
                  <div style={{
                    width: '100%',
                    height: `${height}px`,
                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '0.375rem 0.375rem 0 0',
                    transition: 'height 0.3s ease',
                  }} />
                  <div style={{ fontSize: '0.625rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    {day.date?.slice(5)}
                  </div>
                </div>
              );
            })}
            {(!eventStats?.eventsByDay || eventStats.eventsByDay.length === 0) && (
              <div style={{ flex: 1, textAlign: 'center', color: '#9ca3af', paddingTop: '60px' }}>
                {t('dashboard.noData')}
              </div>
            )}
          </div>
        </div>

        {/* Webhook Success Rate */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🔗 {t('dashboard.webhookSuccessRate')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={getSuccessRate() >= 90 ? '#10b981' : getSuccessRate() >= 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="3"
                  strokeDasharray={`${getSuccessRate()}, 100`}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{getSuccessRate()}%</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{t('dashboard.totalCalls')}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>{webhookStats?.total_calls?.toLocaleString() || 0}</div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>✓ {t('dashboard.success')}</div>
                  <div style={{ fontWeight: '600', color: '#10b981' }}>{webhookStats?.successful_calls?.toLocaleString() || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>✗ {t('dashboard.failed')}</div>
                  <div style={{ fontWeight: '600', color: '#ef4444' }}>{webhookStats?.failed_calls?.toLocaleString() || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Top 5 Cards */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🏆 {t('dashboard.top5Cards')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {eventStats?.topCards?.slice(0, 5).map((card, index) => (
              <div key={card.card_uid} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#d97706' : '#e5e7eb',
                  color: index < 3 ? 'white' : '#6b7280',
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.875rem', color: '#374151' }}>
                  {card.card_uid}
                </div>
                <div style={{ fontWeight: '600', color: '#667eea' }}>
                  {card.count}{t('dashboard.times')}
                </div>
              </div>
            ))}
            {(!eventStats?.topCards || eventStats.topCards.length === 0) && (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                {t('dashboard.noData')}
              </div>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>
            🕐 {t('dashboard.recentEvents')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentEvents.map((event) => (
              <div key={event.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }} />
                <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.875rem', color: '#374151' }}>
                  {event.card_uid}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {formatDateTime(event.event_time)}
                </div>
              </div>
            ))}
            {recentEvents.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                {t('dashboard.noRecentEvents')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

