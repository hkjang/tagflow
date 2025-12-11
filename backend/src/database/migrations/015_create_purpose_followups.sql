-- Create purpose_followups table
CREATE TABLE IF NOT EXISTS purpose_followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purpose_id INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK(action_type IN ('NOTIFICATION', 'APPROVAL', 'API_CALL')),
  action_config TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purpose_id) REFERENCES tag_purposes(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purpose_followups_purpose_id ON purpose_followups(purpose_id);
CREATE INDEX IF NOT EXISTS idx_purpose_followups_action_type ON purpose_followups(action_type);
CREATE INDEX IF NOT EXISTS idx_purpose_followups_is_active ON purpose_followups(is_active);
