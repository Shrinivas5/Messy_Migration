import re

def validate_user_data(data):
    """Validate user creation data"""
    errors = []
    
    # Validate name
    if 'name' not in data or not data['name'] or not isinstance(data['name'], str):
        errors.append("Name is required and must be a non-empty string")
    elif len(data['name']) > 100:
        errors.append("Name must be less than 100 characters")
    
    # Validate email
    if 'email' not in data or not data['email'] or not isinstance(data['email'], str):
        errors.append("Email is required and must be a string")
    elif not is_valid_email(data['email']):
        errors.append("Email must be a valid email address")
    
    # Validate password
    if 'password' not in data or not data['password'] or not isinstance(data['password'], str):
        errors.append("Password is required and must be a string")
    elif len(data['password']) < 6:
        errors.append("Password must be at least 6 characters long")
    elif len(data['password']) > 128:
        errors.append("Password must be less than 128 characters")
    
    return errors[0] if errors else None

def validate_user_update(data):
    """Validate user update data"""
    errors = []
    
    # Validate name
    if 'name' not in data or not data['name'] or not isinstance(data['name'], str):
        errors.append("Name is required and must be a non-empty string")
    elif len(data['name']) > 100:
        errors.append("Name must be less than 100 characters")
    
    # Validate email
    if 'email' not in data or not data['email'] or not isinstance(data['email'], str):
        errors.append("Email is required and must be a string")
    elif not is_valid_email(data['email']):
        errors.append("Email must be a valid email address")
    
    return errors[0] if errors else None

def validate_login(data):
    """Validate login data"""
    errors = []
    
    # Validate email
    if 'email' not in data or not data['email'] or not isinstance(data['email'], str):
        errors.append("Email is required")
    elif not is_valid_email(data['email']):
        errors.append("Email must be a valid email address")
    
    # Validate password
    if 'password' not in data or not data['password'] or not isinstance(data['password'], str):
        errors.append("Password is required")
    
    return errors[0] if errors else None

def is_valid_email(email):
    """Check if email is valid"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None and len(email) <= 254
