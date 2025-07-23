import sqlite3
import os
from flask import g, current_app
import logging

logger = logging.getLogger(__name__)

def get_db():
    """Connect to the database and return the connection"""
    if 'db' not in g:
        try:
            g.db = sqlite3.connect(
                current_app.config['DATABASE'],
                detect_types=sqlite3.PARSE_DECLTYPES
            )
            g.db.row_factory = sqlite3.Row
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {str(e)}")
            raise Exception("Failed to connect to database")
    return g.db

def close_db(e=None):
    """Close the database connection"""
    db = g.pop('db', None)
    
    if db is not None:
        db.close()

def init_db():
    """Initialize the database with schema"""
    try:
        db = get_db()
        
        # Create users table if it doesn't exist
        db.execute('''
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
        db.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        db.execute('CREATE INDEX IF NOT EXISTS idx_users_name ON users(name)')
        
        db.commit()
        
        # Check if we need to seed data
        cursor = db.execute('SELECT COUNT(*) as count FROM users')
        count = cursor.fetchone()['count']
        
        if count == 0:
            seed_db(db)
            
    except sqlite3.Error as e:
        logger.error(f"Database initialization error: {str(e)}")
        raise Exception("Failed to initialize database")

def seed_db(db):
    """Seed the database with initial data"""
    try:
        from auth import hash_password
        
        # Sample users with hashed passwords
        users = [
            ('John Doe', 'john@example.com', hash_password('password123')),
            ('Jane Smith', 'jane@example.com', hash_password('secret456')),
            ('Bob Johnson', 'bob@example.com', hash_password('qwerty789'))
        ]
        
        for user in users:
            db.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                user
            )
        
        db.commit()
        logger.info("Database seeded with sample data")
        
    except sqlite3.Error as e:
        logger.error(f"Database seeding error: {str(e)}")
        raise Exception("Failed to seed database")
