import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TagEvent, CreateTagEventDto } from '@shared/event';

@Injectable()
export class EventsService {
  constructor(private readonly db: DatabaseService) { }

  async createEvent(dto: CreateTagEventDto, sourceIp?: string): Promise<TagEvent> {
    const ip = dto.source_ip || sourceIp || '127.0.0.1';

    // Retry logic for SQLite busy errors
    let retries = 3;
    let lastError: Error = new Error('Unknown error');

    while (retries > 0) {
      try {
        console.log('Creating event with:', { card_uid: dto.card_uid, ip });
        const result = this.db.exec(
          'INSERT INTO tag_events (card_uid, event_time, source_ip, processed_flag) VALUES (?, CURRENT_TIMESTAMP, ?, 0)',
          [dto.card_uid, ip],
        );

        console.log('Insert result:', result);
        console.log('Last insert rowid:', result.lastInsertRowid);

        const event = this.db.queryOne<TagEvent>(
          'SELECT * FROM tag_events WHERE id = ?',
          [result.lastInsertRowid],
        );

        console.log('Queried event:', event);

        if (!event) {
          console.error('Failed to retrieve event after insert. Trying to get latest event...');
          // Fallback: try to get the most recent event
          const latestEvent = this.db.queryOne<TagEvent>(
            'SELECT * FROM tag_events ORDER BY id DESC LIMIT 1'
          );
          console.log('Latest event:', latestEvent);
          if (latestEvent) {
            return latestEvent;
          }
          throw new Error('Failed to create event');
        }
        return event;
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

    // Get total count
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as count');
    const countResult = this.db.queryOne<{ count: number }>(countSql, params);
    const total = countResult?.count || 0;

    // Get paginated data
    sql += ' ORDER BY event_time DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const data = this.db.query<TagEvent>(sql, params);

    return { data, total };
  }

  async getEventById(id: number): Promise<TagEvent | undefined> {
    return this.db.queryOne<TagEvent>('SELECT * FROM tag_events WHERE id = ?', [id]);
  }

  async markAsProcessed(id: number): Promise<void> {
    this.db.exec('UPDATE tag_events SET processed_flag = 1 WHERE id = ?', [id]);
  }
}
