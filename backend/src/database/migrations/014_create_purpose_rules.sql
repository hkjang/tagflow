-- Create purpose_rules table
CREATE TABLE IF NOT EXISTS purpose_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purpose_id INTEGER NOT NULL,
  rule_type TEXT NOT NULL CHECK(rule_type IN ('TIME_WINDOW', 'USER_GROUP', 'DUPLICATE_POLICY')),
  rule_config TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purpose_id) REFERENCES tag_purposes(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purpose_rules_purpose_id ON purpose_rules(purpose_id);
CREATE INDEX IF NOT EXISTS idx_purpose_rules_rule_type ON purpose_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_purpose_rules_is_active ON purpose_rules(is_active);
