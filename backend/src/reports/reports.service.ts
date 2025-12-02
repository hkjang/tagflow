import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async getEventStatistics(startDate?: string, endDate?: string): Promise<any> {
    let sql = 'SELECT COUNT(*) as total, COUNT(DISTINCT card_uid) as unique_cards FROM tag_events WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      sql += ' AND event_time >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND event_time <= ?';
      params.push(endDate);
    }

    const stats = this.db.queryOne<any>(sql, params);

    // Get top cards
    let topCardsSql = 'SELECT card_uid, COUNT(*) as count FROM tag_events WHERE 1=1';
    const topCardsParams: any[] = [];

    if (startDate) {
      topCardsSql += ' AND event_time >= ?';
      topCardsParams.push(startDate);
    }

    if (endDate) {
      topCardsSql += ' AND event_time <= ?';
      topCardsParams.push(endDate);
    }

    topCardsSql += ' GROUP BY card_uid ORDER BY count DESC LIMIT 10';
    const topCards = this.db.query<any>(topCardsSql, topCardsParams);

    // Get events by day
    let eventsByDaySql = 'SELECT DATE(event_time) as date, COUNT(*) as count FROM tag_events WHERE 1=1';
    const eventsByDayParams: any[] = [];

    if (startDate) {
      eventsByDaySql += ' AND event_time >= ?';
      eventsByDayParams.push(startDate);
    }

    if (endDate) {
      eventsByDaySql += ' AND event_time <= ?';
      eventsByDayParams.push(endDate);
    }

    eventsByDaySql += ' GROUP BY DATE(event_time) ORDER BY date DESC LIMIT 30';
    const eventsByDay = this.db.query<any>(eventsByDaySql, eventsByDayParams);

    return {
      ...stats,
      topCards,
      eventsByDay,
    };
  }

  async getWebhookStatistics(): Promise<any> {
    const totalWebhooks = this.db.queryOne<any>('SELECT COUNT(*) as count FROM webhooks', []);
    const activeWebhooks = this.db.queryOne<any>('SELECT COUNT(*) as count FROM webhooks WHERE is_active = 1', []);

    const logStats = this.db.queryOne<any>(
      `SELECT 
        COUNT(*) as total_calls,
        SUM(CASE WHEN response_status >= 200 AND response_status < 300 THEN 1 ELSE 0 END) as successful_calls,
        SUM(CASE WHEN response_status >= 400 OR response_status = 0 THEN 1 ELSE 0 END) as failed_calls
      FROM webhook_logs
      WHERE created_at >= datetime('now', '-30 days')`,
      [],
    );

    const webhookPerformance = this.db.query<any>(
      `SELECT 
        w.id,
        w.name,
        COUNT(wl.id) as total_calls,
        SUM(CASE WHEN wl.response_status >= 200 AND wl.response_status < 300 THEN 1 ELSE 0 END) as successful_calls,
        SUM(CASE WHEN wl.response_status >= 400 OR wl.response_status = 0 THEN 1 ELSE 0 END) as failed_calls
      FROM webhooks w
      LEFT JOIN webhook_logs wl ON w.id = wl.webhook_id AND wl.created_at >= datetime('now', '-30 days')
      GROUP BY w.id, w.name`,
      [],
    );

    return {
      totalWebhooks: totalWebhooks.count,
      activeWebhooks: activeWebhooks.count,
      ...logStats,
      webhookPerformance,
    };
  }

  async exportEvents(startDate?: string, endDate?: string): Promise<any[]> {
    let sql = 'SELECT * FROM tag_events WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      sql += ' AND event_time >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND event_time <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY event_time DESC LIMIT 10000';
    
    return this.db.query<any>(sql, params);
  }
}
