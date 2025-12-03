-- Seed initial admin user
-- Password: admin123 (bcrypt hash)
INSERT OR IGNORE INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$10$HTpaXSAsLU7x.ckhvKF2o.jx9eV4g/caSeOVzpwcpkUhsVuMQvuwG', 'admin');

-- Seed operator user
-- Password: operator123 (bcrypt hash)
INSERT OR IGNORE INTO users (username, password_hash, role) 
VALUES ('operator', '$2b$10$kjD4s9Kx3sf5pfG/S63I8usESaWfOC6pL3uMAfFaqBpqKd36hf4Sa', 'operator');
