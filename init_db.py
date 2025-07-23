import sqlite3
import os
import bcrypt

def hash_password(password):
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def init_db():
    """Initialize the database with schema and sample data"""
    # Create or connect to the database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create indexes for better performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_name ON users(name)')
    
    # Check if we need to seed data
    cursor.execute('SELECT COUNT(*) as count FROM users')
    count = cursor.fetchone()[0]
    
    if count == 0:
        # Sample users with hashed passwords
        users = [
            ('John Doe', 'john@example.com', hash_password('password123')),
            ('Jane Smith', 'jane@example.com', hash_password('secret456')),
            ('Bob Johnson', 'bob@example.com', hash_password('qwerty789'))
        ]
        
        for user in users:
            cursor.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                user
            )
        
        print("Database initialized with sample data")
    else:
        print("Database already contains data, skipping initialization")
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
