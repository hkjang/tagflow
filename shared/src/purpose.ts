export enum PurposeType {
    ATTENDANCE = 'ATTENDANCE',  // 교육 출결
    ACCESS = 'ACCESS',          // 출입 관리
    FACILITY = 'FACILITY',      // 시설 이용
    RESERVATION = 'RESERVATION' // 예약 관리
}

export interface TagPurpose {
    id: number;
    name: string;
    type: PurposeType;
    description?: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateTagPurposeDto {
    name: string;
    type: PurposeType;
    description?: string;
    is_active?: boolean;
}

export type FieldType = 'string' | 'number' | 'date' | 'select';

export interface PurposeField {
    id: number;
    purpose_id: number;
    field_name: string;
    field_label: string;
    field_type: FieldType;
    is_required: boolean;
    default_value?: string;
    options?: string[];
    sort_order: number;
    created_at?: Date;
}

export interface CreatePurposeFieldDto {
    field_name: string;
    field_label: string;
    field_type: FieldType;
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
    created_at?: Date;
}

export interface CreatePurposeWebhookDto {
    webhook_id: number;
    payload_schema?: Record<string, any>;
    field_mappings?: Record<string, string>;
    is_active?: boolean;
}

export type RuleType = 'TIME_WINDOW' | 'USER_GROUP' | 'DUPLICATE_POLICY';

export interface TimeWindowRuleConfig {
    start_time: string; // HH:mm format
    end_time: string;   // HH:mm format
    days_of_week?: number[]; // 0=Sunday, 1=Monday, etc.
}

export interface UserGroupRuleConfig {
    allowed_roles: string[];
}

export interface DuplicatePolicyConfig {
    window_minutes: number;
    allow_duplicate: boolean;
}

export interface PurposeRule {
    id: number;
    purpose_id: number;
    rule_type: RuleType;
    rule_config: TimeWindowRuleConfig | UserGroupRuleConfig | DuplicatePolicyConfig;
    is_active: boolean;
    created_at?: Date;
}

export interface CreatePurposeRuleDto {
    rule_type: RuleType;
    rule_config: TimeWindowRuleConfig | UserGroupRuleConfig | DuplicatePolicyConfig;
    is_active?: boolean;
}

export type ActionType = 'NOTIFICATION' | 'APPROVAL' | 'API_CALL';

export interface NotificationActionConfig {
    message_template: string;
    recipients?: string[];
}

export interface ApprovalActionConfig {
    approver_roles: string[];
    timeout_minutes?: number;
}

export interface ApiCallActionConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body_template?: string;
}

export interface PurposeFollowup {
    id: number;
    purpose_id: number;
    action_type: ActionType;
    action_config: NotificationActionConfig | ApprovalActionConfig | ApiCallActionConfig;
    sort_order: number;
    is_active: boolean;
    created_at?: Date;
}

export interface CreatePurposeFollowupDto {
    action_type: ActionType;
    action_config: NotificationActionConfig | ApprovalActionConfig | ApiCallActionConfig;
    sort_order?: number;
    is_active?: boolean;
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
    created_at?: Date;
}

export interface PurposeStats {
    purpose_id: number;
    purpose_name: string;
    total_events: number;
    events_today: number;
    events_this_week: number;
    events_this_month: number;
}
