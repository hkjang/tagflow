import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const settingsService = {
    async getSettings(): Promise<Record<string, string>> {
        const response = await axios.get(`${API_URL}/settings`);
        return response.data;
    },

    async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
        const response = await axios.post(`${API_URL}/settings`, settings);
        return response.data;
    },

    async resetTagEvents(): Promise<{ deletedCount: number }> {
        const token = localStorage.getItem('access_token');
        const response = await axios.post(`${API_URL}/cleanup/reset-tag-events`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    async resetWebhookLogs(): Promise<{ deletedCount: number }> {
        const token = localStorage.getItem('access_token');
        const response = await axios.post(`${API_URL}/cleanup/reset-webhook-logs`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },
};
