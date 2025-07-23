import os
import sys
import unittest

# Add parent directory to path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from auth import hash_password, verify_password

class AuthTestCase(unittest.TestCase):
    """Test case for the auth module"""
    
    def test_password_hashing(self):
        """Test password hashing and verification"""
        password = 'test_password'
        
        # Hash the password
        hashed = hash_password(password)
        
        # Verify the hash is not the original password
        self.assertNotEqual(password, hashed)
        
        # Verify the password against the hash
        self.assertTrue(verify_password(password, hashed))
        
        # Verify incorrect password fails
        self.assertFalse(verify_password('wrong_password', hashed))
        
        # Verify different hashes for same password
        hashed2 = hash_password(password)
        self.assertNotEqual(hashed, hashed2)

if __name__ == '__main__':
    unittest.main()
