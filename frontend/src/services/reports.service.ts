import apiClient from './api.service';

export interface EventStatistics {
    total: number;
    unique_cards: number;
    topCards: Array<{
        card_uid: string;
        count: number;
    }>;
    eventsByDay: Array<{
        date: string;
        count: number;
    }>;
}

export interface WebhookStatistics {
    totalWebhooks: number;
    activeWebhooks: number;
    total_calls: number;
    successful_calls: number;
    failed_calls: number;
    webhookPerformance: Array<{
        id: number;
        name: string;
        total_calls: number;
        successful_calls: number;
        failed_calls: number;
    }>;
}

export interface TagEvent {
    id: number;
    card_uid: string;
    event_time: string;
    device_id?: string;
    is_manual: number;
    created_at: string;
}

export const reportsService = {
    async getEventStatistics(startDate?: string, endDate?: string): Promise<EventStatistics> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiClient.get<EventStatistics>(`/reports/events?${params.toString()}`);
        return response.data;
    },

    async getWebhookStatistics(): Promise<WebhookStatistics> {
        const response = await apiClient.get<WebhookStatistics>('/reports/webhooks');
        return response.data;
    },

    async exportEvents(startDate?: string, endDate?: string): Promise<TagEvent[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiClient.get<TagEvent[]>(`/reports/export?${params.toString()}`);
        return response.data;
    },
};
