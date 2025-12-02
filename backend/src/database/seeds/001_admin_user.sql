-- Seed initial admin user
-- Password: admin123 (bcrypt hash)
INSERT OR IGNORE INTO users (username, password_hash, role) 
VALUES ('admin', '$2b$10$YQ98DpKaJWlY0kAmQCaveO7K7XqjW2WwY72JZ.RyGHJ8YnNVqhK4u', 'admin');
