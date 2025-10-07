"""
Complete Authentication System for ProWrite
Handles user registration, login, JWT tokens, and session management
"""

import os
import jwt
import bcrypt
import mysql.connector
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
import traceback

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'prowrite_db',
    'charset': 'utf8mb4'
}

class AuthSystem:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
        self.algorithm = 'HS256'
        self.token_expiry_hours = 24
        
    def get_db_connection(self):
        """Get database connection with error handling"""
        try:
            connection = mysql.connector.connect(**DB_CONFIG)
            return connection
        except mysql.connector.Error as e:
            import logging
            logging.error(f"Database connection error: {e}")
            return None
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def create_user(self, email: str, password: str, first_name: str, last_name: str):
        """Create a new user in the database"""
        connection = self.get_db_connection()
        if not connection:
            return {"error": "Database connection failed"}, 500
            
        try:
            cursor = connection.cursor()
            
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return {"error": "User already exists"}, 400
            
            # Hash password
            hashed_password = self.hash_password(password)
            
            # Insert new user
            cursor.execute("""
                INSERT INTO users (email, password, first_name, last_name, created_at, updated_at)
                VALUES (%s, %s, %s, %s, NOW(), NOW())
            """, (email, hashed_password, first_name, last_name))
            
            user_id = cursor.lastrowid
            connection.commit()
            
            # Get user data
            cursor.execute("""
                SELECT id, email, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            
            user_data = cursor.fetchone()
            user = {
                "id": user_data[0],
                "email": user_data[1],
                "firstName": user_data[2],
                "lastName": user_data[3],
                "isPremium": user_data[4],
                "is_admin": user_data[5],
                "createdAt": user_data[6].isoformat() if user_data[6] else None
            }
            
            return {"user": user, "message": "User created successfully"}, 201
            
        except mysql.connector.Error as e:
            import logging
            logging.error(f"Database error: {e}")
            return {"error": "Database error occurred"}, 500
        except Exception as e:
            import logging
            logging.error(f"Unexpected error: {e}")
            return {"error": "An unexpected error occurred"}, 500
        finally:
            if connection:
                connection.close()
    
    def authenticate_user(self, email: str, password: str):
        """Authenticate user and return user data if valid"""
        connection = self.get_db_connection()
        if not connection:
            return {"error": "Database connection failed"}, 500
            
        try:
            cursor = connection.cursor()
            
            # Get user data
            cursor.execute("""
                SELECT id, email, password, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE email = %s
            """, (email,))
            
            user_data = cursor.fetchone()
            if not user_data:
                return {"error": "Invalid credentials"}, 401
            
            # Verify password
            if not self.verify_password(password, user_data[2]):
                return {"error": "Invalid credentials"}, 401
            
            # Return user data
            user = {
                "id": user_data[0],
                "email": user_data[1],
                "firstName": user_data[3],
                "lastName": user_data[4],
                "isPremium": user_data[5],
                "is_admin": user_data[6],
                "createdAt": user_data[7].isoformat() if user_data[7] else None
            }
            
            return {"user": user}, 200
            
        except mysql.connector.Error as e:
            import logging
            logging.error(f"Database error: {e}")
            return {"error": "Database error occurred"}, 500
        except Exception as e:
            import logging
            logging.error(f"Unexpected error: {e}")
            return {"error": "An unexpected error occurred"}, 500
        finally:
            if connection:
                connection.close()
    
    def create_access_token(self, user_data: dict) -> str:
        """Create JWT access token"""
        try:
            # Create token payload
            payload = {
                'user_id': user_data['id'],
                'email': user_data['email'],
                'is_admin': user_data.get('is_admin', 0),
                'exp': datetime.utcnow() + timedelta(hours=self.token_expiry_hours),
                'iat': datetime.utcnow(),
                'type': 'access'
            }
            
            # Generate token
            token = jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
            return token
            
        except Exception as e:
            print(f"Token creation error: {e}")
            raise e
    
    def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return {"error": "Token expired"}
        except jwt.InvalidTokenError:
            return {"error": "Invalid token"}
        except Exception as e:
            print(f"Token verification error: {e}")
            return {"error": "Token verification failed"}
    
    def get_user_by_id(self, user_id: int):
        """Get user data by ID"""
        connection = self.get_db_connection()
        if not connection:
            return None
            
        try:
            cursor = connection.cursor()
            cursor.execute("""
                SELECT id, email, first_name, last_name, is_premium, is_admin, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            
            user_data = cursor.fetchone()
            if not user_data:
                return None
            
            user = {
                "id": user_data[0],
                "email": user_data[1],
                "firstName": user_data[2],
                "lastName": user_data[3],
                "isPremium": user_data[4],
                "is_admin": user_data[5],
                "createdAt": user_data[6].isoformat() if user_data[6] else None
            }
            
            return user
            
        except mysql.connector.Error as e:
            import logging
            logging.error(f"Database error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error: {e}")
            return None
        finally:
            if connection:
                connection.close()

# Initialize auth system
auth_system = AuthSystem()

# JWT decorator for protected routes
def jwt_required_custom(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        else:
            return jsonify({"error": "No token provided"}), 401
        
        if not token:
            return jsonify({"error": "No token provided"}), 401
        
        # Verify token
        payload = auth_system.verify_token(token)
        if 'error' in payload:
            return jsonify({"error": payload['error']}), 401
        
        # Add user info to request context
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated_function

# Auth routes
def register_auth_routes(app):
    """Register authentication routes with Flask app"""
    
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['email', 'password', 'firstName', 'lastName']
            for field in required_fields:
                if not data.get(field):
                    return jsonify({"error": f"{field} is required"}), 400
            
            # Create user
            result, status_code = auth_system.create_user(
                email=data['email'],
                password=data['password'],
                first_name=data['firstName'],
                last_name=data['lastName']
            )
            
            if status_code != 201:
                return jsonify(result), status_code
            
            # Create access token
            access_token = auth_system.create_access_token(result['user'])
            
            return jsonify({
                "message": "User registered successfully",
                "access_token": access_token,
                "user": result['user']
            }), 201
            
        except Exception as e:
            print(f"Registration error: {e}")
            traceback.print_exc()
            return jsonify({"error": "Registration failed"}), 500
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('email') or not data.get('password'):
                return jsonify({"error": "Email and password are required"}), 400
            
            # Authenticate user
            result, status_code = auth_system.authenticate_user(
                email=data['email'],
                password=data['password']
            )
            
            if status_code != 200:
                return jsonify(result), status_code
            
            # Create access token
            access_token = auth_system.create_access_token(result['user'])
            
            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "user": result['user']
            }), 200
            
        except Exception as e:
            import logging
            logging.error(f"Login error: {e}")
            return jsonify({"error": "Login failed"}), 500
    
    @app.route('/api/auth/me', methods=['GET'])
    @jwt_required_custom
    def get_current_user():
        try:
            user_id = request.current_user['user_id']
            user = auth_system.get_user_by_id(user_id)
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            return jsonify({"user": user}), 200
            
        except Exception as e:
            print(f"Get user error: {e}")
            traceback.print_exc()
            return jsonify({"error": "Failed to get user data"}), 500
    
    @app.route('/api/auth/refresh', methods=['POST'])
    @jwt_required_custom
    def refresh_token():
        try:
            user_id = request.current_user['user_id']
            user = auth_system.get_user_by_id(user_id)
            
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            # Create new access token
            access_token = auth_system.create_access_token(user)
            
            return jsonify({
                "message": "Token refreshed successfully",
                "access_token": access_token
            }), 200
            
        except Exception as e:
            print(f"Token refresh error: {e}")
            traceback.print_exc()
            return jsonify({"error": "Token refresh failed"}), 500
    
    @app.route('/api/auth/logout', methods=['POST'])
    @jwt_required_custom
    def logout():
        try:
            # In a real app, you might want to blacklist the token
            # For now, we'll just return success
            return jsonify({"message": "Logout successful"}), 200
            
        except Exception as e:
            print(f"Logout error: {e}")
            traceback.print_exc()
            return jsonify({"error": "Logout failed"}), 500

# Error handlers
def register_auth_error_handlers(app):
    """Register JWT error handlers"""
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized access"}), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden access"}), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Internal server error"}), 500
