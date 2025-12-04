'use client';

import { useState, useEffect } from 'react';
import { reportsService, EventStatistics, WebhookStatistics, TagEvent } from '../../../services/reports.service';

type DateRange = '7days' | '30days' | '90days' | 'custom';

export default function ReportsPage() {
  const [eventStats, setEventStats] = useState<EventStatistics | null>(null);
  const [webhookStats, setWebhookStats] = useState<WebhookStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (dateRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        return {
          startDate: customStartDate || undefined,
          endDate: customEndDate || undefined,
        };
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { startDate, endDate } = getDateRange();

      const [eventData, webhookData] = await Promise.all([
        reportsService.getEventStatistics(startDate, endDate),
        reportsService.getWebhookStatistics(),
      ]);

      setEventStats(eventData);
      setWebhookStats(webhookData);
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange, customStartDate, customEndDate]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const { startDate, endDate } = getDateRange();
      const events = await reportsService.exportEvents(startDate, endDate);

      // Convert to CSV
      const headers = ['ID', 'Card UID', 'Event Time', 'Device ID', 'Is Manual', 'Created At'];
      const rows = events.map(e => [
        e.id,
        e.card_uid,
        e.event_time,
        e.device_id || '',
        e.is_manual ? 'Yes' : 'No',
        e.created_at,
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tag-events-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to export:', err);
      alert('Failed to export events');
    } finally {
      setExporting(false);
    }
  };

  const maxCount = eventStats?.eventsByDay?.length
    ? Math.max(...eventStats.eventsByDay.map(d => d.count), 1)
    : 1;

  const styles = {
    container: { padding: '0' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap' as const,
      gap: '1rem',
    },
    title: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: 0 },
    controls: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' as const },
    select: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      fontSize: '0.875rem',
      cursor: 'pointer',
    },
    dateInput: {
      padding: '0.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      fontSize: '0.875rem',
    },
    exportBtn: {
      padding: '0.5rem 1rem',
      borderRadius: '0.5rem',
      border: 'none',
      backgroundColor: '#10b981',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '500' as const,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
    },
    statLabel: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' },
    statValue: { fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' },
    statSubtext: { fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' },
    section: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      marginBottom: '1.5rem',
    },
    sectionTitle: { fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' },
    chartContainer: { height: '250px', position: 'relative' as const },
    barContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      height: '100%',
      gap: '4px',
      padding: '0 0.5rem',
    },
    barWrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      flex: 1,
      maxWidth: '40px',
      height: '100%',
    },
    bar: {
      width: '100%',
      backgroundColor: '#3b82f6',
      borderRadius: '4px 4px 0 0',
      transition: 'height 0.3s ease',
      minHeight: '2px',
    },
    barLabel: {
      fontSize: '0.625rem',
      color: '#6b7280',
      marginTop: '0.25rem',
      transform: 'rotate(-45deg)',
      transformOrigin: 'top left',
      whiteSpace: 'nowrap' as const,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '0.875rem',
    },
    th: {
      textAlign: 'left' as const,
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      color: '#374151',
      fontWeight: '600',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid #e5e7eb',
      color: '#4b5563',
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    successBadge: { backgroundColor: '#d1fae5', color: '#065f46' },
    errorBadge: { backgroundColor: '#fee2e2', color: '#991b1b' },
    emptyState: {
      padding: '3rem',
      textAlign: 'center' as const,
      color: '#6b7280',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTop: '3px solid #3b82f6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    twoColumn: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem',
    },
    progressBar: {
      height: '8px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '0.5rem',
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.section, textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          <button
            onClick={fetchData}
            style={{ ...styles.exportBtn, backgroundColor: '#3b82f6' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Reports & Analytics</h1>
        <div style={styles.controls}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            style={styles.select}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={styles.dateInput}
                placeholder="Start Date"
              />
              <span style={{ color: '#6b7280' }}>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={styles.dateInput}
                placeholder="End Date"
              />
            </>
          )}

          <button
            onClick={handleExport}
            disabled={exporting}
            style={{ ...styles.exportBtn, opacity: exporting ? 0.7 : 1 }}
          >
            {exporting ? (
              <>
                <span style={{ ...styles.spinner, width: '16px', height: '16px', borderWidth: '2px' }}></span>
                Exporting...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.grid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Events</div>
          <div style={styles.statValue}>{eventStats?.total?.toLocaleString() || 0}</div>
          <div style={styles.statSubtext}>Tag scans recorded</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Unique Cards</div>
          <div style={styles.statValue}>{eventStats?.unique_cards?.toLocaleString() || 0}</div>
          <div style={styles.statSubtext}>Different cards detected</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Active Webhooks</div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>
            {webhookStats?.activeWebhooks || 0}
          </div>
          <div style={styles.statSubtext}>of {webhookStats?.totalWebhooks || 0} total</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Webhook Success Rate</div>
          <div style={{
            ...styles.statValue, color: webhookStats && webhookStats.total_calls > 0
              ? (webhookStats.successful_calls / webhookStats.total_calls >= 0.9 ? '#10b981' : '#f59e0b')
              : '#6b7280'
          }}>
            {webhookStats && webhookStats.total_calls > 0
              ? Math.round((webhookStats.successful_calls / webhookStats.total_calls) * 100)
              : 0}%
          </div>
          <div style={styles.statSubtext}>
            {webhookStats?.successful_calls || 0} / {webhookStats?.total_calls || 0} calls (30 days)
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.twoColumn}>
        {/* Events by Day Chart */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Daily Event Activity</h2>
          {eventStats?.eventsByDay && eventStats.eventsByDay.length > 0 ? (
            <div style={styles.chartContainer}>
              <div style={styles.barContainer}>
                {eventStats.eventsByDay.slice().reverse().map((day, idx) => (
                  <div key={idx} style={styles.barWrapper} title={`${day.date}: ${day.count} events`}>
                    <div
                      style={{
                        ...styles.bar,
                        height: `${Math.max((day.count / maxCount) * 200, 2)}px`,
                      }}
                    />
                    <span style={styles.barLabel}>
                      {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>No event data available for this period</div>
          )}
        </div>

        {/* Top Cards */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Most Active Cards</h2>
          {eventStats?.topCards && eventStats.topCards.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Card UID</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Event Count</th>
                </tr>
              </thead>
              <tbody>
                {eventStats.topCards.map((card, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>
                      <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8125rem' }}>
                        {card.card_uid}
                      </code>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '500' }}>
                      {card.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.emptyState}>No card data available</div>
          )}
        </div>
      </div>

      {/* Webhook Performance */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Webhook Performance (Last 30 Days)</h2>
        {webhookStats?.webhookPerformance && webhookStats.webhookPerformance.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Webhook</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Total Calls</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Successful</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Failed</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {webhookStats.webhookPerformance.map((wh) => {
                const successRate = wh.total_calls > 0
                  ? Math.round((wh.successful_calls / wh.total_calls) * 100)
                  : 0;
                const isHealthy = successRate >= 90;

                return (
                  <tr key={wh.id}>
                    <td style={styles.td}>{wh.name}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>{wh.total_calls}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={{ ...styles.badge, ...styles.successBadge }}>
                        {wh.successful_calls}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {wh.failed_calls > 0 ? (
                        <span style={{ ...styles.badge, ...styles.errorBadge }}>
                          {wh.failed_calls}
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>0</span>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ ...styles.progressBar, width: '80px' }}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${successRate}%`,
                              backgroundColor: isHealthy ? '#10b981' : '#f59e0b',
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: '500', color: isHealthy ? '#10b981' : '#f59e0b' }}>
                          {successRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>No webhook performance data available</div>
        )}
      </div>
    </div>
  );
}
