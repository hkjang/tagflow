-- Create cleanup_fail_logs table
CREATE TABLE IF NOT EXISTS cleanup_fail_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  error_message TEXT NOT NULL,
  run_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_cleanup_fail_logs_admin_id ON cleanup_fail_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_cleanup_fail_logs_run_time ON cleanup_fail_logs(run_time);
