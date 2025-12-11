-- Create tag_purposes table
CREATE TABLE IF NOT EXISTS tag_purposes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK(type IN ('ATTENDANCE', 'ACCESS', 'FACILITY', 'RESERVATION')),
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tag_purposes_type ON tag_purposes(type);
CREATE INDEX IF NOT EXISTS idx_tag_purposes_is_active ON tag_purposes(is_active);
