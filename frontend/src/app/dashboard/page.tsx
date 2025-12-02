'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const eventsResponse = await api.get('/reports/events');
        const webhooksResponse = await api.get('/reports/webhooks');
        
        setStats({
          events: eventsResponse.data,
          webhooks: webhooksResponse.data,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome, {user?.username}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Total Events</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.events?.total || 0}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm font-medium">Unique Cards</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">
            {stats?.events?.unique_cards || 0}
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-medium">Active Webhooks</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.webhooks?.activeWebhooks || 0}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-gray-500 text-sm font-medium">Webhook Success Rate</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {stats?.webhooks?.total_calls > 0
                  ? Math.round((stats.webhooks.successful_calls / stats.webhooks.total_calls) * 100)
                  : 0}%
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-600">
          System is operational. Use the menu to navigate to different sections.
        </p>
      </div>
    </div>
  );
}
