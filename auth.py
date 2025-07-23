import bcrypt
import logging

logger = logging.getLogger(__name__)

def hash_password(password):
    """Hash a password using bcrypt"""
    try:
        # Generate a salt and hash the password
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Error hashing password: {str(e)}")
        raise Exception("Failed to hash password")

def verify_password(plain_password, hashed_password):
    """Verify a password against a hash"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        logger.error(f"Error verifying password: {str(e)}")
        return False
