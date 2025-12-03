-- Seed initial admin user
-- Password: admin123 (bcrypt hash)
INSERT OR IGNORE INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$10$HTpaXSAsLU7x.ckhvKF2o.jx9eV4g/caSeOVzpwcpkUhsVuMQvuwG', 'admin');
