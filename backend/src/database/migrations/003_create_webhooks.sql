-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  http_method TEXT NOT NULL CHECK(http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  headers TEXT, -- JSON stored as text
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);
