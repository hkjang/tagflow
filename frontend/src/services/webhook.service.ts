import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Webhook {
  id: number;
  name: string;
  target_url: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

export interface CreateWebhookDto {
  name: string;
  target_url: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  is_active?: boolean;
}

export const webhookService = {
  async getAllWebhooks(): Promise<Webhook[]> {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/webhooks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createWebhook(data: CreateWebhookDto): Promise<Webhook> {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${API_URL}/webhooks`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateWebhook(id: number, data: Partial<CreateWebhookDto>): Promise<Webhook> {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(`${API_URL}/webhooks/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async deleteWebhook(id: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axios.delete(`${API_URL}/webhooks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async testWebhook(id: number): Promise<{ message: string }> {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${API_URL}/webhooks/${id}/test`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Mapping operations
  async getMappings(webhookId: number): Promise<WebhookMapping[]> {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_URL}/webhook-mappings/${webhookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async createMapping(webhookId: number, fromKey: string, toKey: string): Promise<WebhookMapping> {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(`${API_URL}/webhook-mappings`, {
      webhook_id: webhookId,
      from_key: fromKey,
      to_key: toKey,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async updateMapping(id: number, fromKey?: string, toKey?: string): Promise<WebhookMapping> {
    const token = localStorage.getItem('access_token');
    const response = await axios.put(`${API_URL}/webhook-mappings/${id}`, {
      from_key: fromKey,
      to_key: toKey,
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async deleteMapping(id: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    await axios.delete(`${API_URL}/webhook-mappings/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};

export interface WebhookMapping {
  id: number;
  webhook_id: number;
  from_key: string;
  to_key: string;
}
