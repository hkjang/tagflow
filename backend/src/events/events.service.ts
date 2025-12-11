import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TagEvent, CreateTagEventDto } from '@shared/event';

import { SettingsService } from '../settings/settings.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly settingsService: SettingsService,
  ) { }

  async createEvent(dto: CreateTagEventDto, sourceIp?: string): Promise<TagEvent | null> {
    const ip = dto.source_ip || sourceIp || '127.0.0.1';

    // Check for throttling
    const throttleTime = await this.settingsService.getThrottleTime();
    if (throttleTime > 0) {
      const timeWindow = new Date(Date.now() - throttleTime * 60 * 1000).toISOString();
      // Use datetime() function to normalize both timestamps for proper comparison
      // This handles timezone differences between stored event_time and calculated timeWindow
      const existingEvent = this.db.queryOne<TagEvent>(
        'SELECT * FROM tag_events WHERE card_uid = ? AND datetime(event_time) >= datetime(?) LIMIT 1',
        [dto.card_uid, timeWindow]
      );

      if (existingEvent) {
        console.log(`Event throttled for card ${dto.card_uid}. Last event: ${existingEvent.event_time}, timeWindow: ${timeWindow}`);
        return null;
      }
    }

    // Retry logic for SQLite busy errors
    let retries = 3;
    let lastError: Error = new Error('Unknown error');

    while (retries > 0) {
      try {
        console.log('Creating event with:', { card_uid: dto.card_uid, ip, event_time: dto.event_time, purpose_id: dto.purpose_id });

        let sql: string;
        let params: any[];
        const purposeData = dto.purpose_data ? JSON.stringify(dto.purpose_data) : null;

        if (dto.event_time) {
          // Use client-provided timestamp
          sql = 'INSERT INTO tag_events (card_uid, event_time, source_ip, processed_flag, purpose_id, purpose_data) VALUES (?, ?, ?, 0, ?, ?)';
          params = [dto.card_uid, dto.event_time, ip, dto.purpose_id || null, purposeData];
        } else {
          // Fallback to server timestamp for backward compatibility
          sql = 'INSERT INTO tag_events (card_uid, event_time, source_ip, processed_flag, purpose_id, purpose_data) VALUES (?, CURRENT_TIMESTAMP, ?, 0, ?, ?)';
          params = [dto.card_uid, ip, dto.purpose_id || null, purposeData];
        }

        const result = this.db.exec(sql, params);

        console.log('Insert result:', result);
        console.log('Last insert rowid:', result.lastInsertRowid);

        const event = this.db.queryOne<any>(
          'SELECT * FROM tag_events WHERE id = ?',
          [result.lastInsertRowid],
        );

        console.log('Queried event:', event);

        if (!event) {
          console.error('Failed to retrieve event after insert. Trying to get latest event...');
          // Fallback: try to get the most recent event
          const latestEvent = this.db.queryOne<any>(
            'SELECT * FROM tag_events ORDER BY id DESC LIMIT 1'
          );
          console.log('Latest event:', latestEvent);
          if (latestEvent) {
            return this.parseEvent(latestEvent);
          }
          throw new Error('Failed to create event');
        }
        return this.parseEvent(event);
      } catch (error: any) {
        console.error('Event creation error:', error);
        lastError = error;
        if (error.message?.includes('BUSY') && retries > 1) {
          retries--;
          await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retry
          continue;
        }
        throw error;
      }
    }

    throw lastError;
  }

  async getEvents(filter?: {
    startDate?: string;
    endDate?: string;
    card_uid?: string;
    purpose_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: TagEvent[]; total: number }> {
    const page = filter?.page || 1;
    const limit = filter?.limit || 50;
    const offset = (page - 1) * limit;

    let sql = 'SELECT * FROM tag_events WHERE 1=1';
    const params: any[] = [];

    if (filter?.startDate) {
      sql += ' AND event_time >= ?';
      params.push(filter.startDate);
    }

    if (filter?.endDate) {
      sql += ' AND event_time <= ?';
      params.push(filter.endDate);
    }

    if (filter?.card_uid) {
      sql += ' AND card_uid LIKE ?';
      params.push(`%${filter.card_uid}%`);
    }

    if (filter?.purpose_id) {
      sql += ' AND purpose_id = ?';
      params.push(filter.purpose_id);
    }

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = this.db.queryOne<{ count: number }>(countSql, params);
    const total = countResult?.count || 0;

    // Get paginated data
    sql += ' ORDER BY event_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const data = this.db.query<any>(sql, params);

    return { data: data.map(this.parseEvent), total };
  }

  async getEventById(id: number): Promise<TagEvent | undefined> {
    const event = this.db.queryOne<any>('SELECT * FROM tag_events WHERE id = ?', [id]);
    return event ? this.parseEvent(event) : undefined;
  }

  async markAsProcessed(id: number): Promise<void> {
    this.db.exec('UPDATE tag_events SET processed_flag = 1 WHERE id = ?', [id]);
  }

  private parseEvent(event: any): TagEvent {
    return {
      ...event,
      processed_flag: !!event.processed_flag,
      purpose_data: event.purpose_data ? JSON.parse(event.purpose_data) : undefined,
    };
  }
}
