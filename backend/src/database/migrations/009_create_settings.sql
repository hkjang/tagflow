-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values
INSERT OR IGNORE INTO settings (key, value) VALUES ('system_name', 'TagFlow RFID System');
INSERT OR IGNORE INTO settings (key, value) VALUES ('webhook_card_uid_key', 'card_uid');
