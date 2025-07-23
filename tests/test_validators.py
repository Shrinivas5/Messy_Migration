import os
import sys
import unittest

# Add parent directory to path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from validators import validate_user_data, validate_user_update, validate_login, is_valid_email

class ValidatorsTestCase(unittest.TestCase):
    """Test case for the validators module"""
    
    def test_is_valid_email(self):
        """Test email validation"""
        # Valid emails
        self.assertTrue(is_valid_email('test@example.com'))
        self.assertTrue(is_valid_email('user.name+tag@example.co.uk'))
        self.assertTrue(is_valid_email('user123@sub.domain.com'))
        
        # Invalid emails
        self.assertFalse(is_valid_email('invalid'))
        self.assertFalse(is_valid_email('invalid@'))
        self.assertFalse(is_valid_email('@example.com'))
        self.assertFalse(is_valid_email('user@.com'))
        self.assertFalse(is_valid_email('user@example'))
    
    def test_validate_user_data(self):
        """Test user data validation"""
        # Valid data
        valid_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'password123'
        }
        self.assertIsNone(validate_user_data(valid_data))
        
        # Missing name
        invalid_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        self.assertIsNotNone(validate_user_data(invalid_data))
        
        # Empty name
        invalid_data = {
            'name': '',
            'email': 'test@example.com',
            'password': 'password123'
        }
        self.assertIsNotNone(validate_user_data(invalid_data))
        
        # Invalid email
        invalid_data = {
            'name': 'Test User',
            'email': 'invalid-email',
            'password': 'password123'
        }
        self.assertIsNotNone(validate_user_data(invalid_data))
        
        # Short password
        invalid_data = {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': '123'
        }
        self.assertIsNotNone(validate_user_data(invalid_data))
    
    def test_validate_user_update(self):
        """Test user update validation"""
        # Valid data
        valid_data = {
            'name': 'Updated Name',
            'email': 'updated@example.com'
        }
        self.assertIsNone(validate_user_update(valid_data))
        
        # Missing name
        invalid_data = {
            'email': 'updated@example.com'
        }
        self.assertIsNotNone(validate_user_update(invalid_data))
        
        # Invalid email
        invalid_data = {
            'name': 'Updated Name',
            'email': 'invalid-email'
        }
        self.assertIsNotNone(validate_user_update(invalid_data))
    
    def test_validate_login(self):
        """Test login validation"""
        # Valid data
        valid_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        self.assertIsNone(validate_login(valid_data))
        
        # Missing email
        invalid_data = {
            'password': 'password123'
        }
        self.assertIsNotNone(validate_login(invalid_data))
        
        # Missing password
        invalid_data = {
            'email': 'test@example.com'
        }
        self.assertIsNotNone(validate_login(invalid_data))
        
        # Invalid email
        invalid_data = {
            'email': 'invalid-email',
            'password': 'password123'
        }
        self.assertIsNotNone(validate_login(invalid_data))

if __name__ == '__main__':
    unittest.main()
