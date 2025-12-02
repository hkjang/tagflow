'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function ReportsPage() {
  const [eventStats, setEventStats] = useState<any>(null);
  const [webhookStats, setWebhookStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [eventsResponse, webhooksResponse] = await Promise.all([
        api.get('/reports/events', { params }),
        api.get('/reports/webhooks'),
      ]);

      setEventStats(eventsResponse.data);
      setWebhookStats(webhooksResponse.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExport = async () => {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/reports/export', { params });
      const data = response.data;

      // Convert to CSV
      if (data.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((row: any) => Object.values(row).join(','));
      const csv = [headers, ...rows].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tagflow-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range Filter</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchStats}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Apply Filter
          </button>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
          >
            Clear
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Total Events</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {eventStats?.total || 0}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Unique Cards</div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {eventStats?.unique_cards || 0}
            </div>
          </div>
        </div>

        {/* Top Cards */}
        {eventStats?.topCards && eventStats.topCards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Top 10 Cards</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Card UID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Scan Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventStats.topCards.map((card: any, index: number) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-mono text-gray-900">
                        {card.card_uid}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {card.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Webhook Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Webhook Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 font-medium">Total Webhooks</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {webhookStats?.totalWebhooks || 0}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Active Webhooks</div>
            <div className="text-2xl font-bold text-blue-900 mt-2">
              {webhookStats?.activeWebhooks || 0}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Successful Calls</div>
            <div className="text-2xl font-bold text-green-900 mt-2">
              {webhookStats?.successful_calls || 0}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Failed Calls</div>
            <div className="text-2xl font-bold text-red-900 mt-2">
              {webhookStats?.failed_calls || 0}
            </div>
          </div>
        </div>

        {/* Success Rate */}
        {webhookStats?.total_calls > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Success Rate (Last 30 Days)</span>
              <span className="text-sm font-medium text-gray-900">
                {Math.round((webhookStats.successful_calls / webhookStats.total_calls) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all"
                style={{
                  width: `${(webhookStats.successful_calls / webhookStats.total_calls) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Per-Webhook Performance */}
        {webhookStats?.webhookPerformance && webhookStats.webhookPerformance.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Per-Webhook Performance</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Calls
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Successful
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Failed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhookStats.webhookPerformance.map((webhook: any) => (
                    <tr key={webhook.id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {webhook.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {webhook.total_calls || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {webhook.successful_calls || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        {webhook.failed_calls || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {webhook.total_calls > 0
                          ? Math.round((webhook.successful_calls / webhook.total_calls) * 100)
                          : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
