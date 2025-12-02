'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { CleanupLog } from '@shared/cleanup';
import { UserRole } from '@shared/user';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CleanupLogsPage() {
  const [logs, setLogs] = useState<CleanupLog[]>([]);
  const [failLogs, setFailLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualRunning, setManualRunning] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const [logsResponse, failLogsResponse] = await Promise.all([
        api.get('/cleanup/logs'),
        api.get('/cleanup/fail-logs'),
      ]);
      setLogs(logsResponse.data);
      setFailLogs(failLogsResponse.data);
    } catch (error) {
      console.error('Failed to fetch cleanup logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleManualCleanup = async () => {
    if (!confirm('Run manual cleanup now? This will delete old records according to retention policies.')) {
      return;
    }

    setManualRunning(true);
    try {
      await api.post('/cleanup/manual');
      alert('Cleanup completed successfully!');
      fetchLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Cleanup failed');
    } finally {
      setManualRunning(false);
    }
  };

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cleanup Logs</h1>
          <button
            onClick={handleManualCleanup}
            disabled={manualRunning}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
          >
            {manualRunning ? 'Running...' : 'Run Manual Cleanup'}
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Data Retention Policies</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tag Events: 1 year</li>
            <li>• Webhook Logs: 90 days</li>
            <li>• Cleanup Logs: 2 years</li>
            <li>• Auto-cleanup runs on every admin login</li>
          </ul>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            {/* Success Logs */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Successful Cleanups ({logs.length})
                </h2>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Admin ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Deleted Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Run Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No cleanup logs found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.admin_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-medium">
                            {log.deleted_count} records
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.run_time).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Failure Logs */}
            {failLogs.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                  <h2 className="text-lg font-semibold text-red-900">
                    Failed Cleanups ({failLogs.length})
                  </h2>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Admin ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Error Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Run Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {failLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.admin_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600">
                          {log.error_message}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(log.run_time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
