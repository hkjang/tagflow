export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export interface Webhook {
  id: number;
  name: string;
  target_url: string;
  http_method: HttpMethod;
  headers: Record<string, string>;
  is_active: boolean;
  created_at?: Date;
}

export interface WebhookMapping {
  id: number;
  webhook_id: number;
  from_key: string;
  to_key: string;
}

export interface WebhookLog {
  id: number;
  webhook_id: number;
  payload: Record<string, any>;
  response_status: number;
  response_body?: string;
  error_message?: string;
  created_at: Date;
}

export interface CreateWebhookDto {
  name: string;
  target_url: string;
  http_method: HttpMethod;
  headers?: Record<string, string>;
  is_active?: boolean;
}

export interface CreateWebhookMappingDto {
  webhook_id: number;
  from_key: string;
  to_key: string;
}
