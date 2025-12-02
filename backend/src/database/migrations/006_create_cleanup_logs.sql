-- Create cleanup_logs table
CREATE TABLE IF NOT EXISTS cleanup_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  deleted_count INTEGER NOT NULL,
  run_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cleanup_logs_admin_id ON cleanup_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_logs_run_time ON cleanup_logs(run_time);
