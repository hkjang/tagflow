import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Webhook, WebhookMapping, WebhookLog, CreateWebhookDto, HttpMethod } from '@shared/webhook';
import axios, { AxiosRequestConfig } from 'axios';

import { SettingsService } from '../settings/settings.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly db: DatabaseService,
    private readonly settingsService: SettingsService,
  ) { }

  // CRUD operations for webhooks
  async createWebhook(dto: CreateWebhookDto): Promise<Webhook> {
    const headers = dto.headers ? JSON.stringify(dto.headers) : null;
    const isActive = dto.is_active !== undefined ? dto.is_active : true;

    const result = this.db.exec(
      'INSERT INTO webhooks (name, target_url, http_method, headers, is_active) VALUES (?, ?, ?, ?, ?)',
      [dto.name, dto.target_url, dto.http_method, headers, isActive ? 1 : 0],
    );

    return await this.getWebhookById(Number(result.lastInsertRowid));
  }

  async getAllWebhooks(): Promise<Webhook[]> {
    const webhooks = this.db.query<any>('SELECT * FROM webhooks ORDER BY created_at DESC');
    return webhooks.map(this.parseWebhook);
  }

  async getActiveWebhooks(): Promise<Webhook[]> {
    const webhooks = this.db.query<any>('SELECT * FROM webhooks WHERE is_active = 1');
    return webhooks.map(this.parseWebhook);
  }

  async getWebhookById(id: number): Promise<Webhook> {
    const webhook = this.db.queryOne<any>('SELECT * FROM webhooks WHERE id = ?', [id]);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    return this.parseWebhook(webhook);
  }

  async updateWebhook(id: number, updates: Partial<CreateWebhookDto>): Promise<Webhook> {
    const webhook = await this.getWebhookById(id);

    let sql = 'UPDATE webhooks SET ';
    const params: any[] = [];
    const setParts: string[] = [];

    if (updates.name !== undefined) {
      setParts.push('name = ?');
      params.push(updates.name);
    }

    if (updates.target_url !== undefined) {
      setParts.push('target_url = ?');
      params.push(updates.target_url);
    }

    if (updates.http_method !== undefined) {
      setParts.push('http_method = ?');
      params.push(updates.http_method);
    }

    if (updates.headers !== undefined) {
      setParts.push('headers = ?');
      params.push(JSON.stringify(updates.headers));
    }

    if (updates.is_active !== undefined) {
      setParts.push('is_active = ?');
      params.push(updates.is_active ? 1 : 0);
    }

    if (setParts.length === 0) {
      return webhook;
    }

    sql += setParts.join(', ') + ' WHERE id = ?';
    params.push(id);

    this.db.exec(sql, params);
    return await this.getWebhookById(id);
  }

  async deleteWebhook(id: number): Promise<void> {
    this.db.exec('DELETE FROM webhooks WHERE id = ?', [id]);
  }

  // Webhook mapping operations
  async createMapping(webhookId: number, fromKey: string, toKey: string): Promise<WebhookMapping> {
    const result = this.db.exec(
      'INSERT INTO webhook_mappings (webhook_id, from_key, to_key) VALUES (?, ?, ?)',
      [webhookId, fromKey, toKey],
    );

    const mapping = this.db.queryOne<WebhookMapping>(
      'SELECT * FROM webhook_mappings WHERE id = ?',
      [result.lastInsertRowid],
    );
    if (!mapping) throw new Error('Failed to create mapping');
    return mapping;
  }

  async getMappingsByWebhookId(webhookId: number): Promise<WebhookMapping[]> {
    return this.db.query<WebhookMapping>(
      'SELECT * FROM webhook_mappings WHERE webhook_id = ?',
      [webhookId],
    );
  }

  async updateMapping(id: number, fromKey?: string, toKey?: string): Promise<WebhookMapping> {
    const updates: string[] = [];
    const params: any[] = [];

    if (fromKey) {
      updates.push('from_key = ?');
      params.push(fromKey);
    }

    if (toKey) {
      updates.push('to_key = ?');
      params.push(toKey);
    }

    if (updates.length > 0) {
      params.push(id);
      this.db.exec(
        `UPDATE webhook_mappings SET ${updates.join(', ')} WHERE id = ?`,
        params,
      );
    }

    const mapping = this.db.queryOne<WebhookMapping>(
      'SELECT * FROM webhook_mappings WHERE id = ?',
      [id],
    );
    if (!mapping) throw new Error('Mapping not found');
    return mapping;
  }

  async deleteMapping(id: number): Promise<void> {
    this.db.exec('DELETE FROM webhook_mappings WHERE id = ?', [id]);
  }

  // Field mapping engine
  private applyMappings(data: any, mappings: WebhookMapping[]): any {
    const result: any = {};

    for (const mapping of mappings) {
      const value = this.getNestedValue(data, mapping.from_key);
      this.setNestedValue(result, mapping.to_key, value);
    }

    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop();

    let current = obj;
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    if (lastKey) {
      current[lastKey] = value;
    }
  }

  // Webhook execution
  async triggerWebhooks(eventData: any): Promise<any[]> {
    const webhooks = await this.getActiveWebhooks();

    const promises = webhooks.map(webhook =>
      this.executeWebhook(webhook, eventData).catch(error => {
        console.error(`Webhook ${webhook.id} failed:`, error);
        return null; // Return null for failed webhooks
      })
    );

    const results = await Promise.all(promises);
    // Filter out null results (failed webhooks) and return successful responses
    return results.filter(result => result !== null);
  }

  async executeWebhook(webhook: Webhook, eventData: any): Promise<any> {
    let payload: any = { ...eventData };

    try {
      // Get mappings for this webhook
      const mappings = await this.getMappingsByWebhookId(webhook.id);

      // Apply field mappings
      payload = mappings.length > 0
        ? this.applyMappings(eventData, mappings)
        : { ...eventData }; // Create a copy to avoid mutating original

      // Add system name (with fallback if settings table doesn't exist)
      try {
        const systemName = await this.settingsService.getSystemName();
        payload['system_name'] = systemName;
      } catch (error) {
        console.warn('Failed to get system name from settings, using default:', error);
        payload['system_name'] = 'TagFlow RFID System';
      }

      // Rename card_uid if configured (with fallback if settings table doesn't exist)
      try {
        const cardUidKey = await this.settingsService.getWebhookCardUidKey();
        if (cardUidKey !== 'card_uid' && payload['card_uid']) {
          payload[cardUidKey] = payload['card_uid'];
          delete payload['card_uid'];
        }
      } catch (error) {
        console.warn('Failed to get webhook card UID key from settings, using default:', error);
        // Keep card_uid as is
      }

      // Prepare HTTP request
      const config: AxiosRequestConfig = {
        method: webhook.http_method.toLowerCase() as any,
        url: webhook.target_url,
        headers: webhook.headers || {},
        timeout: 10000, // 10 second timeout
      };

      if (['post', 'put', 'patch'].includes(webhook.http_method.toLowerCase())) {
        config.data = payload;
      } else {
        config.params = payload;
      }

      // Execute HTTP request
      const response = await axios(config);

      // Log success
      this.logWebhookExecution(webhook.id, payload, response.status, JSON.stringify(response.data));

      // Return the response data for use in the frontend
      return response.data;
    } catch (error: any) {
      // Log failure and add to retry queue
      let errorMessage = error.response?.data || error.message;
      if (typeof errorMessage === 'object') {
        errorMessage = JSON.stringify(errorMessage);
      }
      const status = error.response?.status || 0;

      this.logWebhookExecution(
        webhook.id,
        payload,
        status,
        undefined,
        errorMessage,
      );

      // Add to retry queue if it's a network/server error
      if (!error.response || error.response.status >= 500) {
        this.addToRetryQueue(webhook.id, eventData);
      }

      throw error;
    }
  }

  private logWebhookExecution(
    webhookId: number,
    payload: any,
    status: number,
    responseBody?: string,
    errorMessage?: string,
  ): void {
    this.db.exec(
      'INSERT INTO webhook_logs (webhook_id, payload, response_status, response_body, error_message) VALUES (?, ?, ?, ?, ?)',
      [webhookId, JSON.stringify(payload), status, responseBody || null, errorMessage || null],
    );
  }

  private addToRetryQueue(webhookId: number, eventData: any): void {
    // For simplicity, we'll store retry items in a separate table
    // In a production system, you might use a proper queue system
    try {

      this.db.exec(
        'INSERT INTO webhook_retry_queue (webhook_id, payload, next_retry) VALUES (?, ?, datetime("now", "+1 minute"))',
        [webhookId, JSON.stringify(eventData)],
      );
    } catch (error: any) {
      console.error('Failed to add to retry queue:', error);
    }
  }

  async processRetryQueue(): Promise<void> {
    try {
      const retryItems = this.db.query<any>(
        'SELECT * FROM webhook_retry_queue WHERE next_retry <= datetime("now") AND retry_count < 5 LIMIT 10',
        [],
      );

      for (const item of retryItems) {
        try {
          const webhook = await this.getWebhookById(item.webhook_id);
          const eventData = JSON.parse(item.payload);

          await this.executeWebhook(webhook, eventData);

          // Success - remove from queue
          this.db.exec('DELETE FROM webhook_retry_queue WHERE id = ?', [item.id]);
        } catch (error: any) {
          // Failed - increment retry count and schedule next retry
          const nextRetryMinutes = Math.pow(2, item.retry_count + 1); // Exponential backoff
          console.log('Retry queue update:', { nextRetryMinutes, itemId: item.id });
          this.db.exec(
            'UPDATE webhook_retry_queue SET retry_count = retry_count + 1, next_retry = datetime("now", "+" || ? || " minutes") WHERE id = ?',
            [nextRetryMinutes, item.id],
          );
        }
      }
    } catch (error: any) {
      console.error('Retry queue processing failed:', error);
    }
  }

  async getWebhookLogs(webhookId?: number, limit: number = 100): Promise<WebhookLog[]> {
    let sql = 'SELECT * FROM webhook_logs';
    const params: any[] = [];

    if (webhookId) {
      sql += ' WHERE webhook_id = ?';
      params.push(webhookId);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const logs = this.db.query<any>(sql, params);
    return logs.map(log => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : null,
    }));
  }

  private parseWebhook(webhook: any): Webhook {
    return {
      ...webhook,
      headers: webhook.headers ? JSON.parse(webhook.headers) : {},
      is_active: !!webhook.is_active,
      http_method: webhook.http_method as HttpMethod,
    };
  }
}
