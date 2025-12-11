import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface TagPurpose {
    id: number;
    name: string;
    type: 'ATTENDANCE' | 'ACCESS' | 'FACILITY' | 'RESERVATION';
    description?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreatePurposeDto {
    name: string;
    type: 'ATTENDANCE' | 'ACCESS' | 'FACILITY' | 'RESERVATION';
    description?: string;
    is_active?: boolean;
}

export interface PurposeField {
    id: number;
    purpose_id: number;
    field_name: string;
    field_label: string;
    field_type: 'string' | 'number' | 'date' | 'select';
    is_required: boolean;
    default_value?: string;
    options?: string[];
    sort_order: number;
}

export interface CreateFieldDto {
    field_name: string;
    field_label: string;
    field_type: 'string' | 'number' | 'date' | 'select';
    is_required?: boolean;
    default_value?: string;
    options?: string[];
    sort_order?: number;
}

export interface PurposeWebhook {
    id: number;
    purpose_id: number;
    webhook_id: number;
    payload_schema?: Record<string, any>;
    field_mappings?: Record<string, string>;
    is_active: boolean;
}

export interface CreatePurposeWebhookDto {
    webhook_id: number;
    payload_schema?: Record<string, any>;
    field_mappings?: Record<string, string>;
    is_active?: boolean;
}

export interface PurposeRule {
    id: number;
    purpose_id: number;
    rule_type: 'TIME_WINDOW' | 'USER_GROUP' | 'DUPLICATE_POLICY';
    rule_config: Record<string, any>;
    is_active: boolean;
}

export interface CreateRuleDto {
    rule_type: 'TIME_WINDOW' | 'USER_GROUP' | 'DUPLICATE_POLICY';
    rule_config: Record<string, any>;
    is_active?: boolean;
}

export interface PurposeFollowup {
    id: number;
    purpose_id: number;
    action_type: 'NOTIFICATION' | 'APPROVAL' | 'API_CALL';
    action_config: Record<string, any>;
    sort_order: number;
    is_active: boolean;
}

export interface CreateFollowupDto {
    action_type: 'NOTIFICATION' | 'APPROVAL' | 'API_CALL';
    action_config: Record<string, any>;
    sort_order?: number;
    is_active?: boolean;
}

export interface PurposeStats {
    purpose_id: number;
    purpose_name: string;
    total_events: number;
    events_today: number;
    events_this_week: number;
    events_this_month: number;
}

export interface PurposeLog {
    id: number;
    purpose_id?: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity_type: 'PURPOSE' | 'FIELD' | 'WEBHOOK' | 'RULE' | 'FOLLOWUP';
    entity_id?: number;
    old_value?: string;
    new_value?: string;
    user_id?: number;
    created_at?: string;
}

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return { Authorization: `Bearer ${token}` };
};

export const purposeService = {
    // ========== PURPOSES ==========
    async getAllPurposes(): Promise<TagPurpose[]> {
        const response = await axios.get(`${API_URL}/purposes`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async getActivePurposes(): Promise<TagPurpose[]> {
        const response = await axios.get(`${API_URL}/purposes/active`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async getPurposeById(id: number): Promise<TagPurpose> {
        const response = await axios.get(`${API_URL}/purposes/${id}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async createPurpose(data: CreatePurposeDto): Promise<TagPurpose> {
        const response = await axios.post(`${API_URL}/purposes`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async updatePurpose(id: number, data: Partial<CreatePurposeDto>): Promise<TagPurpose> {
        const response = await axios.put(`${API_URL}/purposes/${id}`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async deletePurpose(id: number): Promise<void> {
        await axios.delete(`${API_URL}/purposes/${id}`, {
            headers: getAuthHeader(),
        });
    },

    // ========== FIELDS ==========
    async getFields(purposeId: number): Promise<PurposeField[]> {
        const response = await axios.get(`${API_URL}/purposes/${purposeId}/fields`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async createField(purposeId: number, data: CreateFieldDto): Promise<PurposeField> {
        const response = await axios.post(`${API_URL}/purposes/${purposeId}/fields`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async updateField(fieldId: number, data: Partial<CreateFieldDto>): Promise<PurposeField> {
        const response = await axios.put(`${API_URL}/purposes/fields/${fieldId}`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async deleteField(fieldId: number): Promise<void> {
        await axios.delete(`${API_URL}/purposes/fields/${fieldId}`, {
            headers: getAuthHeader(),
        });
    },

    // ========== WEBHOOKS ==========
    async getWebhooks(purposeId: number): Promise<PurposeWebhook[]> {
        const response = await axios.get(`${API_URL}/purposes/${purposeId}/webhooks`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async createWebhook(purposeId: number, data: CreatePurposeWebhookDto): Promise<PurposeWebhook> {
        const response = await axios.post(`${API_URL}/purposes/${purposeId}/webhooks`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async updateWebhook(pwId: number, data: Partial<CreatePurposeWebhookDto>): Promise<PurposeWebhook> {
        const response = await axios.put(`${API_URL}/purposes/webhooks/${pwId}`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async deleteWebhook(pwId: number): Promise<void> {
        await axios.delete(`${API_URL}/purposes/webhooks/${pwId}`, {
            headers: getAuthHeader(),
        });
    },

    // ========== RULES ==========
    async getRules(purposeId: number): Promise<PurposeRule[]> {
        const response = await axios.get(`${API_URL}/purposes/${purposeId}/rules`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async createRule(purposeId: number, data: CreateRuleDto): Promise<PurposeRule> {
        const response = await axios.post(`${API_URL}/purposes/${purposeId}/rules`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async updateRule(ruleId: number, data: Partial<CreateRuleDto>): Promise<PurposeRule> {
        const response = await axios.put(`${API_URL}/purposes/rules/${ruleId}`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async deleteRule(ruleId: number): Promise<void> {
        await axios.delete(`${API_URL}/purposes/rules/${ruleId}`, {
            headers: getAuthHeader(),
        });
    },

    // ========== FOLLOWUPS ==========
    async getFollowups(purposeId: number): Promise<PurposeFollowup[]> {
        const response = await axios.get(`${API_URL}/purposes/${purposeId}/followups`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async createFollowup(purposeId: number, data: CreateFollowupDto): Promise<PurposeFollowup> {
        const response = await axios.post(`${API_URL}/purposes/${purposeId}/followups`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async updateFollowup(followupId: number, data: Partial<CreateFollowupDto>): Promise<PurposeFollowup> {
        const response = await axios.put(`${API_URL}/purposes/followups/${followupId}`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async deleteFollowup(followupId: number): Promise<void> {
        await axios.delete(`${API_URL}/purposes/followups/${followupId}`, {
            headers: getAuthHeader(),
        });
    },

    // ========== STATS & LOGS ==========
    async getAllStats(): Promise<PurposeStats[]> {
        const response = await axios.get(`${API_URL}/purposes/stats`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async getPurposeStats(purposeId: number): Promise<PurposeStats | null> {
        const response = await axios.get(`${API_URL}/purposes/${purposeId}/stats`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    async getLogs(filters?: { purposeId?: number; entityType?: string; limit?: number }): Promise<PurposeLog[]> {
        const params = new URLSearchParams();
        if (filters?.purposeId) params.append('purposeId', filters.purposeId.toString());
        if (filters?.entityType) params.append('entityType', filters.entityType);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await axios.get(`${API_URL}/purposes/logs?${params.toString()}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    },

    // ========== VALIDATION ==========
    async validateData(purposeId: number, data: Record<string, any>): Promise<{ valid: boolean; errors: string[] }> {
        const response = await axios.post(`${API_URL}/purposes/${purposeId}/validate`, data, {
            headers: getAuthHeader(),
        });
        return response.data;
    },
};
