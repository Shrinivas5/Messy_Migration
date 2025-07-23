from flask import Flask, request, jsonify, g, send_from_directory
import os
from werkzeug.exceptions import BadRequest, NotFound, Conflict, Unauthorized
import logging
from dotenv import load_dotenv

# Import modules
from database import init_db, get_db, close_db
from models import User
from validators import validate_user_data, validate_user_update, validate_login
from auth import hash_password, verify_password

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.config['DATABASE'] = os.getenv('DATABASE_PATH', 'users.db')

# Register database connection handlers
@app.teardown_appcontext
def teardown_db(exception):
    close_db(exception)

# Initialize database if it doesn't exist
with app.app_context():
    init_db()

# Serve static files
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Main page - serve the HTML interface
@app.route('/')
def home():
    """Main page - serve the web interface"""
    return send_from_directory('static', 'index.html')

# API health check endpoint
@app.route('/api')
def api_info():
    """API information endpoint"""
    return jsonify({
        "status": "ok", 
        "message": "User Management System API",
        "version": "1.0",
        "endpoints": {
            "health": "/api",
            "users": "/users",
            "user": "/user/<id>",
            "search": "/search?name=<name>",
            "login": "/login"
        }
    })

@app.route('/users', methods=['GET'])
def get_all_users():
    """Get all users"""
    try:
        db = get_db()
        users = User.get_all(db)
        return jsonify(users)
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"error": "Failed to fetch users"}), 500

@app.route('/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID"""
    try:
        db = get_db()
        user = User.get_by_id(db, user_id)
        
        if user:
            return jsonify(user)
        else:
            raise NotFound("User not found")
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {str(e)}")
        return jsonify({"error": "Failed to fetch user"}), 500

@app.route('/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("Invalid JSON data")
        
        # Validate input data
        errors = validate_user_data(data)
        if errors:
            return jsonify({"error": errors}), 400
        
        name = data['name']
        email = data['email']
        password = data['password']
        
        db = get_db()
        
        # Check if user with email already exists
        existing_user = User.get_by_email(db, email)
        if existing_user:
            raise Conflict("User with this email already exists")
        
        # Hash password
        hashed_password = hash_password(password)
        
        # Create user
        user_id = User.create(db, name, email, hashed_password)
        
        logger.info(f"User created successfully with ID: {user_id}")
        return jsonify({"status": "success", "message": "User created", "id": user_id}), 201
    
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Conflict as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({"error": "Failed to create user"}), 500

@app.route('/user/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update an existing user"""
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("Invalid JSON data")
        
        # Validate input data
        errors = validate_user_update(data)
        if errors:
            return jsonify({"error": errors}), 400
        
        name = data.get('name')
        email = data.get('email')
        
        db = get_db()
        
        # Check if user exists
        existing_user = User.get_by_id(db, user_id)
        if not existing_user:
            raise NotFound("User not found")
        
        # Check if email is already taken by another user
        if email and email != existing_user['email']:
            email_user = User.get_by_email(db, email)
            if email_user and str(email_user['id']) != user_id:
                raise Conflict("Email already taken by another user")
        
        # Update user
        User.update(db, user_id, name, email)
        
        logger.info(f"User {user_id} updated successfully")
        return jsonify({"status": "success", "message": "User updated"})
    
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Conflict as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        return jsonify({"error": "Failed to update user"}), 500

@app.route('/user/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    try:
        db = get_db()
        
        # Check if user exists
        existing_user = User.get_by_id(db, user_id)
        if not existing_user:
            raise NotFound("User not found")
        
        # Delete user
        User.delete(db, user_id)
        
        logger.info(f"User {user_id} deleted successfully")
        return jsonify({"status": "success", "message": "User deleted"})
    
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        logger.error(f"Error deleting user {user_id}: {str(e)}")
        return jsonify({"error": "Failed to delete user"}), 500

@app.route('/search', methods=['GET'])
def search_users():
    """Search users by name"""
    try:
        name = request.args.get('name')
        
        if not name:
            return jsonify({"error": "Please provide a name to search"}), 400
        
        db = get_db()
        users = User.search_by_name(db, name)
        
        return jsonify(users)
    
    except Exception as e:
        logger.error(f"Error searching users: {str(e)}")
        return jsonify({"error": "Failed to search users"}), 500

@app.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        if not data:
            raise BadRequest("Invalid JSON data")
        
        # Validate login data
        errors = validate_login(data)
        if errors:
            return jsonify({"error": errors}), 400
        
        email = data['email']
        password = data['password']
        
        db = get_db()
        user = User.get_by_email_with_password(db, email)
        
        if not user:
            raise Unauthorized("Invalid credentials")
        
        # Verify password
        if not verify_password(password, user['password']):
            raise Unauthorized("Invalid credentials")
        
        logger.info(f"User {user['id']} logged in successfully")
        return jsonify({"status": "success", "user_id": user['id']})
    
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Unauthorized as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        return jsonify({"error": "Login failed"}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(error):
    logger.error(f"Server error: {str(error)}")
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Create static directory if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 5000))
    
    # Only enable debug mode in development
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    print(f"Starting Flask server on http://127.0.0.1:{port}")
    print("Available endpoints:")
    print("  GET  /           - Web interface")
    print("  GET  /api        - API health check")
    print("  GET  /users      - Get all users")
    print("  GET  /user/<id>  - Get specific user")
    print("  POST /users      - Create new user")
    print("  PUT  /user/<id>  - Update user")
    print("  DELETE /user/<id> - Delete user")
    print("  GET  /search?name=<name> - Search users")
    print("  POST /login      - User login")
    print()
    print("🌐 Web Interface: http://127.0.0.1:5000")
    print("📡 API Info: http://127.0.0.1:5000/api")
    print()
    
    app.run(host='127.0.0.1', port=port, debug=debug)
