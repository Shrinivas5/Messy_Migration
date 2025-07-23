# User Management System - Refactored

A secure, production-ready Flask API for user management that has been completely refactored from a legacy codebase to address critical security vulnerabilities and improve code quality.

## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/Shrinivas5/Messy_Migration

cd messy-migration

# Install dependencies
pip install -r requirements.txt

# Initialize the database
python init_db.py

# Start the application
python app.py
\`\`\`

The application will be available at **http://127.0.0.1:5000**

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Testing](#testing)
- [Security](#security)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)

## 🎯 Overview

This project is a complete refactoring of a legacy Flask user management API. The original codebase had critical security vulnerabilities including SQL injection, plain text password storage, and poor code organization. This refactored version addresses all these issues while maintaining full backward compatibility.

### Key Improvements

- ✅ **Security**: Fixed SQL injection, implemented password hashing, added input validation
- ✅ **Code Organization**: Modular structure with separation of concerns
- ✅ **Best Practices**: Proper error handling, HTTP status codes, logging
- ✅ **Testing**: Comprehensive test suite for critical functionality
- ✅ **Documentation**: Clear code documentation and setup instructions

## ✨ Features

- **User Management**: Create, read, update, delete users
- **Authentication**: Secure login with bcrypt password hashing
- **Search**: Find users by name with partial matching
- **Validation**: Comprehensive input validation and sanitization
- **Security**: SQL injection prevention, secure password storage
- **Testing**: Unit tests for all critical functionality
- **Web Interface**: Optional web UI for easy testing and demonstration

## 🛠 Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)

### Step-by-Step Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd messy-migration
   \`\`\`

2. **Create a virtual environment (recommended)**
   \`\`\`bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   \`\`\`

3. **Install dependencies**
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`

4. **Initialize the database**
   \`\`\`bash
   python init_db.py
   \`\`\`

5. **Start the application**
   \`\`\`bash
   python app.py
   \`\`\`

6. **Verify installation**
   - Open http://127.0.0.1:5000 in your browser
   - You should see the web interface with sample users loaded

## 📡 API Endpoints

### Base URL: `http://127.0.0.1:5000`

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| GET | `/` | Web interface | - |
| GET | `/api` | API health check | - |
| GET | `/users` | Get all users | - |
| GET | `/user/<id>` | Get specific user | - |
| POST | `/users` | Create new user | `{"name": "string", "email": "string", "password": "string"}` |
| PUT | `/user/<id>` | Update user | `{"name": "string", "email": "string"}` |
| DELETE | `/user/<id>` | Delete user | - |
| GET | `/search?name=<name>` | Search users by name | - |
| POST | `/login` | User login | `{"email": "string", "password": "string"}` |

### Response Format

All API responses follow this format:

**Success Response:**
\`\`\`json
{
  "status": "success",
  "message": "Operation completed",
  "data": {...}
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "error": "Error description"
}
\`\`\`

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication failed)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## 💡 Usage Examples

### Using curl

**Get all users:**
\`\`\`bash
curl http://127.0.0.1:5000/users
\`\`\`

**Create a new user:**
\`\`\`bash
curl -X POST http://127.0.0.1:5000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
\`\`\`

**Login:**
\`\`\`bash
curl -X POST http://127.0.0.1:5000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
\`\`\`

**Search users:**
\`\`\`bash
curl "http://127.0.0.1:5000/search?name=John"
\`\`\`

**Update user:**
\`\`\`bash
curl -X PUT http://127.0.0.1:5000/user/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","email":"johnsmith@example.com"}'
\`\`\`

**Delete user:**
\`\`\`bash
curl -X DELETE http://127.0.0.1:5000/user/1
\`\`\`

### Using Python requests

```python
import requests

# Get all users
response = requests.get('http://127.0.0.1:5000/users')
users = response.json()

# Create a user
user_data = {
    "name": "Jane Doe",
    "email": "jane@example.com", 
    "password": "securepass123"
}
response = requests.post('http://127.0.0.1:5000/users', json=user_data)

# Login
login_data = {"email": "jane@example.com", "password": "securepass123"}
response = requests.post('http://127.0.0.1:5000/login', json=login_data)
