export interface TagEvent {
  id: number;
  card_uid: string;
  event_time: Date;
  source_ip: string;
  processed_flag: boolean;
  created_at: Date;
}

export interface CreateTagEventDto {
  card_uid: string;
  source_ip?: string;
}

export interface TagEventFilter {
  startDate?: Date;
  endDate?: Date;
  card_uid?: string;
  page?: number;
  limit?: number;
}
