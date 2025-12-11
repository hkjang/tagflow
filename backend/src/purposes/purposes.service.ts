import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
    TagPurpose,
    CreateTagPurposeDto,
    PurposeField,
    CreatePurposeFieldDto,
    PurposeWebhook,
    CreatePurposeWebhookDto,
    PurposeRule,
    CreatePurposeRuleDto,
    PurposeFollowup,
    CreatePurposeFollowupDto,
    PurposeLog,
    PurposeStats,
} from '@shared/purpose';

@Injectable()
export class PurposesService {
    constructor(private readonly db: DatabaseService) { }

    // ========== PURPOSE CRUD ==========

    async createPurpose(dto: CreateTagPurposeDto, userId?: number): Promise<TagPurpose> {
        const isActive = dto.is_active !== undefined ? dto.is_active : true;

        const result = this.db.exec(
            'INSERT INTO tag_purposes (name, type, description, is_active) VALUES (?, ?, ?, ?)',
            [dto.name, dto.type, dto.description || null, isActive ? 1 : 0]
        );

        const purpose = await this.getPurposeById(Number(result.lastInsertRowid));

        // Log creation
        this.logChange(purpose.id, 'CREATE', 'PURPOSE', purpose.id, null, purpose, userId);

        return purpose;
    }

    async getAllPurposes(): Promise<TagPurpose[]> {
        const purposes = this.db.query<any>('SELECT * FROM tag_purposes ORDER BY created_at DESC');
        return purposes.map(this.parsePurpose);
    }

    async getActivePurposes(): Promise<TagPurpose[]> {
        const purposes = this.db.query<any>('SELECT * FROM tag_purposes WHERE is_active = 1 ORDER BY name');
        return purposes.map(this.parsePurpose);
    }

    async getPurposeById(id: number): Promise<TagPurpose> {
        const purpose = this.db.queryOne<any>('SELECT * FROM tag_purposes WHERE id = ?', [id]);
        if (!purpose) {
            throw new Error('Purpose not found');
        }
        return this.parsePurpose(purpose);
    }

    async updatePurpose(id: number, updates: Partial<CreateTagPurposeDto>, userId?: number): Promise<TagPurpose> {
        const oldPurpose = await this.getPurposeById(id);

        const setParts: string[] = [];
        const params: any[] = [];

        if (updates.name !== undefined) {
            setParts.push('name = ?');
            params.push(updates.name);
        }

        if (updates.type !== undefined) {
            setParts.push('type = ?');
            params.push(updates.type);
        }

        if (updates.description !== undefined) {
            setParts.push('description = ?');
            params.push(updates.description);
        }

        if (updates.is_active !== undefined) {
            setParts.push('is_active = ?');
            params.push(updates.is_active ? 1 : 0);
        }

        if (setParts.length === 0) {
            return oldPurpose;
        }

        setParts.push('updated_at = datetime("now")');
        params.push(id);

        this.db.exec(
            `UPDATE tag_purposes SET ${setParts.join(', ')} WHERE id = ?`,
            params
        );

        const newPurpose = await this.getPurposeById(id);

        // Log update
        this.logChange(id, 'UPDATE', 'PURPOSE', id, oldPurpose, newPurpose, userId);

        return newPurpose;
    }

    async deletePurpose(id: number, userId?: number): Promise<void> {
        const purpose = await this.getPurposeById(id);

        this.db.exec('DELETE FROM tag_purposes WHERE id = ?', [id]);

        // Log deletion
        this.logChange(id, 'DELETE', 'PURPOSE', id, purpose, null, userId);
    }

    // ========== FIELDS CRUD ==========

    async getFieldsByPurposeId(purposeId: number): Promise<PurposeField[]> {
        const fields = this.db.query<any>(
            'SELECT * FROM purpose_fields WHERE purpose_id = ? ORDER BY sort_order',
            [purposeId]
        );
        return fields.map(this.parseField);
    }

    async createField(purposeId: number, dto: CreatePurposeFieldDto, userId?: number): Promise<PurposeField> {
        const isRequired = dto.is_required !== undefined ? dto.is_required : false;
        const sortOrder = dto.sort_order !== undefined ? dto.sort_order : 0;
        const options = dto.options ? JSON.stringify(dto.options) : null;

        const result = this.db.exec(
            'INSERT INTO purpose_fields (purpose_id, field_name, field_label, field_type, is_required, default_value, options, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [purposeId, dto.field_name, dto.field_label, dto.field_type, isRequired ? 1 : 0, dto.default_value || null, options, sortOrder]
        );

        const field = await this.getFieldById(Number(result.lastInsertRowid));

        this.logChange(purposeId, 'CREATE', 'FIELD', field.id, null, field, userId);

        return field;
    }

    async getFieldById(id: number): Promise<PurposeField> {
        const field = this.db.queryOne<any>('SELECT * FROM purpose_fields WHERE id = ?', [id]);
        if (!field) {
            throw new Error('Field not found');
        }
        return this.parseField(field);
    }

    async updateField(id: number, updates: Partial<CreatePurposeFieldDto>, userId?: number): Promise<PurposeField> {
        const oldField = await this.getFieldById(id);

        const setParts: string[] = [];
        const params: any[] = [];

        if (updates.field_name !== undefined) {
            setParts.push('field_name = ?');
            params.push(updates.field_name);
        }

        if (updates.field_label !== undefined) {
            setParts.push('field_label = ?');
            params.push(updates.field_label);
        }

        if (updates.field_type !== undefined) {
            setParts.push('field_type = ?');
            params.push(updates.field_type);
        }

        if (updates.is_required !== undefined) {
            setParts.push('is_required = ?');
            params.push(updates.is_required ? 1 : 0);
        }

        if (updates.default_value !== undefined) {
            setParts.push('default_value = ?');
            params.push(updates.default_value);
        }

        if (updates.options !== undefined) {
            setParts.push('options = ?');
            params.push(JSON.stringify(updates.options));
        }

        if (updates.sort_order !== undefined) {
            setParts.push('sort_order = ?');
            params.push(updates.sort_order);
        }

        if (setParts.length === 0) {
            return oldField;
        }

        params.push(id);
        this.db.exec(
            `UPDATE purpose_fields SET ${setParts.join(', ')} WHERE id = ?`,
            params
        );

        const newField = await this.getFieldById(id);

        this.logChange(oldField.purpose_id, 'UPDATE', 'FIELD', id, oldField, newField, userId);

        return newField;
    }

    async deleteField(id: number, userId?: number): Promise<void> {
        const field = await this.getFieldById(id);

        this.db.exec('DELETE FROM purpose_fields WHERE id = ?', [id]);

        this.logChange(field.purpose_id, 'DELETE', 'FIELD', id, field, null, userId);
    }

    // ========== PURPOSE WEBHOOKS CRUD ==========

    async getWebhooksByPurposeId(purposeId: number): Promise<PurposeWebhook[]> {
        const webhooks = this.db.query<any>(
            'SELECT * FROM purpose_webhooks WHERE purpose_id = ?',
            [purposeId]
        );
        return webhooks.map(this.parsePurposeWebhook);
    }

    async createPurposeWebhook(purposeId: number, dto: CreatePurposeWebhookDto, userId?: number): Promise<PurposeWebhook> {
        const isActive = dto.is_active !== undefined ? dto.is_active : true;
        const payloadSchema = dto.payload_schema ? JSON.stringify(dto.payload_schema) : null;
        const fieldMappings = dto.field_mappings ? JSON.stringify(dto.field_mappings) : null;

        const result = this.db.exec(
            'INSERT INTO purpose_webhooks (purpose_id, webhook_id, payload_schema, field_mappings, is_active) VALUES (?, ?, ?, ?, ?)',
            [purposeId, dto.webhook_id, payloadSchema, fieldMappings, isActive ? 1 : 0]
        );

        const pw = await this.getPurposeWebhookById(Number(result.lastInsertRowid));

        this.logChange(purposeId, 'CREATE', 'WEBHOOK', pw.id, null, pw, userId);

        return pw;
    }

    async getPurposeWebhookById(id: number): Promise<PurposeWebhook> {
        const pw = this.db.queryOne<any>('SELECT * FROM purpose_webhooks WHERE id = ?', [id]);
        if (!pw) {
            throw new Error('Purpose webhook not found');
        }
        return this.parsePurposeWebhook(pw);
    }

    async updatePurposeWebhook(id: number, updates: Partial<CreatePurposeWebhookDto>, userId?: number): Promise<PurposeWebhook> {
        const oldPw = await this.getPurposeWebhookById(id);

        const setParts: string[] = [];
        const params: any[] = [];

        if (updates.webhook_id !== undefined) {
            setParts.push('webhook_id = ?');
            params.push(updates.webhook_id);
        }

        if (updates.payload_schema !== undefined) {
            setParts.push('payload_schema = ?');
            params.push(JSON.stringify(updates.payload_schema));
        }

        if (updates.field_mappings !== undefined) {
            setParts.push('field_mappings = ?');
            params.push(JSON.stringify(updates.field_mappings));
        }

        if (updates.is_active !== undefined) {
            setParts.push('is_active = ?');
            params.push(updates.is_active ? 1 : 0);
        }

        if (setParts.length === 0) {
            return oldPw;
        }

        params.push(id);
        this.db.exec(
            `UPDATE purpose_webhooks SET ${setParts.join(', ')} WHERE id = ?`,
            params
        );

        const newPw = await this.getPurposeWebhookById(id);

        this.logChange(oldPw.purpose_id, 'UPDATE', 'WEBHOOK', id, oldPw, newPw, userId);

        return newPw;
    }

    async deletePurposeWebhook(id: number, userId?: number): Promise<void> {
        const pw = await this.getPurposeWebhookById(id);

        this.db.exec('DELETE FROM purpose_webhooks WHERE id = ?', [id]);

        this.logChange(pw.purpose_id, 'DELETE', 'WEBHOOK', id, pw, null, userId);
    }

    // ========== RULES CRUD ==========

    async getRulesByPurposeId(purposeId: number): Promise<PurposeRule[]> {
        const rules = this.db.query<any>(
            'SELECT * FROM purpose_rules WHERE purpose_id = ?',
            [purposeId]
        );
        return rules.map(this.parseRule);
    }

    async createRule(purposeId: number, dto: CreatePurposeRuleDto, userId?: number): Promise<PurposeRule> {
        const isActive = dto.is_active !== undefined ? dto.is_active : true;
        const ruleConfig = JSON.stringify(dto.rule_config);

        const result = this.db.exec(
            'INSERT INTO purpose_rules (purpose_id, rule_type, rule_config, is_active) VALUES (?, ?, ?, ?)',
            [purposeId, dto.rule_type, ruleConfig, isActive ? 1 : 0]
        );

        const rule = await this.getRuleById(Number(result.lastInsertRowid));

        this.logChange(purposeId, 'CREATE', 'RULE', rule.id, null, rule, userId);

        return rule;
    }

    async getRuleById(id: number): Promise<PurposeRule> {
        const rule = this.db.queryOne<any>('SELECT * FROM purpose_rules WHERE id = ?', [id]);
        if (!rule) {
            throw new Error('Rule not found');
        }
        return this.parseRule(rule);
    }

    async updateRule(id: number, updates: Partial<CreatePurposeRuleDto>, userId?: number): Promise<PurposeRule> {
        const oldRule = await this.getRuleById(id);

        const setParts: string[] = [];
        const params: any[] = [];

        if (updates.rule_type !== undefined) {
            setParts.push('rule_type = ?');
            params.push(updates.rule_type);
        }

        if (updates.rule_config !== undefined) {
            setParts.push('rule_config = ?');
            params.push(JSON.stringify(updates.rule_config));
        }

        if (updates.is_active !== undefined) {
            setParts.push('is_active = ?');
            params.push(updates.is_active ? 1 : 0);
        }

        if (setParts.length === 0) {
            return oldRule;
        }

        params.push(id);
        this.db.exec(
            `UPDATE purpose_rules SET ${setParts.join(', ')} WHERE id = ?`,
            params
        );

        const newRule = await this.getRuleById(id);

        this.logChange(oldRule.purpose_id, 'UPDATE', 'RULE', id, oldRule, newRule, userId);

        return newRule;
    }

    async deleteRule(id: number, userId?: number): Promise<void> {
        const rule = await this.getRuleById(id);

        this.db.exec('DELETE FROM purpose_rules WHERE id = ?', [id]);

        this.logChange(rule.purpose_id, 'DELETE', 'RULE', id, rule, null, userId);
    }

    // ========== FOLLOWUPS CRUD ==========

    async getFollowupsByPurposeId(purposeId: number): Promise<PurposeFollowup[]> {
        const followups = this.db.query<any>(
            'SELECT * FROM purpose_followups WHERE purpose_id = ? ORDER BY sort_order',
            [purposeId]
        );
        return followups.map(this.parseFollowup);
    }

    async createFollowup(purposeId: number, dto: CreatePurposeFollowupDto, userId?: number): Promise<PurposeFollowup> {
        const isActive = dto.is_active !== undefined ? dto.is_active : true;
        const sortOrder = dto.sort_order !== undefined ? dto.sort_order : 0;
        const actionConfig = JSON.stringify(dto.action_config);

        const result = this.db.exec(
            'INSERT INTO purpose_followups (purpose_id, action_type, action_config, sort_order, is_active) VALUES (?, ?, ?, ?, ?)',
            [purposeId, dto.action_type, actionConfig, sortOrder, isActive ? 1 : 0]
        );

        const followup = await this.getFollowupById(Number(result.lastInsertRowid));

        this.logChange(purposeId, 'CREATE', 'FOLLOWUP', followup.id, null, followup, userId);

        return followup;
    }

    async getFollowupById(id: number): Promise<PurposeFollowup> {
        const followup = this.db.queryOne<any>('SELECT * FROM purpose_followups WHERE id = ?', [id]);
        if (!followup) {
            throw new Error('Followup not found');
        }
        return this.parseFollowup(followup);
    }

    async updateFollowup(id: number, updates: Partial<CreatePurposeFollowupDto>, userId?: number): Promise<PurposeFollowup> {
        const oldFollowup = await this.getFollowupById(id);

        const setParts: string[] = [];
        const params: any[] = [];

        if (updates.action_type !== undefined) {
            setParts.push('action_type = ?');
            params.push(updates.action_type);
        }

        if (updates.action_config !== undefined) {
            setParts.push('action_config = ?');
            params.push(JSON.stringify(updates.action_config));
        }

        if (updates.sort_order !== undefined) {
            setParts.push('sort_order = ?');
            params.push(updates.sort_order);
        }

        if (updates.is_active !== undefined) {
            setParts.push('is_active = ?');
            params.push(updates.is_active ? 1 : 0);
        }

        if (setParts.length === 0) {
            return oldFollowup;
        }

        params.push(id);
        this.db.exec(
            `UPDATE purpose_followups SET ${setParts.join(', ')} WHERE id = ?`,
            params
        );

        const newFollowup = await this.getFollowupById(id);

        this.logChange(oldFollowup.purpose_id, 'UPDATE', 'FOLLOWUP', id, oldFollowup, newFollowup, userId);

        return newFollowup;
    }

    async deleteFollowup(id: number, userId?: number): Promise<void> {
        const followup = await this.getFollowupById(id);

        this.db.exec('DELETE FROM purpose_followups WHERE id = ?', [id]);

        this.logChange(followup.purpose_id, 'DELETE', 'FOLLOWUP', id, followup, null, userId);
    }

    // ========== LOGS ==========

    async getLogs(filters?: { purposeId?: number; entityType?: string; limit?: number }): Promise<PurposeLog[]> {
        let sql = 'SELECT * FROM purpose_logs WHERE 1=1';
        const params: any[] = [];

        if (filters?.purposeId) {
            sql += ' AND purpose_id = ?';
            params.push(filters.purposeId);
        }

        if (filters?.entityType) {
            sql += ' AND entity_type = ?';
            params.push(filters.entityType);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters?.limit) {
            sql += ' LIMIT ?';
            params.push(filters.limit);
        }

        const logs = this.db.query<any>(sql, params);
        return logs.map(this.parseLog);
    }

    // ========== STATS ==========

    async getPurposeStats(purposeId?: number): Promise<PurposeStats[]> {
        let sql = `
      SELECT 
        p.id as purpose_id,
        p.name as purpose_name,
        COUNT(e.id) as total_events,
        SUM(CASE WHEN date(e.event_time) = date('now') THEN 1 ELSE 0 END) as events_today,
        SUM(CASE WHEN e.event_time >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as events_this_week,
        SUM(CASE WHEN e.event_time >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as events_this_month
      FROM tag_purposes p
      LEFT JOIN tag_events e ON e.purpose_id = p.id
    `;

        const params: any[] = [];

        if (purposeId) {
            sql += ' WHERE p.id = ?';
            params.push(purposeId);
        }

        sql += ' GROUP BY p.id, p.name';

        const stats = this.db.query<any>(sql, params);
        return stats.map(s => ({
            purpose_id: s.purpose_id,
            purpose_name: s.purpose_name,
            total_events: s.total_events || 0,
            events_today: s.events_today || 0,
            events_this_week: s.events_this_week || 0,
            events_this_month: s.events_this_month || 0,
        }));
    }

    // ========== VALIDATION ==========

    async validatePurposeData(purposeId: number, data: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
        const fields = await this.getFieldsByPurposeId(purposeId);
        const errors: string[] = [];

        for (const field of fields) {
            const value = data[field.field_name];

            // Check required fields
            if (field.is_required && (value === undefined || value === null || value === '')) {
                errors.push(`Field '${field.field_label}' is required`);
                continue;
            }

            if (value === undefined || value === null) continue;

            // Type validation
            switch (field.field_type) {
                case 'number':
                    if (isNaN(Number(value))) {
                        errors.push(`Field '${field.field_label}' must be a number`);
                    }
                    break;
                case 'date':
                    if (isNaN(Date.parse(value))) {
                        errors.push(`Field '${field.field_label}' must be a valid date`);
                    }
                    break;
                case 'select':
                    if (field.options && !field.options.includes(value)) {
                        errors.push(`Field '${field.field_label}' must be one of: ${field.options.join(', ')}`);
                    }
                    break;
            }
        }

        return { valid: errors.length === 0, errors };
    }

    // ========== PRIVATE HELPERS ==========

    private logChange(
        purposeId: number | null,
        action: 'CREATE' | 'UPDATE' | 'DELETE',
        entityType: string,
        entityId: number | null,
        oldValue: any,
        newValue: any,
        userId?: number
    ): void {
        try {
            this.db.exec(
                'INSERT INTO purpose_logs (purpose_id, action, entity_type, entity_id, old_value, new_value, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    purposeId,
                    action,
                    entityType,
                    entityId,
                    oldValue ? JSON.stringify(oldValue) : null,
                    newValue ? JSON.stringify(newValue) : null,
                    userId || null,
                ]
            );
        } catch (error) {
            console.error('Failed to log purpose change:', error);
        }
    }

    private parsePurpose(purpose: any): TagPurpose {
        return {
            ...purpose,
            is_active: !!purpose.is_active,
        };
    }

    private parseField(field: any): PurposeField {
        return {
            ...field,
            is_required: !!field.is_required,
            options: field.options ? JSON.parse(field.options) : undefined,
        };
    }

    private parsePurposeWebhook(pw: any): PurposeWebhook {
        return {
            ...pw,
            is_active: !!pw.is_active,
            payload_schema: pw.payload_schema ? JSON.parse(pw.payload_schema) : undefined,
            field_mappings: pw.field_mappings ? JSON.parse(pw.field_mappings) : undefined,
        };
    }

    private parseRule(rule: any): PurposeRule {
        return {
            ...rule,
            is_active: !!rule.is_active,
            rule_config: JSON.parse(rule.rule_config),
        };
    }

    private parseFollowup(followup: any): PurposeFollowup {
        return {
            ...followup,
            is_active: !!followup.is_active,
            action_config: JSON.parse(followup.action_config),
        };
    }

    private parseLog(log: any): PurposeLog {
        return {
            ...log,
            old_value: log.old_value || undefined,
            new_value: log.new_value || undefined,
        };
    }
}
