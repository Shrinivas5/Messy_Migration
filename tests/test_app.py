import os
import sys
import unittest
import json
import tempfile
from flask import Flask

# Add parent directory to path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database import init_db

class UserAPITestCase(unittest.TestCase):
    """Test case for the user management API"""
    
    def setUp(self):
        """Set up test client and database"""
        # Create a temporary file for the test database
        self.db_fd, app.config['DATABASE'] = tempfile.mkstemp()
        app.config['TESTING'] = True
        self.client = app.test_client()
        
        # Initialize the test database
        with app.app_context():
            init_db()
    
    def tearDown(self):
        """Clean up after tests"""
        os.close(self.db_fd)
        os.unlink(app.config['DATABASE'])
    
    def test_home(self):
        """Test the home endpoint"""
        response = self.client.get('/')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'ok')
        self.assertEqual(data['message'], 'User Management System')
    
    def test_get_all_users(self):
        """Test getting all users"""
        response = self.client.get('/users')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 3)  # 3 sample users
    
    def test_get_user(self):
        """Test getting a specific user"""
        # Get a valid user
        response = self.client.get('/user/1')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['id'], 1)
        self.assertEqual(data['name'], 'John Doe')
        
        # Get a non-existent user
        response = self.client.get('/user/999')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 404)
        self.assertIn('error', data)
    
    def test_create_user(self):
        """Test creating a new user"""
        # Valid user data
        user_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(
            '/users',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(data['status'], 'success')
        self.assertIn('id', data)
        
        # Invalid user data (missing fields)
        invalid_data = {
            'name': 'Test User'
        }
        
        response = self.client.post(
            '/users',
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 400)
        
        # Duplicate email
        response = self.client.post(
            '/users',
            data=json.dumps(user_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 409)
    
    def test_update_user(self):
        """Test updating a user"""
        # Valid update
        update_data = {
            'name': 'Updated Name',
            'email': 'updated@example.com'
        }
        
        response = self.client.put(
            '/user/1',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        
        # Verify the update
        response = self.client.get('/user/1')
        data = json.loads(response.data)
        
        self.assertEqual(data['name'], 'Updated Name')
        self.assertEqual(data['email'], 'updated@example.com')
        
        # Update non-existent user
        response = self.client.put(
            '/user/999',
            data=json.dumps(update_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 404)
    
    def test_delete_user(self):
        """Test deleting a user"""
        # Delete existing user
        response = self.client.delete('/user/1')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        
        # Verify user is deleted
        response = self.client.get('/user/1')
        self.assertEqual(response.status_code, 404)
        
        # Delete non-existent user
        response = self.client.delete('/user/999')
        self.assertEqual(response.status_code, 404)
    
    def test_search_users(self):
        """Test searching users by name"""
        # Valid search
        response = self.client.get('/search?name=John')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'John Doe')
        
        # Search with no results
        response = self.client.get('/search?name=NonExistent')
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 0)
        
        # Search with missing parameter
        response = self.client.get('/search')
        self.assertEqual(response.status_code, 400)
    
    def test_login(self):
        """Test user login"""
        # Valid login
        login_data = {
            'email': 'john@example.com',
            'password': 'password123'
        }
        
        response = self.client.post(
            '/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        data = json.loads(response.data)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'success')
        self.assertIn('user_id', data)
        
        # Invalid credentials
        invalid_login = {
            'email': 'john@example.com',
            'password': 'wrongpassword'
        }
        
        response = self.client.post(
            '/login',
            data=json.dumps(invalid_login),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)
        
        # Non-existent user
        nonexistent_login = {
            'email': 'nonexistent@example.com',
            'password': 'password123'
        }
        
        response = self.client.post(
            '/login',
            data=json.dumps(nonexistent_login),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 401)

if __name__ == '__main__':
    unittest.main()
