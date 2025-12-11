export interface TagEvent {
  id: number;
  card_uid: string;
  event_time: Date;
  source_ip: string;
  processed_flag: boolean;
  purpose_id?: number;
  purpose_data?: Record<string, any>;
  created_at: Date;
}

export interface CreateTagEventDto {
  card_uid: string;
  source_ip?: string;
  event_time?: string; // ISO 8601 format from client
  purpose_id?: number;
  purpose_data?: Record<string, any>;
}


export interface TagEventFilter {
  startDate?: Date;
  endDate?: Date;
  card_uid?: string;
  purpose_id?: number;
  page?: number;
  limit?: number;
}
