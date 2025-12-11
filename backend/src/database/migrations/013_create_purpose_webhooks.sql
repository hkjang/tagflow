-- Create purpose_webhooks table (links purposes to webhooks with custom settings)
CREATE TABLE IF NOT EXISTS purpose_webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purpose_id INTEGER NOT NULL,
  webhook_id INTEGER NOT NULL,
  payload_schema TEXT,
  field_mappings TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purpose_id) REFERENCES tag_purposes(id) ON DELETE CASCADE,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
  UNIQUE(purpose_id, webhook_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purpose_webhooks_purpose_id ON purpose_webhooks(purpose_id);
CREATE INDEX IF NOT EXISTS idx_purpose_webhooks_webhook_id ON purpose_webhooks(webhook_id);
CREATE INDEX IF NOT EXISTS idx_purpose_webhooks_is_active ON purpose_webhooks(is_active);
