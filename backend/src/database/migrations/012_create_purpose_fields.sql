-- Create purpose_fields table
CREATE TABLE IF NOT EXISTS purpose_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  purpose_id INTEGER NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK(field_type IN ('string', 'number', 'date', 'select')),
  is_required INTEGER DEFAULT 0,
  default_value TEXT,
  options TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purpose_id) REFERENCES tag_purposes(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purpose_fields_purpose_id ON purpose_fields(purpose_id);
CREATE INDEX IF NOT EXISTS idx_purpose_fields_sort_order ON purpose_fields(sort_order);
