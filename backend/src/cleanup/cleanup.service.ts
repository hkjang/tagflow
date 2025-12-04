import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CleanupLog } from '@shared/cleanup';

@Injectable()
export class CleanupService {
  constructor(private readonly db: DatabaseService) { }

  async cleanupOldData(adminId: number): Promise<CleanupLog> {
    try {
      let totalDeleted = 0;

      // Cleanup tag_events older than 1 year
      const tagEventsResult = this.db.exec(
        'DELETE FROM tag_events WHERE created_at < datetime("now", "-1 year")',
        [],
      );
      totalDeleted += tagEventsResult.changes;

      // Cleanup webhook_logs older than 90 days
      const webhookLogsResult = this.db.exec(
        'DELETE FROM webhook_logs WHERE created_at < datetime("now", "-90 days")',
        [],
      );
      totalDeleted += webhookLogsResult.changes;

      // Cleanup cleanup_logs older than 2 years
      const cleanupLogsResult = this.db.exec(
        'DELETE FROM cleanup_logs WHERE run_time < datetime("now", "-2 years")',
        [],
      );
      totalDeleted += cleanupLogsResult.changes;

      // Log successful cleanup
      const logResult = this.db.exec(
        'INSERT INTO cleanup_logs (admin_id, deleted_count, run_time) VALUES (?, ?, datetime("now"))',
        [adminId, totalDeleted],
      );

      const log = this.db.queryOne<CleanupLog>(
        'SELECT * FROM cleanup_logs WHERE id = ?',
        [logResult.lastInsertRowid],
      );

      console.log(`Cleanup completed: ${totalDeleted} records deleted`);
      if (!log) throw new Error('Failed to create cleanup log');
      return log;
    } catch (error: any) {
      // Log cleanup failure
      this.db.exec(
        'INSERT INTO cleanup_fail_logs (admin_id, error_message, run_time) VALUES (?, ?, datetime("now"))',
        [adminId, error.message],
      );

      console.error('Cleanup failed:', error);
      throw error;
    }
  }

  async getCleanupLogs(limit: number = 100): Promise<CleanupLog[]> {
    return this.db.query<CleanupLog>(
      'SELECT * FROM cleanup_logs ORDER BY run_time DESC LIMIT ?',
      [limit],
    );
  }

  async getCleanupFailLogs(limit: number = 100): Promise<any[]> {
    return this.db.query<any>(
      'SELECT * FROM cleanup_fail_logs ORDER BY run_time DESC LIMIT ?',
      [limit],
    );
  }

  async manualCleanup(adminId: number): Promise<CleanupLog> {
    return await this.cleanupOldData(adminId);
  }

  /**
   * Reset all tag events (complete table clear)
   */
  async resetTagEvents(adminId: number): Promise<{ deletedCount: number }> {
    try {
      const result = this.db.exec('DELETE FROM tag_events', []);

      // Log the reset action
      this.db.exec(
        'INSERT INTO cleanup_logs (admin_id, deleted_count, run_time) VALUES (?, ?, datetime("now"))',
        [adminId, result.changes],
      );

      console.log(`Tag events reset: ${result.changes} records deleted`);
      return { deletedCount: result.changes };
    } catch (error: any) {
      this.db.exec(
        'INSERT INTO cleanup_fail_logs (admin_id, error_message, run_time) VALUES (?, ?, datetime("now"))',
        [adminId, error.message],
      );
      console.error('Reset tag events failed:', error);
      throw error;
    }
  }

  /**
   * Reset all webhook logs (complete table clear)
   */
  async resetWebhookLogs(adminId: number): Promise<{ deletedCount: number }> {
    try {
      const result = this.db.exec('DELETE FROM webhook_logs', []);

      // Log the reset action
      this.db.exec(
        'INSERT INTO cleanup_logs (admin_id, deleted_count, run_time) VALUES (?, ?, datetime("now"))',
        [adminId, result.changes],
      );

      console.log(`Webhook logs reset: ${result.changes} records deleted`);
      return { deletedCount: result.changes };
    } catch (error: any) {
      this.db.exec(
        'INSERT INTO cleanup_fail_logs (admin_id, error_message, run_time) VALUES (?, ?, datetime("now"))',
        [adminId, error.message],
      );
      console.error('Reset webhook logs failed:', error);
      throw error;
    }
  }
}
