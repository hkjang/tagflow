import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SettingsService {
    constructor(private readonly db: DatabaseService) { }

    async getAllSettings(): Promise<Record<string, string>> {
        const rows = this.db.query<any>('SELECT key, value FROM settings');
        const settings: Record<string, string> = {};
        for (const row of rows) {
            settings[row.key] = row.value;
        }
        return settings;
    }

    async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
        const keys = Object.keys(settings);
        if (keys.length === 0) return await this.getAllSettings();

        const placeholders = keys.map(() => '(?, ?, datetime("now"), datetime("now"))').join(', ');
        const values: any[] = [];

        for (const key of keys) {
            values.push(key, settings[key]);
        }

        // Upsert (Insert or Replace)
        // SQLite supports INSERT OR REPLACE
        for (const key of keys) {
            this.db.exec(
                `INSERT INTO settings (key, value, updated_at) 
             VALUES (?, ?, datetime("now")) 
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
                [key, settings[key]]
            );
        }

        return await this.getAllSettings();
    }

    async getSystemName(): Promise<string> {
        const row = this.db.queryOne<any>('SELECT value FROM settings WHERE key = ?', ['system_name']);
        return row ? row.value : 'TagFlow RFID System';
    }

    async getWebhookCardUidKey(): Promise<string> {
        const row = this.db.queryOne<any>('SELECT value FROM settings WHERE key = ?', ['webhook_card_uid_key']);
        return row ? row.value : 'card_uid';
    }
}
