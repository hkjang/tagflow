-- Create webhook_mappings table
CREATE TABLE IF NOT EXISTS webhook_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id INTEGER NOT NULL,
  from_key TEXT NOT NULL,
  to_key TEXT NOT NULL,
  FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhook_mappings_webhook_id ON webhook_mappings(webhook_id);
