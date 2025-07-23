import sqlite3
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class User:
    """User model for database operations"""
    
    @staticmethod
    def get_all(db):
        """Get all users"""
        try:
            cursor = db.execute(
                'SELECT id, name, email, created_at, updated_at FROM users ORDER BY id'
            )
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            logger.error(f"Error getting all users: {str(e)}")
            raise Exception("Database error")
    
    @staticmethod
    def get_by_id(db, user_id):
        """Get user by ID"""
        try:
            cursor = db.execute(
                'SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?',
                (user_id,)
            )
            user = cursor.fetchone()
            return dict(user) if user else None
        except sqlite3.Error as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            raise Exception("Database error")
    
    @staticmethod
    def get_by_email(db, email):
        """Get user by email"""
        try:
            cursor = db.execute(
                'SELECT id, name, email, created_at, updated_at FROM users WHERE email = ?',
                (email,)
            )
            user = cursor.fetchone()
            return dict(user) if user else None
        except sqlite3.Error as e:
            logger.error(f"Error getting user by email: {str(e)}")
            raise Exception("Database error")
    
    @staticmethod
    def get_by_email_with_password(db, email):
        """Get user by email including password"""
        try:
            cursor = db.execute(
                'SELECT id, name, email, password, created_at, updated_at FROM users WHERE email = ?',
                (email,)
            )
            user = cursor.fetchone()
            return dict(user) if user else None
        except sqlite3.Error as e:
            logger.error(f"Error getting user by email with password: {str(e)}")
            raise Exception("Database error")
    
    @staticmethod
    def create(db, name, email, hashed_password):
        """Create a new user"""
        try:
            cursor = db.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                (name, email, hashed_password)
            )
            db.commit()
            return cursor.lastrowid
        except sqlite3.Error as e:
            db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            raise Exception("Database error")
    
    @staticmethod
    def update(db, user_id, name, email):
        """Update an existing user"""
        try:
            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            db.execute(
                'UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?',
                (name, email, now, user_id)
            )
            db.commit()
            return True
        except sqlite3.Error as e:
            db.rollback()
            logger.error(f"Error updating user: {str(e)}")
            raise Exception("Database error")
    
    @staticmethod
    def delete(db, user_id):
        """Delete a user"""
        try:
            db.execute('DELETE FROM users WHERE id = ?', (user_id,))
            db.commit()
            return True
        except sqlite3.Error as e:
            db.rollback()
            logger.error(f"Error deleting user: {str(e)}")
            raise Exception("Database error")
    
    @staticmethod
    def search_by_name(db, name):
        """Search users by name"""
        try:
            cursor = db.execute(
                'SELECT id, name, email, created_at, updated_at FROM users WHERE name LIKE ? ORDER BY name',
                (f'%{name}%',)
            )
            return [dict(row) for row in cursor.fetchall()]
        except sqlite3.Error as e:
            logger.error(f"Error searching users by name: {str(e)}")
            raise Exception("Database error")
