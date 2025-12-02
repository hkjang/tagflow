-- Create tag_events table
CREATE TABLE IF NOT EXISTS tag_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_uid TEXT NOT NULL,
  event_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source_ip TEXT,
  processed_flag INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tag_events_card_uid ON tag_events(card_uid);
CREATE INDEX IF NOT EXISTS idx_tag_events_event_time ON tag_events(event_time);
CREATE INDEX IF NOT EXISTS idx_tag_events_created_at ON tag_events(created_at);
CREATE INDEX IF NOT EXISTS idx_tag_events_processed_flag ON tag_events(processed_flag);
