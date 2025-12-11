-- Create purpose_logs table for audit trail
CREATE TABLE IF NOT EXISTS purpose_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purpose_id INTEGER,
  action TEXT NOT NULL CHECK(action IN ('CREATE', 'UPDATE', 'DELETE')),
  entity_type TEXT NOT NULL CHECK(entity_type IN ('PURPOSE', 'FIELD', 'WEBHOOK', 'RULE', 'FOLLOWUP')),
  entity_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purpose_logs_purpose_id ON purpose_logs(purpose_id);
CREATE INDEX IF NOT EXISTS idx_purpose_logs_action ON purpose_logs(action);
CREATE INDEX IF NOT EXISTS idx_purpose_logs_entity_type ON purpose_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_purpose_logs_created_at ON purpose_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_purpose_logs_user_id ON purpose_logs(user_id);
