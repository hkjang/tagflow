CREATE TABLE IF NOT EXISTS webhook_retry_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id INTEGER,
  payload TEXT,
  retry_count INTEGER DEFAULT 0,
  next_retry DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
