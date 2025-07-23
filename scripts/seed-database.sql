-- Seed the database with sample users
-- Note: These passwords are hashed versions of the original passwords
INSERT OR IGNORE INTO users (name, email, password) VALUES 
('John Doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PJ/..G'),
('Jane Smith', 'jane@example.com', '$2a$12$EhRVVmhoBGMp1Vr5FZkgUe4HGVz1ttMILBacH/iuxtmUkrjHuIzAa'),
('Bob Johnson', 'bob@example.com', '$2a$12$YQjGxrogJ0XqfMEJd4tCPe5sI4/B/2o5XapZhGGvdMDvp5oQ7VDaq');
